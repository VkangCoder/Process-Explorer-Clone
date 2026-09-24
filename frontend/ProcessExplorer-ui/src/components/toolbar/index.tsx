import { Button, Divider, Space, Tooltip } from "antd";
import {
  Activity,
  Command,
  Download,
  Filter,
  Info,
  ListTree,
  LogOut,
  MemoryStick,
  Moon,
  OctagonX,
  Pause,
  RefreshCw,
  Search,
  Settings,
  Sun,
} from "lucide-react";
import type { ToolbarProps } from "./toolbar.types";
import styles from "./toolbar.module.css";
import { store } from "../../stores";
import { logout } from "../../stores/auth-slice";

interface ToolButtonProps {
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
}

const ToolButton = ({
  label,
  icon,
  onClick,
  active,
  disabled,
}: ToolButtonProps) => (
  <Tooltip title={label}>
    <Button
      type={active ? "primary" : "text"}
      icon={icon}
      onClick={onClick}
      disabled={disabled}
    />
  </Tooltip>
);

export const Toolbar = ({
  themeMode,
  onToggleTheme,
  selectedCount,
  onKillSelected,
}: ToolbarProps) => {
  return (
    <div className={styles.toolbar}>
      <Space size={4}>
        <ToolButton label="Refresh" icon={<RefreshCw size={16} />} />
        <ToolButton label="Pause" icon={<Pause size={16} />} />
        <Divider vertical />
        <ToolButton
          label={
            selectedCount > 0
              ? `Kill Process (${selectedCount})`
              : "Kill Process"
          }
          icon={<OctagonX size={16} />}
          disabled={selectedCount === 0}
          onClick={onKillSelected}
        />
        <ToolButton label="Kill Process Tree" icon={<ListTree size={16} />} />
        <Divider vertical />
        <ToolButton label="Find" icon={<Search size={16} />} />
        <ToolButton label="Properties" icon={<Info size={16} />} />
        <ToolButton label="Search" icon={<Command size={16} />} />
        <Divider vertical />
        <ToolButton label="Settings" icon={<Settings size={16} />} />
        <ToolButton label="Export" icon={<Download size={16} />} />
        <ToolButton label="Filter" icon={<Filter size={16} />} />
        <Divider vertical />
        <ToolButton label="CPU History" icon={<Activity size={16} />} />
        <ToolButton label="Memory History" icon={<MemoryStick size={16} />} />
      </Space>

      <div>
        <Tooltip
          title={
            themeMode === "dark"
              ? "Switch to Light Theme"
              : "Switch to Dark Theme"
          }
        >
          <Button
            type="text"
            icon={themeMode === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            onClick={onToggleTheme}
          />
        </Tooltip>

        <Tooltip title="Log out">
          <Button
            type="text"
            icon={<LogOut size={16} />}
            onClick={() => store.dispatch(logout())}
          />
        </Tooltip>
      </div>
    </div>
  );
};
