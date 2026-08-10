import { useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";
import { type ProcInfo } from "../../types/ProcInfo";

export const useProcessData = () => {
  const [processes, setProcesses] = useState<ProcInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(import.meta.env.VITE_HUB_URL)
      .withAutomaticReconnect()
      .build();

    connection.on("snapshot", (list: ProcInfo[]) => {
      setProcesses(list);
      setIsLoading(false);
    });

    connection
      .start()
      .then(() => console.log("SignalR connected"))
      .catch((err: unknown) => console.error("Connection error", err));

    return () => {
      void connection.stop();
    };
  }, []);

  return { processes, isLoading };
};