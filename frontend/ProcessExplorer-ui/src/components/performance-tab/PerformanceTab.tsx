import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { getProcessHistory, type HistoryPoint } from "../../api/getProcessHistory";

interface Props {
    pid: number | undefined;
    name: string | undefined;
}

export const PerformanceTab = ({ pid, name }: Props) => {
    const [data, setData] = useState<HistoryPoint[]>([]);

    useEffect(() => {
        if (pid === undefined) {
            setData([]);
            return;
        }

        const controller = new AbortController();

        const fetchHistory = () => {
            getProcessHistory(pid, 5, controller.signal)
                .then(setData)
                .catch(() => { });
        };

        fetchHistory();

        const intervalId = setInterval(fetchHistory, 3000);

        return () => {
            controller.abort();
            clearInterval(intervalId);
        };
    }, [pid]);

    if (pid === undefined) {
        return <div style={{ padding: 16 }}>Select a process to view its history.</div>;
    }

    return (
        <div style={{ padding: 8 }}>
            <div style={{ marginBottom: 8 }}>{name} (PID {pid}) — CPU over the last 5 minutes</div>
            <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data}>
                    <XAxis
                        dataKey="timestamp"
                        tickFormatter={(t) => (t ? new Date(t).toLocaleTimeString() : "")}
                        tick={{ fontSize: 11 }}
                    />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                        labelFormatter={(t: any) => (t ? new Date(t).toLocaleTimeString() : "")}
                    />
                    <Line type="monotone" dataKey="cpu" stroke="#4ec94e" dot={false} isAnimationActive={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};