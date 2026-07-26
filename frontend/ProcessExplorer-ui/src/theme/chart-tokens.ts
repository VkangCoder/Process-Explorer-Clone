// Màu cố định cho các chỉ số hiệu năng — không đổi theo Dark/Light theme,
// vì đây là mã màu ngữ nghĩa (CPU/Memory/GPU/Disk/Network) cần nhận diện nhất quán.
export const chartTokens = {
  cpuHeatmap: ["#22C55E", "#EAB308", "#F97316", "#EF4444"] as const,
  memory: "#3B82F6",
  gpu: "#8B5CF6",
  disk: "#F97316",
  network: "#06B6D4",
};
