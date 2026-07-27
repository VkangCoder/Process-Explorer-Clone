namespace ProcessExplorer.Api.Features.ProcessMonitoring;

using System.ComponentModel;
using System.Diagnostics;
using Microsoft.AspNetCore.SignalR;
using ProcessExplorer.Api.Interop;

public class ProcessMonitorService : BackgroundService
{
    private readonly Dictionary<int, long> _previousCpu = new();
    private readonly int _coreCount = Environment.ProcessorCount;
    private long _previousTimestamp = Stopwatch.GetTimestamp();

    private readonly IHubContext<ProcessHub> _hub;

    public ProcessMonitorService(IHubContext<ProcessHub> hub)
    {
        _hub = hub;
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

                if (cpuNow >= 0)
                {
                    currentCpu[pid] = cpuNow;
                    if (wallDelta > 0 && _previousCpu.TryGetValue(pid, out long cpuPrev))
                        cpuPercent = (double)(cpuNow - cpuPrev) / (wallDelta * _coreCount) * 100;
                }

                list.Add(new ProcInfo(pid, parentPid, p.ProcessName, cpuPercent, p.WorkingSet64 / 1_048_576, threadCount, handleCount));
                p.Dispose();
            }

            await _hub.Clients.All.SendAsync("snapshot", list, stoppingToken);

            _previousCpu.Clear();
            foreach (var kv in currentCpu) _previousCpu[kv.Key] = kv.Value;
            _previousTimestamp = now;



            await Task.Delay(1000, stoppingToken);
        }
    }
}

record ProcInfo(int Pid, int ParentPid, string Name, double Cpu, long MemMb, int ThreadCount, int HandleCount);