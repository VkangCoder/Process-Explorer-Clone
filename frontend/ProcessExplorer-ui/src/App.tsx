import { useMemo, useState } from "react";
import { ConfigProvider, App as AntdApp, message } from "antd";
import { Navigate, Route, Routes } from "react-router";
import { AppShell, LoginPage } from "./components";
import { useProcessData } from "./hooks/use-process-data";
import { useTheme } from "./hooks/use-theme";
import { lightTheme } from "./theme";
import { useAppDispatch, useAppSelector } from "./stores";
import { logout } from "./stores/auth-slice";

function App() {
    const dispatch = useAppDispatch();
    const token = useAppSelector((s) => s.auth.token);
    const isAuthenticated = token !== null;
    const { processes, highlights } = useProcessData();
    const { mode, toggleTheme } = useTheme();
    const [selectedPid, setSelectedPid] = useState<number>();

    const selectedProcess = useMemo(() => processes.find((p) => p.pid === selectedPid), [processes, selectedPid]);

    const totalCpu = useMemo(() => processes.reduce((sum, p) => sum + p.cpu, 0), [processes]);

    const totalMemory = useMemo(() => processes.reduce((sum, p) => sum + p.workingSetKb, 0), [processes]);

    const totalThreads = useMemo(() => processes.reduce((s, p) => s + p.threadCount, 0), [processes]);

    const totalHandles = useMemo(() => processes.reduce((s, p) => s + p.handleCount, 0), [processes]);

    const totalDisk = useMemo(() => processes.reduce((s, p) => s + p.diskKbPerSec, 0), [processes]);

    return (
        // <ConfigProvider theme={mode === "dark" ? darkTheme : lightTheme}>
        <ConfigProvider theme={lightTheme}>
            <AntdApp>
                <Routes>
                    <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
                    <Route
                        path="/*"
                        element={
                            !isAuthenticated ? (
                                <Navigate to="/login" replace />
                            ) : (
                                <AppShell
                                    processes={processes}
                                    highlights={highlights}
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
                                    onLogout={(reason) => {
                                        if (reason) message.error(reason);
                                        dispatch(logout());
                                    }}
                                />
                            )
                        }
                    />
                </Routes>
            </AntdApp>
        </ConfigProvider>
    );
}

export default App;
