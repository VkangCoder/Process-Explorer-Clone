import { Descriptions, Empty, Tabs, type TabsProps } from "antd";
import type { PropertiesPanelProps } from "./properties-panel.types";
import styles from "./properties-panel.module.css";
import { PerformanceTab } from "../performance-tab/PerformanceTab";
import { ProcessIcon } from "../process-table";

const NotAvailable = () => (
    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No data yet" className={styles.empty} />
);

export const PropertiesPanel = ({ process, themeMode }: PropertiesPanelProps) => {
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
                        {
                            key: "name",
                            label: "Name",

                            children: (
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <ProcessIcon executablePath={process.executablePath} />
                                    {process.name}
                                </div>
                            ),
                        },
                        { key: "pid", label: "PID", children: process.pid },
                        {
                            key: "cpu",
                            label: "CPU",
                            children: `${process.cpu.toFixed(1)}%`,
                        },
                        {
                            key: "workingSet",
                            label: "Working Set",
                            children: `${process.workingSetKb.toLocaleString()} K`,
                        },
                        {
                            key: "privateBytes",
                            label: "Private Bytes",
                            children: `${process.privateBytesKb.toLocaleString()} K`,
                        },
                    ]}
                />
            ) : (
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Select a process to view details."
                    className={styles.empty}
                />
            ),
        },
        {
            key: "performance",
            label: "Performance",
            children: <PerformanceTab process={process} themeMode={themeMode} key={process?.pid} />,
        },
        { key: "services", label: "Services", children: <NotAvailable /> },
        { key: "modules", label: "Modules", children: <NotAvailable /> },
    ];

    return (
        <div className={styles.propertiesPanel}>
            <Tabs items={items} size="small" />
        </div>
    );
};
