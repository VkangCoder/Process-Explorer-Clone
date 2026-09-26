import { chartTokens } from "../../theme";
import type { ProcInfo } from "../../types/ProcInfo";

export const getCpuColor = (cpu: number): string => {
  const [green, yellow, orange, red] = chartTokens.cpuHeatmap;
  if (cpu < 25) return green;
  if (cpu < 50) return yellow;
  if (cpu < 75) return orange;
  return red;
};

export type RowTransientHighlight = "new" | "exiting";

export type RowCategory =
  | "exiting"
  | "new"
  | "suspended"
  | "own"
  | "packed"
  | "service"
  | "dotnet";

export const getRowCategory = (
  process: ProcInfo,
  highlight: RowTransientHighlight | undefined,
): RowCategory | null => {
  if (highlight === "exiting") return "exiting";
  if (highlight === "new") return "new";
  if (process.isSuspended) return "suspended";
  if (process.isOwnProcess) return "own";
  if (process.isPacked) return "packed";
  if (process.isService) return "service";
  if (process.isDotNet) return "dotnet";
  return null;
};
