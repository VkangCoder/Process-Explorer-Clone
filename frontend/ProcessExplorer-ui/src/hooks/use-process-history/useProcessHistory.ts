import { useEffect, useState } from "react";
import { getHistory, type HistoryPoint } from "../../api/getHistory";
import { message } from "antd";

export function useProcessHistory(pid: number | undefined): HistoryPoint[] {
    const [points, setPoints] = useState<HistoryPoint[]>([]);

    useEffect(() => {
        if (pid === undefined) {
            setPoints([]);
            return;
        }

        const fetchHistory = async () => {
            try {
                const data = await getHistory(pid, 60);
                setPoints(data);
            } catch (error: unknown) {
                console.error("History error", error);
                message.error("Unable to load data history.!");
            }
        };

        fetchHistory();
    }, [pid]);

    return points;
}