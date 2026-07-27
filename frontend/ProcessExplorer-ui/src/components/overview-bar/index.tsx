import {
  Cpu,
  Gauge,
  HardDrive,
  Layers,
  Link2,
  MemoryStick,
  Network,
  Workflow,
} from "lucide-react";
import { chartTokens } from "../../theme";
import type { OverviewBarProps } from "./overview-bar.types";
import styles from "./overview-bar.module.css";

interface StatTileProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}

const StatTile = ({ icon, label, value, color }: StatTileProps) => (
  <div className={styles.tile}>
    <span className={styles.icon} style={{ color }}>
      {icon}
    </span>
    <div className={styles.textGroup}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value}</span>
    </div>
  </div>
);

export const OverviewBar = ({ processCount, cpu, memory, handles, thread }: OverviewBarProps) => {
  return (
    <div className={styles.overviewBar}>
      <StatTile
        icon={<Cpu size={16} />}
        label="CPU"
        value={`${cpu.toFixed(1)}%`}
        color={chartTokens.cpuHeatmap[0]}
      />
      <StatTile
        icon={<MemoryStick size={16} />}
        label="Memory"
        value={`${(memory / 1024).toFixed(1)} GB`}
        color={chartTokens.memory}
      />
      <StatTile
        icon={<HardDrive size={16} />}
        label="Disk"
        value="—"
        color={chartTokens.disk}
      />
      <StatTile
        icon={<Gauge size={16} />}
        label="GPU"
        value="—"
        color={chartTokens.gpu}
      />
      <StatTile
        icon={<Network size={16} />}
        label="Network"
        value="—"
        color={chartTokens.network}
      />
      <StatTile
        icon={<Workflow size={16} />}
        label="Processes"
        value={processCount.toString()}
        color="var(--ant-color-primary)"
      />
      <StatTile
        icon={<Link2 size={16} />}
        label="Handles"
        value={handles.toLocaleString()}
        color="var(--ant-color-text-secondary)"
      />
      <StatTile
        icon={<Layers size={16} />}
        label="Threads"
        value={thread.toLocaleString()}
        color="var(--ant-color-text-secondary)"
      />
    </div>
  );
};
