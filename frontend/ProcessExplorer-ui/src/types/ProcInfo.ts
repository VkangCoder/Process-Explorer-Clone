export interface ProcInfo {
    pid: number;
    parentPid: number;
    name: string;
    cpu: number;
    workingSetKb: number;
    privateBytesKb: number;
    threadCount: number;
    handleCount: number;
    diskKbPerSec: number;
    startTimeUnixMs: number;
    executablePath: string | null;
}
