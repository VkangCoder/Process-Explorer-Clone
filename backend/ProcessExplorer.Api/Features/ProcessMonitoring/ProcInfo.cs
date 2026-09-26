namespace ProcessExplorer.Api.Features.ProcessMonitoring;

public record ProcInfo
(
    int Pid,
    int ParentPid,
    string Name,
    double Cpu,
    long WorkingSetKb,
    long PrivateBytesKb,
    int ThreadCount,
    int HandleCount,
    double DiskKbPerSec,
    long StartTimeUnixMs,
    string? ExecutablePath
);
