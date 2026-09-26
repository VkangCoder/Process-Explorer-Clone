import * as signalR from "@microsoft/signalr";
import { useEffect, useRef, useState } from "react";

import { type ProcInfo } from "../../types/ProcInfo";
import { message } from "antd";
import { store, useAppSelector } from "../../stores";
import { logout } from "../../stores/auth-slice";
import type { RowTransientHighlight } from "../../components/process-table/process-table.helpers";

const HIGHLIGHT_DURATION_MS = 2000;

export const useProcessData = () => {
  const token = useAppSelector((s) => s.auth.token);
  const [processes, setProcesses] = useState<ProcInfo[]>([]);
  const [highlights, setHighlights] = useState<Map<number, RowTransientHighlight>>(new Map());

  // Snapshot the render state right after each SignalR "snapshot" event, so the diffing
  // logic never depends on stale closures from the previous effect run.
  const prevListRef = useRef<ProcInfo[]>([]);
  const hasSeenFirstSnapshotRef = useRef(false);
  const exitingProcessesRef = useRef<Map<number, ProcInfo>>(new Map());
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    if (!token) return;

    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const exp = JSON.parse(atob(token.split(".")[1])).exp * 1000;
      const remaining = exp - Date.now();
      if (remaining <= 0) {
        message.error("Your session has expired.");
        store.dispatch(logout());
        return;
      }
      timer = setTimeout(() => {
        message.error("Your session has expired.");
        store.dispatch(logout());
      }, remaining);
    } catch {
      /* token hỏng */
    }

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(import.meta.env.VITE_HUB_URL, {
        accessTokenFactory: () => store.getState().auth.token ?? "",
      })
      .withAutomaticReconnect()
      .build();

    const flagHighlight = (pid: number, kind: RowTransientHighlight, onExpire?: () => void) => {
      const existingTimer = timersRef.current.get(pid);
      if (existingTimer) clearTimeout(existingTimer);

      setHighlights((prev) => new Map(prev).set(pid, kind));

      const expiryTimer = setTimeout(() => {
        timersRef.current.delete(pid);
        onExpire?.();
        setHighlights((prev) => {
          if (!prev.has(pid)) return prev;
          const next = new Map(prev);
          next.delete(pid);
          return next;
        });
      }, HIGHLIGHT_DURATION_MS);
      timersRef.current.set(pid, expiryTimer);
    };

    connection.on("snapshot", (list: ProcInfo[]) => {
      const prevPids = new Set(prevListRef.current.map((p) => p.pid));
      const currentPids = new Set(list.map((p) => p.pid));

      if (hasSeenFirstSnapshotRef.current) {
        for (const p of list) {
          if (!prevPids.has(p.pid) && !exitingProcessesRef.current.has(p.pid)) {
            flagHighlight(p.pid, "new");
          }
        }

        for (const p of prevListRef.current) {
          if (!currentPids.has(p.pid) && !exitingProcessesRef.current.has(p.pid)) {
            exitingProcessesRef.current.set(p.pid, p);
            flagHighlight(p.pid, "exiting", () => {
              exitingProcessesRef.current.delete(p.pid);
              setProcesses((prev) => prev.filter((existing) => existing.pid !== p.pid));
            });
          }
        }
      }
      hasSeenFirstSnapshotRef.current = true;

      const ghosts = [...exitingProcessesRef.current.values()].filter((g) => !currentPids.has(g.pid));
      const merged = [...list, ...ghosts];

      prevListRef.current = merged;
      setProcesses(merged);
    });

    connection.start().catch((err: unknown) => {
      console.error("SignalR connect failed", err);
    });

    return () => {
      if (timer) clearTimeout(timer);
      for (const t of timersRef.current.values()) clearTimeout(t);
      timersRef.current.clear();
      exitingProcessesRef.current.clear();
      prevListRef.current = [];
      hasSeenFirstSnapshotRef.current = false;
      setHighlights(new Map());
      void connection.stop();
    };
  }, [token]);

  return { processes, highlights };
};
