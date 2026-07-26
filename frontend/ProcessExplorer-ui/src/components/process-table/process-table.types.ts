import type { ProcInfo } from "../../types/ProcInfo";

export interface ProcessTableProps {
  processes: ProcInfo[];
  selectedPid?: number;
  onSelectPid?: (pid: number) => void;
}

// Node cho antd Table: process + mảng con lồng bên trong (Table tự vẽ expand/collapse).
export interface ProcessTreeNode extends ProcInfo {
  key: number;
  children?: ProcessTreeNode[];
}
