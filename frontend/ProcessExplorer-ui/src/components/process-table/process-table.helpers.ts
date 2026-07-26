import { chartTokens } from "../../theme";

export const getCpuColor = (cpu: number): string => {
  const [green, yellow, orange, red] = chartTokens.cpuHeatmap;
  if (cpu < 25) return green;
  if (cpu < 50) return yellow;
  if (cpu < 75) return orange;
  return red;
};
