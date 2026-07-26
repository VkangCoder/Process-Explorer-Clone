import { useMemo, useState } from "react";
import { Table, Tag, type TableColumnsType } from "antd";
import type { ProcessTableProps, ProcessTreeNode } from "./process-table.types";
import { buildTree } from "./process-table.tree";
import { getCpuColor } from "./process-table.helpers";
import styles from "./process-table.module.css";

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
      <Tag color={getCpuColor(cpu)} className={styles.cpuTag}>
        {cpu.toFixed(1)}%
      </Tag>
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
}: ProcessTableProps) => {
  const treeData = useMemo(() => buildTree(processes), [processes]);
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);

  return (
    <div className={styles.processTable}>
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
        rowClassName={(record) =>
          record.pid === selectedPid ? styles.selectedRow : ""
        }
        onRow={(record) => ({
          onClick: () => onSelectPid?.(record.pid),
        })}
      />
    </div>
  );
};
