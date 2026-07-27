export interface ProcInfo {
  pid: number;
  parentPid: number;
  name: string;
  cpu: number;
  memMb: number;
  threadCount: number;
  handleCount: number;
  diskKbPerSec: number;
}
