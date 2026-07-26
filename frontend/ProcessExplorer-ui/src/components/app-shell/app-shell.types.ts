import type { ProcInfo } from "../../types/ProcInfo";
import type { ThemeMode } from "../../theme";

export interface AppShellProps {
  processes: ProcInfo[];
  totalCpu: number;
  selectedPid: number | undefined;
  selectedProcess: ProcInfo | undefined;
  themeMode: ThemeMode;
  onToggleTheme: () => void;
  onSelectPid: (pid: number) => void;
}
