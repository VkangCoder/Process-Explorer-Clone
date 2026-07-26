import { Menu, type MenuProps } from "antd";
import styles from "./menu-bar.module.css";

const items: MenuProps["items"] = [
  {
    key: "file",
    label: "File",
    children: [
      { key: "file-run-new-task", label: "Run New Task..." },
      { type: "divider" },
      { key: "file-exit", label: "Exit" },
    ],
  },
  {
    key: "options",
    label: "Options",
    children: [
      { key: "options-refresh-rate", label: "Refresh Rate" },
      { key: "options-always-on-top", label: "Always on Top" },
      { key: "options-tray-icon", label: "Minimize to Tray" },
    ],
  },
  {
    key: "view",
    label: "View",
    children: [
      { key: "view-select-columns", label: "Select Columns..." },
      { key: "view-show-processes-from-all-users", label: "Show Processes from All Users" },
      { key: "view-system-information", label: "System Information" },
    ],
  },
  {
    key: "process",
    label: "Process",
    children: [
      { key: "process-kill-process", label: "Kill Process" },
      { key: "process-kill-process-tree", label: "Kill Process Tree" },
      { type: "divider" },
      { key: "process-suspend", label: "Suspend" },
      { key: "process-resume", label: "Resume" },
      { key: "process-restart", label: "Restart" },
      { type: "divider" },
      { key: "process-properties", label: "Properties..." },
    ],
  },
  {
    key: "find",
    label: "Find",
    children: [{ key: "find-handle-or-dll", label: "Find Handle or DLL..." }],
  },
  {
    key: "users",
    label: "Users",
  },
  {
    key: "thread",
    label: "Thread",
    children: [
      { key: "thread-suspend", label: "Suspend" },
      { key: "thread-kill", label: "Kill" },
    ],
  },
  {
    key: "help",
    label: "Help",
    children: [{ key: "help-about", label: "About Process Explorer" }],
  },
];

export const MenuBar = () => {
  return (
    <Menu
      mode="horizontal"
      items={items}
      selectable={false}
      className={styles.menuBar}
    />
  );
};
