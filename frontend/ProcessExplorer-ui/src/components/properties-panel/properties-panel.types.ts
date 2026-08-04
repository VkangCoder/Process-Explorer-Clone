import type { ProcInfo } from "../../types/ProcInfo";
import type { ThemeMode } from "../../theme";

export interface PropertiesPanelProps {
  process?: ProcInfo;
  themeMode: ThemeMode;
}
