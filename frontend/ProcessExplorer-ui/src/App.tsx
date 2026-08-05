import { useMemo, useState } from "react";
import { ConfigProvider, App as AntdApp } from "antd";
import { AppShell, LoginPage } from "./components";
import { useAuth } from "./hooks/use-auth";
import { useProcessData } from "./hooks/use-process-data";
import { useTheme } from "./hooks/use-theme";
import { darkTheme, lightTheme } from "./theme";

function App() {
  const processes = useProcessData();
  const { mode, toggleTheme } = useTheme();
  const { token, isAuthenticated, login, logout, error, isLoggingIn } = useAuth();
  const [selectedPid, setSelectedPid] = useState<number>();

  const selectedProcess = useMemo(
    () => processes.find((p) => p.pid === selectedPid),
    [processes, selectedPid],
  );

  const totalCpu = useMemo(
    () => processes.reduce((sum, p) => sum + p.cpu, 0),
    [processes],
  );

  const totalMemory = useMemo(
    () => processes.reduce((sum, p) => sum + p.memMb, 0),
    [processes],
  );

  const totalThreads = useMemo(() => processes.reduce((s, p) => s + p.threadCount, 0), [processes]);

  const totalHandles = useMemo(() => processes.reduce((s, p) => s + p.handleCount, 0), [processes]);

  const totalDisk = useMemo(() => processes.reduce((s, p) => s + p.diskKbPerSec, 0), [processes]);

  return (
    <ConfigProvider theme={mode === "dark" ? darkTheme : lightTheme}>
      <AntdApp>
        {isAuthenticated ? (
          <AppShell
            processes={processes}
            totalCpu={totalCpu}
            selectedPid={selectedPid}
            totalMemory={totalMemory}
            totalThreads={totalThreads}
            totalHandles={totalHandles}
            totalDisk={totalDisk}
            selectedProcess={selectedProcess}
            themeMode={mode}
            onToggleTheme={toggleTheme}
            onSelectPid={setSelectedPid}
            token={token}
            onLogout={logout}
          />
        ) : (
          <LoginPage onLogin={login} error={error} isLoggingIn={isLoggingIn} />
        )}
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;