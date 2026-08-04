import type { ProcInfo } from "../../types/ProcInfo";
import type { KillTarget } from "../../hooks/use-kill-process";

export interface ProcessTableProps {
  processes: ProcInfo[];
  selectedPid?: number;
  onSelectPid?: (pid: number) => void;
  selectedRowKeys: number[];
  onSelectedRowKeysChange: (keys: number[]) => void;
  killProcesses: (targets: KillTarget[]) => void | Promise<void>;
  pendingPids: Set<number>;
}

export interface ProcessTreeNode extends ProcInfo {
  key: number;
  children?: ProcessTreeNode[];
}
