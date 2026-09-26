export interface HistoryPoint {
    timestamp: string;
    cpu: number;
    workingSetKb: number;
    handleCount: number;
}

export async function getProcessHistory(
    pid: number,
    minutes: number = 5,
    signal?: AbortSignal,
): Promise<HistoryPoint[]> {
    const res = await fetch(`${import.meta.env.VITE_URL}/${pid}/history?minutes=${minutes}`, { signal });
    if (!res.ok) return [];
    return (await res.json()) as HistoryPoint[];
}
