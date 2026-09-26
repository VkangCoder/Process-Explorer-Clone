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
    string? ExecutablePath,

    bool IsService,        // hồng
    bool IsDotNet,         // vàng
    bool IsSuspended,      // xám
    bool IsOwnProcess,     // xanh dương
    bool IsPacked,         // tím
    string? UserName
);
