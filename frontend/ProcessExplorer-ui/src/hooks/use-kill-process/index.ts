import { useCallback, useState } from "react";
import { message } from "antd";
import { killProcess } from "../../api/killProcess";

export interface KillTarget {
  pid: number;
  startTimeUnixMs: number;
  name: string;
}

export const useKillProcess = () => {
  const [pendingPids, setPendingPids] = useState<Set<number>>(new Set());

  const killProcesses = useCallback(
    async (targets: KillTarget[]) => {
      const killable = targets.filter(
        (t) => t.startTimeUnixMs !== 0 && !pendingPids.has(t.pid),
      );
      const blockedCount = targets.filter(
        (t) => t.startTimeUnixMs === 0,
      ).length;

      if (blockedCount > 0) {
        message.warning(
          blockedCount === 1
            ? "Can not kill system process"
            : `Can not kill ${blockedCount} system process(es)`,
        );
      }
      if (killable.length === 0) return;

      setPendingPids(
        (prev) => new Set([...prev, ...killable.map((t) => t.pid)]),
      );
      const hide = message.loading(
        killable.length === 1
          ? `Killing ${killable[0].name} (${killable[0].pid})…`
          : `Killing ${killable.length} processes…`,
        0,
      );

      const results = await Promise.all(
        killable.map(async (target) => ({
          target,
          result: await killProcess(target.pid, target.startTimeUnixMs),
        })),
      );

      hide();
      setPendingPids((prev) => {
        const next = new Set(prev);
        killable.forEach((t) => next.delete(t.pid));
        return next;
      });

      const succeeded = results.filter((r) => r.result.ok);
      const failed = results.filter((r) => !r.result.ok);

      if (failed.length === 0) {
        message.success(
          succeeded.length === 1
            ? `Killed ${succeeded[0].target.name} (${succeeded[0].target.pid})`
            : `Killed ${succeeded.length} processes`,
        );
        return;
      }

      if (succeeded.length > 0) {
        message.warning(`Killed ${succeeded.length}, failed ${failed.length}`);
        return;
      }

      const firstResult = failed[0].result;
      message.error(
        failed.length === 1 && !firstResult.ok
          ? firstResult.message
          : `Failed to kill ${failed.length} processes`,
      );
    },
    [pendingPids],
  );

  return { killProcesses, pendingPids };
};
