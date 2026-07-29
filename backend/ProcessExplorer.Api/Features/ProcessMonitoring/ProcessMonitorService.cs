namespace ProcessExplorer.Api.Features.ProcessMonitoring;

using System.ComponentModel;
using System.Diagnostics;
using Microsoft.AspNetCore.SignalR;
using ProcessExplorer.Api.Interop;
using ProcessExplorer.Api.Persistence;

public class ProcessMonitorService : BackgroundService
{
    private readonly Dictionary<int, long> _previousCpu = new();
    private readonly Dictionary<int, long> _previousIo = new();
    private readonly int _coreCount = Environment.ProcessorCount;
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
            var parentMap = ProcessTreeNative.GetParentMap();
            var list = new List<ProcInfo>();
            var currentIo = new Dictionary<int, long>();

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
                long memMb = 0;
                try
                {
                    name = p.ProcessName;
                    memMb = p.WorkingSet64 / 1_048_576;
                }
                catch (InvalidOperationException) { p.Dispose(); continue; }
                catch (Win32Exception) { name = $"pid_{pid}"; }

                list.Add(new ProcInfo(pid, parentPid, name, cpuPercent, memMb,
                      threadCount, handleCount, diskKbPerSec, startTimeMs));
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
                    MemMb = p.MemMb,
                    HandleCount = p.HandleCount,
                }).ToList();

                _ = _repository.InsertManyAsync(samples, stoppingToken);
            }

            _previousCpu.Clear();
            foreach (var kv in currentCpu) _previousCpu[kv.Key] = kv.Value;

            _previousIo.Clear();
            foreach (var kv in currentIo) _previousIo[kv.Key] = kv.Value;

            _previousTimestamp = now;

            await Task.Delay(1000, stoppingToken);
        }
    }
}

