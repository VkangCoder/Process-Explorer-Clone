import styles from "./status-bar.module.css";
import type { StatusBarProps } from "./status-bar.types";

const items = ({ processCount, cpu, memory, handles, thread }: StatusBarProps) => [
  { label: "CPU", value: cpu !== undefined ? `${cpu.toFixed(1)}%` : "—" },
  { label: "RAM", value: memory !== undefined ? `${(memory / 1024).toFixed(1)} GB` : "—" },
  { label: "Processes", value: processCount !== undefined ? processCount.toString() : "—" },
  { label: "Threads", value: thread !== undefined ? thread.toLocaleString() : "—" },
  { label: "Handles", value: handles !== undefined ? handles.toLocaleString() : "—" },
  { label: "Kernel Time", value: "—" },
  { label: "User Time", value: "—" },
  { label: "Running Time", value: "—" },
];

export const StatusBar = (props: StatusBarProps) => {
  return (
    <div className={styles.statusBar}>
      {items(props).map(({ label, value }) => (
        <span key={label} className={styles.item}>
          <span className={styles.label}>{label}</span>
          <span className={styles.value}>{value}</span>
        </span>
      ))}
    </div>
  );
};