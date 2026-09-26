import type { ProcInfo } from "../../types/ProcInfo";
import type { ThemeMode } from "../../theme";
import type { RowTransientHighlight } from "../process-table/process-table.helpers";

export interface AppShellProps {
  processes: ProcInfo[];
  highlights?: Map<number, RowTransientHighlight>;
  totalCpu: number;
  totalMemory: number;
  totalHandles: number;
  totalThreads: number;
  totalDisk: number;
  selectedPid: number | undefined;
  selectedProcess: ProcInfo | undefined;
  themeMode: ThemeMode;
  onToggleTheme: () => void;
  onSelectPid: (pid: number) => void;
  token: string | null;
  onLogout: (reason?: string) => void;
}
