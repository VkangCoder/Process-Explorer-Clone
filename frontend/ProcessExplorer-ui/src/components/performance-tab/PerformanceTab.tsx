import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { ProcInfo } from "../../types/ProcInfo";
// import type { ThemeMode } from "../../theme";
import { ProcessIcon } from "../process-table";

interface Props {
  process: ProcInfo | undefined;
  //   themeMode: ThemeMode;
}

interface ChartPoint {
  time: string;
  cpu: number;
}

const MAX_POINTS = 60;

// export function PerformanceTab({ process, themeMode }: Props) {
export function PerformanceTab({ process }: Props) {
  const [points, setPoints] = useState<ChartPoint[]>([]);
  const pid = process?.pid;

  useEffect(() => {
    setPoints([]);
  }, [pid]);

  useEffect(() => {
    if (!process) {
      setPoints([]);
      return;
    }

    setPoints((prev) => {
      const next = [
        ...prev,
        { time: new Date().toLocaleTimeString(), cpu: process.cpu },
      ];
      return next.slice(-MAX_POINTS);
    });
  }, [process]);

  if (!process) {
    return (
      <div style={{ padding: 16 }}>Select a process to view its history.</div>
    );
  }

  return (
    <div style={{ padding: 8 }}>
      <h4 style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <ProcessIcon executablePath={process.executablePath} /> {process.name}{" "}
        (PID {process.pid}) - CPU realtime
      </h4>
      <ResponsiveContainer width="100%" height={200}>
        {/* <LineChart data={points}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={themeMode === "dark" ? "#444" : "#ccc"}
          />

          <XAxis
            dataKey="time"
            tick={{
              fontSize: 10,

              fill: themeMode === "dark" ? "#fff" : "#000",
            }}
            stroke={themeMode === "dark" ? "#666" : "#ccc"}
          />

          <YAxis
            domain={[0, "auto"]}
            tick={{
              fontSize: 10,

              fill: themeMode === "dark" ? "#fff" : "#000",
            }}
            stroke={themeMode === "dark" ? "#666" : "#ccc"}
          />

          <Tooltip
            cursor={{ stroke: themeMode === "dark" ? "#666" : "#ccc" }}
            contentStyle={{
              backgroundColor: themeMode === "dark" ? "#1f1f1f" : "#fff",

              borderColor: themeMode === "dark" ? "#333" : "#ccc",

              color: themeMode === "dark" ? "#fff" : "#000",
            }}
          />

          <Line
            type="monotone"
            dataKey="cpu"
            stroke={themeMode === "dark" ? "#4ec94e" : "#000"}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>  */}

        <LineChart data={points}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="time"
            tick={{
              fontSize: 10,
              fill: "#6b7280",
            }}
            stroke="#d1d5db"
          />
          <YAxis
            domain={[0, "auto"]}
            tick={{
              fontSize: 10,
              fill: "#6b7280",
            }}
            stroke="#d1d5db"
          />
          <Tooltip
            cursor={{ stroke: "#d1d5db" }}
            contentStyle={{
              backgroundColor: "#ffffff",
              borderColor: "#e5e7eb",
              borderRadius: "6px",
              color: "#111827",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            }}
          />
          <Line
            type="monotone"
            dataKey="cpu"
            stroke="#2563eb"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
