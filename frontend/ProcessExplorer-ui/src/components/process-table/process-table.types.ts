import type { ProcInfo } from "../../types/ProcInfo";
import type { KillTarget } from "../../hooks/use-kill-process";
import type { RowTransientHighlight } from "./process-table.helpers";

export interface ProcessTableProps {
  processes: ProcInfo[];
  selectedPid?: number;
  onSelectPid?: (pid: number) => void;
  selectedRowKeys: number[];
  onSelectedRowKeysChange: (keys: number[]) => void;
  killProcesses: (targets: KillTarget[]) => void | Promise<void>;
  pendingPids: Set<number>;
  highlights?: Map<number, RowTransientHighlight>;
}

export interface ProcessTreeNode extends ProcInfo {
  key: number;
  children?: ProcessTreeNode[];
}
