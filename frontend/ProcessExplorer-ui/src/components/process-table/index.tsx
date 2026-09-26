import { Dropdown, message, Table, Typography, type MenuProps, type TableColumnsType } from "antd";
import { AppWindow, OctagonX } from "lucide-react";
import { useMemo, useState } from "react";
import { getIconUrl } from "../../api/getIcon";
import { getCpuColor, getRowCategory, type RowCategory } from "./process-table.helpers";
import styles from "./process-table.module.css";
import { buildTree } from "./process-table.tree";
import type { ProcessTableProps, ProcessTreeNode } from "./process-table.types";

const { Text } = Typography;

type ProcessAction = "kill" | "killTree" | "restart" | "suspend";

const items: MenuProps["items"] = [
    { label: "Kill Process", key: "kill", icon: <OctagonX size={16} /> },
    { label: "Kill Process Tree", key: "killTree" },
    { label: "Restart", key: "restart" },
    { label: "Suspend", key: "suspend" },
];

export const ProcessIcon = ({ executablePath }: { executablePath: string | null }) => {
    const [failed, setFailed] = useState(false);
    const iconUrl = getIconUrl(executablePath);

    if (!iconUrl || failed) {
        return <AppWindow size={14} className={styles.iconFallback} />;
    }

    return <img src={iconUrl} width={16} height={16} alt="" className={styles.icon} onError={() => setFailed(true)} />;
};

const columns: TableColumnsType<ProcessTreeNode> = [
    {
        title: "Process",
        dataIndex: "name",
        key: "name",
        sorter: (a, b) => a.name.localeCompare(b.name),
        ellipsis: true,
        render: (name: string, record: ProcessTreeNode) => (
            <span className={styles.nameCell}>
                <ProcessIcon executablePath={record.executablePath} />
                {name}
            </span>
        ),
    },
    {
        title: "CPU",
        dataIndex: "cpu",
        key: "cpu",
        width: 90,
        align: "right",
        sorter: (a, b) => a.cpu - b.cpu,
        onHeaderCell: () => ({ className: styles.cpuHeader }),
        onCell: () => ({ className: styles.cpuCell }),
        render: (cpu: number) => (
            <Text style={{ color: getCpuColor(cpu) }} className={styles.cpuTag}>
                {cpu.toFixed(1)}
            </Text>
        ),
    },

    {
        title: "Private Bytes",
        dataIndex: "privateBytesKb",
        key: "privateBytesKb",
        width: 120,
        align: "right",
        sorter: (a, b) => a.privateBytesKb - b.privateBytesKb,
        onHeaderCell: () => ({ className: styles.privateHeader }),
        onCell: () => ({ className: styles.privateCell }),
        render: (kb: number) => <span className={styles.mono}>{kb.toLocaleString()} K</span>,
    },
    {
        title: "Working Set",
        dataIndex: "workingSetKb",
        key: "workingSetKb",
        width: 120,
        align: "right",
        sorter: (a, b) => a.workingSetKb - b.workingSetKb,
        onHeaderCell: () => ({ className: styles.workingHeader }),
        onCell: () => ({ className: styles.workingCell }),
        render: (kb: number) => <span className={styles.mono}>{kb.toLocaleString()} K</span>,
    },
    {
        title: "PID",
        dataIndex: "pid",
        key: "pid",
        width: 80,
        align: "right",
        sorter: (a, b) => a.pid - b.pid,
        render: (pid: number) => <span className={styles.mono}>{pid}</span>,
    },
    {
        title: "Description",
        dataIndex: "desc",
        key: "desc",
        width: 90,
        align: "right",
    },
    {
        title: "Company Name",
        dataIndex: "companyName",
        key: "companyName",
        width: 120,
        align: "right",
    },
];

const categoryClassMap: Record<RowCategory, string> = {
    exiting: styles.rowExiting,
    new: styles.rowNew,
    suspended: styles.rowSuspended,
    own: styles.rowOwn,
    packed: styles.rowPacked,
    service: styles.rowService,
    dotnet: styles.rowDotnet,
};

export const ProcessTable = ({
    processes,
    selectedPid,
    onSelectPid,
    selectedRowKeys,
    onSelectedRowKeysChange,
    killProcesses,
    pendingPids,
    highlights,
}: ProcessTableProps) => {
    const treeData = useMemo(() => buildTree(processes), [processes]);
    const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
    const [contextRecord, setContextRecord] = useState<ProcessTreeNode | null>(null);

    const menu: MenuProps = useMemo(
        () => ({
            items,
            onClick: ({ key }) => {
                if (!contextRecord) return;
                const action = key as ProcessAction;

                switch (action) {
                    case "kill":
                        void killProcesses([
                            {
                                pid: contextRecord.pid,
                                startTimeUnixMs: contextRecord.startTimeUnixMs,
                                name: contextRecord.name,
                            },
                        ]);
                        break;
                    case "killTree":
                    case "restart":
                    case "suspend":
                        message.warning("Not supported");
                        break;
                }

                setContextRecord(null);
            },
        }),
        [contextRecord, killProcesses],
    );

    return (
        <div className={styles.processTable}>
            <Dropdown menu={menu} trigger={["contextMenu"]}>
                <div>
                    <Table<ProcessTreeNode>
                        columns={columns}
                        dataSource={treeData}
                        rowKey="key"
                        size="small"
                        pagination={false}
                        sticky
                        expandable={{
                            expandedRowKeys: expandedKeys,
                            onExpandedRowsChange: (keys) => setExpandedKeys([...keys]),
                        }}
                        rowSelection={{
                            selectedRowKeys,
                            onChange: (keys) => onSelectedRowKeysChange(keys as number[]),
                            getCheckboxProps: (record) => ({
                                disabled: record.startTimeUnixMs === 0 || pendingPids.has(record.pid),
                            }),
                        }}
                        rowClassName={(record) => {
                            if (record.pid === selectedPid) return styles.selectedRow;
                            const category = getRowCategory(record, highlights?.get(record.pid));
                            return category ? categoryClassMap[category] : "";
                        }}
                        onRow={(record) => ({
                            onClick: () => onSelectPid?.(record.pid),
                            onContextMenu: () => {
                                setContextRecord(record);
                                onSelectPid?.(record.pid);
                            },
                        })}
                    />
                </div>
            </Dropdown>
        </div>
    );
};
