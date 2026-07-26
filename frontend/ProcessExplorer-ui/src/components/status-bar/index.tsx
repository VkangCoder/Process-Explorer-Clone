import type { StatusBarProps } from "./status-bar.types";
import styles from "./status-bar.module.css";

const items = (processCount: number) => [
  { label: "CPU", value: "—" },
  { label: "RAM", value: "—" },
  { label: "Processes", value: processCount.toString() },
  { label: "Threads", value: "—" },
  { label: "Handles", value: "—" },
  { label: "Kernel Time", value: "—" },
  { label: "User Time", value: "—" },
  { label: "Running Time", value: "—" },
];

export const StatusBar = ({ processCount }: StatusBarProps) => {
  return (
    <div className={styles.statusBar}>
      {items(processCount).map(({ label, value }) => (
        <span key={label} className={styles.item}>
          <span className={styles.label}>{label}</span>
          <span className={styles.value}>{value}</span>
        </span>
      ))}
    </div>
  );
};
