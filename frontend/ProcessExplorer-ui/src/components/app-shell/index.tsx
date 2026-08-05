import { useMemo, useState } from "react";
import { Splitter } from "antd";
import { useKillProcess } from "../../hooks/use-kill-process";
import { useThemeCssVars } from "../../hooks/use-theme-css-vars";
import { BottomPanel } from "../bottom-panel";
import { MenuBar } from "../menu-bar";
import { OverviewBar } from "../overview-bar";
import { ProcessTable } from "../process-table";
import { PropertiesPanel } from "../properties-panel";
import { StatusBar } from "../status-bar";
import { Toolbar } from "../toolbar";
import type { AppShellProps } from "./app-shell.types";
import styles from "./app-shell.module.css";

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
  token,
  onLogout,
}: AppShellProps) => {
  const cssVars = useThemeCssVars();
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const { killProcesses, pendingPids } = useKillProcess(token);

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

  return (
    <div className={styles.appShell} style={cssVars}>
      <MenuBar />
      <Toolbar
        themeMode={themeMode}
        onToggleTheme={onToggleTheme}
        selectedCount={selectedRowKeys.length}
        onKillSelected={() => void killProcesses(selectedTargets)}
        onLogout={onLogout}
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
              <PropertiesPanel
                process={selectedProcess}
                themeMode={themeMode}
              />
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