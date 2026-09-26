import type { ProcInfo } from "../../types/ProcInfo";
import type { ProcessTreeNode } from "./process-table.types";

const isPlausibleParent = (parent: ProcInfo, child: ProcInfo): boolean => {
  if (parent.pid === child.pid) return false;
  if (parent.startTimeUnixMs === 0 || child.startTimeUnixMs === 0) return true;
  return parent.startTimeUnixMs <= child.startTimeUnixMs;
};

export const buildTree = (list: ProcInfo[]): ProcessTreeNode[] => {
  const byPid = new Map<number, ProcInfo>();
  for (const p of list) byPid.set(p.pid, p);

  const childrenByParent = new Map<number, ProcInfo[]>();
  const roots: ProcInfo[] = [];

  for (const p of list) {
    const parent = byPid.get(p.parentPid);
    if (parent && isPlausibleParent(parent, p)) {
      const arr = childrenByParent.get(p.parentPid) ?? [];
      arr.push(p);
      childrenByParent.set(p.parentPid, arr);
    } else {
      roots.push(p);
    }
  }

  const build = (proc: ProcInfo): ProcessTreeNode => {
    const node: ProcessTreeNode = { ...proc, key: proc.pid };

    const children = childrenByParent.get(proc.pid);
    if (children && children.length > 0) {
      node.children = children.map(build);
    }

    return node;
  };

  return roots.map(build);
};
