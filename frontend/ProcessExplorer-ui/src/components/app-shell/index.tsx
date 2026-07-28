import { useMemo, useState } from "react";
import { Splitter, theme } from "antd";
import { useKillProcess } from "../../hooks/use-kill-process";
import { BottomPanel } from "../bottom-panel";
import { MenuBar } from "../menu-bar";
import { OverviewBar } from "../overview-bar";
import { ProcessTable } from "../process-table";
import { PropertiesPanel } from "../properties-panel";
import { StatusBar } from "../status-bar";
import { Toolbar } from "../toolbar";
import type { AppShellProps } from "./app-shell.types";
import styles from "./app-shell.module.css";

// Component antd (Button, Menu, Table...) tự cập nhật màu theo token khi đổi theme.
// Nhưng div thường (như .toolbar, .overviewBar) thì không — CSS var của antd trong
// chế độ `cssVar` chỉ được đăng ký cục bộ bên trong từng component antd, không đặt
// lên <html>. Nên ở đây tự đọc token qua useToken() rồi gán làm CSS var lên root
// div của app, để mọi CSS Module con kế thừa đúng theo theme hiện tại.
export const AppShell = ({
  processes,
  totalCpu,
  totalMemory,
  totalDisk,
  totalThreads,
  totalHandles,
  selectedPid,
  selectedProcess,
  themeMode,
  onToggleTheme,
  onSelectPid,
}: AppShellProps) => {
  const { token } = theme.useToken();
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const { killProcesses, pendingPids } = useKillProcess();

  const selectedTargets = useMemo(
    () =>
      processes
        .filter((p) => selectedRowKeys.includes(p.pid))
        .map((p) => ({
          pid: p.pid,
          startTimeUnixMs: p.startTimeUnixMs,
          name: p.name,
        })),
    [processes, selectedRowKeys],
  );

  const cssVars = {
    "--ant-color-bg-base": token.colorBgBase,
    "--ant-color-bg-container": token.colorBgContainer,
    "--ant-color-bg-elevated": token.colorBgElevated,
    "--ant-color-text": token.colorText,
    "--ant-color-text-secondary": token.colorTextSecondary,
    "--ant-color-border": token.colorBorder,
    "--ant-color-primary": token.colorPrimary,
  } as React.CSSProperties;

  return (
    <div className={styles.appShell} style={cssVars}>
      <MenuBar />
      <Toolbar
        themeMode={themeMode}
        onToggleTheme={onToggleTheme}
        selectedCount={selectedRowKeys.length}
        onKillSelected={() => void killProcesses(selectedTargets)}
      />
      <OverviewBar
        processCount={processes.length}
        cpu={totalCpu}
        memory={totalMemory}
        thread={totalThreads}
        handles={totalHandles}
        disk={totalDisk}
      />

      <Splitter orientation="vertical" className={styles.verticalSplitter}>
        <Splitter.Panel defaultSize="75%" min="30%">
          <Splitter className={styles.horizontalSplitter}>
            <Splitter.Panel defaultSize="75%" min="40%">
              <ProcessTable
                processes={processes}
                selectedPid={selectedPid}
                onSelectPid={onSelectPid}
                selectedRowKeys={selectedRowKeys}
                onSelectedRowKeysChange={setSelectedRowKeys}
                killProcesses={killProcesses}
                pendingPids={pendingPids}
              />
            </Splitter.Panel>
            <Splitter.Panel defaultSize="25%" min="15%" max="40%">
              <PropertiesPanel process={selectedProcess} />
            </Splitter.Panel>
          </Splitter>
        </Splitter.Panel>
        <Splitter.Panel defaultSize="25%" min="10%">
          <BottomPanel />
        </Splitter.Panel>
      </Splitter>

      <StatusBar
        processCount={processes.length}
        cpu={totalCpu}
        memory={totalMemory}
        thread={totalThreads}
        handles={totalHandles}
      />
    </div>
  );
};