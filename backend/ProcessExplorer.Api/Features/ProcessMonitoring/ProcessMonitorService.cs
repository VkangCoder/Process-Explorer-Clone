namespace ProcessExplorer.Api.Features.ProcessMonitoring;

using Microsoft.AspNetCore.SignalR;
using ProcessExplorer.Api.Interop;
using ProcessExplorer.Api.Persistence;
using System.ComponentModel;
using System.Diagnostics;

public class ProcessMonitorService : BackgroundService
{
    private readonly Dictionary<int, long> _previousCpu = new();
    private readonly Dictionary<int, long> _previousIo = new();


    private readonly Dictionary<int, string?> _exePathCache = new();
    private readonly Dictionary<int, bool> _isDotNetCache = new();
    private readonly Dictionary<int, string?> _ownerCache = new();
    private readonly Dictionary<string, bool> _packedCache = new();
    private HashSet<int> _servicePids = new();

    private readonly int _coreCount = Environment.ProcessorCount;
    private readonly int _ownProcessId = Environment.ProcessId;
    private long _previousTimestamp = Stopwatch.GetTimestamp();
    private int _tickCount;

    private readonly IHubContext<ProcessHub> _hub;
    private readonly ProcessSampleRepository _repository;

    public ProcessMonitorService(IHubContext<ProcessHub> hub, ProcessSampleRepository repository)
    {
        _hub = hub;
        _repository = repository;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            long now = Stopwatch.GetTimestamp();
            long wallDelta = Stopwatch.GetElapsedTime(_previousTimestamp, now).Ticks;

            var currentCpu = new Dictionary<int, long>();
            var currentIo = new Dictionary<int, long>();
            var parentMap = ProcessTreeNative.GetParentMap();
            var list = new List<ProcInfo>();

            // Service membership rarely changes; re-enumerate every 5 ticks instead of every tick.
            if (_tickCount % 5 == 0)
                _servicePids = ServiceNative.GetServicePids();

            foreach (var p in Process.GetProcesses())
            {
                int pid = p.Id;

                int parentPid = -1;
                int threadCount = 0;
                if (parentMap.TryGetValue(pid, out var info))
                {
                    parentPid = info.parent;
                    threadCount = info.threads;
                }

                double cpuPercent = 0;
                long cpuNow = -1;
                int handleCount = 0;

                try { cpuNow = p.TotalProcessorTime.Ticks; }
                catch (Win32Exception) { }
                catch (InvalidOperationException) { p.Dispose(); continue; }

                try { handleCount = p.HandleCount; }
                catch (Win32Exception) { }
                catch (InvalidOperationException) { p.Dispose(); continue; }

                long startTimeMs = 0;
                try
                {
                    startTimeMs = new DateTimeOffset(p.StartTime).ToUnixTimeMilliseconds();
                }
                catch (Win32Exception) { }
                catch (InvalidOperationException) { p.Dispose(); continue; }

                if (cpuNow >= 0)
                {
                    currentCpu[pid] = cpuNow;
                    if (wallDelta > 0 && _previousCpu.TryGetValue(pid, out long cpuPrev))
                        cpuPercent = (double)(cpuNow - cpuPrev) / (wallDelta * _coreCount) * 100;
                }

                double diskKbPerSec = 0;
                long ioNow = ProcessIoNative.GetTotalIoBytes(pid);
                if (ioNow >= 0)
                {
                    currentIo[pid] = ioNow;
                    if (wallDelta > 0 && _previousIo.TryGetValue(pid, out long ioPrev))
                    {
                        double elapsedSeconds = wallDelta / 10_000_000.0;
                        double deltaKb = (ioNow - ioPrev) / 1024.0;
                        diskKbPerSec = deltaKb / elapsedSeconds;
                    }
                }

                string name;
                long workingSetKb = 0;
                long privateBytesKb = 0;
                try
                {
                    name = p.ProcessName;
                    workingSetKb = p.WorkingSet64 / 1_024;
                    privateBytesKb = p.PrivateMemorySize64 / 1_024;
                }
                catch (InvalidOperationException) { p.Dispose(); continue; }
                catch (Win32Exception) { name = $"pid_{pid}"; }

                if (!_exePathCache.TryGetValue(pid, out string? exePath))
                {
                    exePath = ProcessPathNative.GetImagePath(pid);
                    if (exePath == null)
                    {
                        try { exePath = p.MainModule?.FileName; }
                        catch (Win32Exception) { }
                        catch (InvalidOperationException) { }
                    }
                    _exePathCache[pid] = exePath;
                }

                // Process.ProcessName has no extension (e.g. "svchost"). Prefer the real file
                // name from the resolved exe path so it matches what Process Explorer shows
                // ("svchost.exe"); protected processes without a resolvable path keep the bare name.
                if (!string.IsNullOrEmpty(exePath))
                {
                    string fileName = Path.GetFileName(exePath);
                    if (!string.IsNullOrEmpty(fileName))
                        name = fileName;
                }

                if (!_isDotNetCache.TryGetValue(pid, out bool isDotNet))
                {
                    isDotNet = DetectIsDotNet(p);
                    _isDotNetCache[pid] = isDotNet;
                }

                if (!_ownerCache.TryGetValue(pid, out string? userName))
                {
                    userName = ProcessOwnerNative.GetOwner(pid);
                    _ownerCache[pid] = userName;
                }

                bool isPacked = false;
                if (!string.IsNullOrEmpty(exePath))
                {
                    if (!_packedCache.TryGetValue(exePath, out isPacked))
                    {
                        isPacked = PackerHeuristic.LooksPacked(exePath);
                        _packedCache[exePath] = isPacked;
                    }
                }

                bool isOwnProcess = pid == _ownProcessId;
                bool isSuspended = DetectIsSuspended(p);
                bool isService = _servicePids.Contains(pid);

                list.Add(new ProcInfo(
                    pid,
                    parentPid,
                    name,
                    cpuPercent,
                    workingSetKb,
                    privateBytesKb,
                    threadCount,
                    handleCount,
                    diskKbPerSec,
                    startTimeMs,
                    exePath,
                    isService,
                    isDotNet,
                    isSuspended,
                    isOwnProcess,
                    isPacked,
                    userName));

                p.Dispose();
            }

            await _hub.Clients.All.SendAsync("snapshot", list, stoppingToken);

            _tickCount++;
            if (_tickCount % 5 == 0)
            {
                var samples = list.Select(p => new ProcessSample
                {
                    Timestamp = DateTime.UtcNow,
                    Meta = new SampleMeta { Pid = p.Pid, Name = p.Name },
                    Cpu = p.Cpu,
                    MemMb = p.WorkingSetKb / 1024,
                    HandleCount = p.HandleCount,
                }).ToList();

                _ = _repository.InsertManyAsync(samples, stoppingToken);
            }

            _previousCpu.Clear();
            foreach (var kv in currentCpu) _previousCpu[kv.Key] = kv.Value;

            _previousIo.Clear();
            foreach (var kv in currentIo) _previousIo[kv.Key] = kv.Value;

            var alivePids = new HashSet<int>(list.Count);
            foreach (var p in list) alivePids.Add(p.Pid);

            var deadPids = new List<int>();
            foreach (var cachedPid in _exePathCache.Keys)
                if (!alivePids.Contains(cachedPid))
                    deadPids.Add(cachedPid);
            foreach (var dead in deadPids)
            {
                _exePathCache.Remove(dead);
                _isDotNetCache.Remove(dead);
                _ownerCache.Remove(dead);
            }

            _previousTimestamp = now;

            await Task.Delay(1000, stoppingToken);
        }
    }

    private static bool DetectIsSuspended(Process p)
    {
        try
        {
            if (p.Threads.Count == 0)
                return false;

            foreach (ProcessThread thread in p.Threads)
            {
                if (thread.ThreadState != System.Diagnostics.ThreadState.Wait ||
                    thread.WaitReason != ThreadWaitReason.Suspended)
                    return false;
            }

            return true;
        }
        catch (Exception ex) when (ex is Win32Exception or InvalidOperationException or NotSupportedException)
        {
            return false;
        }
    }

    private static bool DetectIsDotNet(Process p)
    {
        try
        {
            foreach (ProcessModule module in p.Modules)
            {
                string moduleName = module.ModuleName;
                if (moduleName.Equals("clr.dll", StringComparison.OrdinalIgnoreCase) ||
                    moduleName.Equals("coreclr.dll", StringComparison.OrdinalIgnoreCase) ||
                    moduleName.Equals("clrjit.dll", StringComparison.OrdinalIgnoreCase) ||
                    moduleName.Equals("mscorwks.dll", StringComparison.OrdinalIgnoreCase))
                    return true;
            }
        }
        catch (Exception ex) when (ex is Win32Exception or InvalidOperationException or NotSupportedException)
        {
        }

        return false;
    }
}