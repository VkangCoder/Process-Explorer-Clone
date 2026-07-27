import { Splitter, theme } from "antd";
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
  totalThreads,
  totalHandles,
  selectedPid,
  selectedProcess,
  themeMode,
  onToggleTheme,
  onSelectPid,
}: AppShellProps) => {
  const { token } = theme.useToken();

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
      <Toolbar themeMode={themeMode} onToggleTheme={onToggleTheme} />
      <OverviewBar processCount={processes.length} cpu={totalCpu} memory={totalMemory} thread={totalThreads} handles={totalHandles} />

      <Splitter orientation="vertical" className={styles.verticalSplitter}>
        <Splitter.Panel defaultSize="75%" min="30%">
          <Splitter className={styles.horizontalSplitter}>
            <Splitter.Panel defaultSize="75%" min="40%">
              <ProcessTable
                processes={processes}
                selectedPid={selectedPid}
                onSelectPid={onSelectPid}
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

      <StatusBar processCount={processes.length} />
    </div>
  );
};
