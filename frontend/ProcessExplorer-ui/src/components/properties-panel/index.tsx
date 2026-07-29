import { Descriptions, Empty, Tabs, type TabsProps } from "antd";
import type { PropertiesPanelProps } from "./properties-panel.types";
import styles from "./properties-panel.module.css";
import { PerformanceTab } from "../performance-tab/PerformanceTab";

const NotAvailable = () => (
  <Empty
    image={Empty.PRESENTED_IMAGE_SIMPLE}
    description="No data yet"
    className={styles.empty}
  />
);

export const PropertiesPanel = ({ process }: PropertiesPanelProps) => {
  const items: TabsProps["items"] = [
    {
      key: "properties",
      label: "Properties",
      children: process ? (
        <Descriptions
          column={1}
          size="small"
          bordered
          items={[
            { key: "name", label: "Name", children: process.name },
            { key: "pid", label: "PID", children: process.pid },
            {
              key: "parentPid",
              label: "Parent PID",
              children: process.parentPid,
            },
            {
              key: "cpu",
              label: "CPU",
              children: `${process.cpu.toFixed(1)}%`,
            },
            {
              key: "memMb",
              label: "Memory",
              children: `${process.memMb.toLocaleString()} MB`,
            },
          ]}
        />
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Chọn một tiến trình để xem chi tiết"
          className={styles.empty}
        />
      ),
    },
    { key: "performance", label: "Performance", children: <PerformanceTab pid={process?.pid} name={process?.name} /> },
    { key: "services", label: "Services", children: <NotAvailable /> },
    { key: "modules", label: "Modules", children: <NotAvailable /> },
  ];

  return (
    <div className={styles.propertiesPanel}>
      <Tabs items={items} size="small" />
    </div>
  );
};
