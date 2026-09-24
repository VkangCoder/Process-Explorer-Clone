import * as signalR from "@microsoft/signalr";
import { useEffect, useState } from "react";

import { type ProcInfo } from "../../types/ProcInfo";
import { message } from "antd";
import { store, useAppSelector } from "../../stores";
import { logout } from "../../stores/auth-slice";

export const useProcessData = () => {
  const token = useAppSelector((s) => s.auth.token);
  const [processes, setProcesses] = useState<ProcInfo[]>([]);

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

    connection.on("snapshot", (list: ProcInfo[]) => setProcesses(list));

    connection.start().catch((err: unknown) => {
      console.error("SignalR connect failed", err);
    });

    return () => {
      if (timer) clearTimeout(timer);
      void connection.stop();
    };
  }, [token]);

  return processes;
};
