import type { ThemeMode } from "../../theme";

export interface ToolbarProps {
  themeMode: ThemeMode;
  onToggleTheme: () => void;
  selectedCount: number;
  onKillSelected: () => void;
}