import { Empty, Tabs, type TabsProps } from "antd";
import styles from "./bottom-panel.module.css";

const tabKeys = [
  "Handles",
  "DLLs",
  "Threads",
  "TCP/IP",
  "GPU",
  "Environment",
  "Performance",
  "Services",
] as const;

const items: TabsProps["items"] = tabKeys.map((label) => ({
  key: label,
  label,
  children: (
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={`${label} — chưa có dữ liệu`}
      className={styles.empty}
    />
  ),
}));

export const BottomPanel = () => {
  return (
    <div className={styles.bottomPanel}>
      <Tabs items={items} size="small" />
    </div>
  );
};
