import {
  Dropdown,
  message,
  Table,
  Typography,
  type MenuProps,
  type TableColumnsType,
} from "antd";
import { useMemo, useState } from "react";
import { OctagonX } from "lucide-react";
import { getCpuColor } from "./process-table.helpers";
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

const columns: TableColumnsType<ProcessTreeNode> = [
  {
    title: "Process Name",
    dataIndex: "name",
    key: "name",
    sorter: (a, b) => a.name.localeCompare(b.name),
    ellipsis: true,
  },
  {
    title: "PID",
    dataIndex: "pid",
    key: "pid",
    width: 90,
    align: "right",
    sorter: (a, b) => a.pid - b.pid,
    render: (pid: number) => <span className={styles.mono}>{pid}</span>,
  },
  {
    title: "CPU",
    dataIndex: "cpu",
    key: "cpu",
    width: 90,
    align: "right",
    sorter: (a, b) => a.cpu - b.cpu,
    render: (cpu: number) => (
      <Text style={{ color: getCpuColor(cpu) }} className={styles.cpuTag}>
        {cpu.toFixed(1)}
      </Text>
    ),
  },
  {
    title: "Memory",
    dataIndex: "memMb",
    key: "memMb",
    width: 110,
    align: "right",
    sorter: (a, b) => a.memMb - b.memMb,
    render: (memMb: number) => (
      <span className={styles.mono}>{memMb.toLocaleString()} MB</span>
    ),
  },
];

export const ProcessTable = ({
  processes,
  selectedPid,
  onSelectPid,
  selectedRowKeys,
  onSelectedRowKeysChange,
  killProcesses,
  pendingPids,
}: ProcessTableProps) => {
  const treeData = useMemo(() => buildTree(processes), [processes]);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [contextRecord, setContextRecord] = useState<ProcessTreeNode | null>(
    null,
  );

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
                disabled:
                  record.startTimeUnixMs === 0 || pendingPids.has(record.pid),
              }),
            }}
            rowClassName={(record) =>
              record.pid === selectedPid ? styles.selectedRow : ""
            }
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
