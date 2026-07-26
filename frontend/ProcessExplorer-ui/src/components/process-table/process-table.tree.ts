import type { ProcInfo } from "../../types/ProcInfo";
import type { ProcessTreeNode } from "./process-table.types";

export const buildTree = (list: ProcInfo[]): ProcessTreeNode[] => {
  const childrenByParent = new Map<number, ProcInfo[]>();
  for (const p of list) {
    const arr = childrenByParent.get(p.parentPid) ?? [];
    arr.push(p);
    childrenByParent.set(p.parentPid, arr);
  }

  const allPids = new Set(list.map((p) => p.pid));

  const build = (proc: ProcInfo): ProcessTreeNode => {
    const node: ProcessTreeNode = { ...proc, key: proc.pid };

    const children = childrenByParent.get(proc.pid);
    if (children && children.length > 0) {
      node.children = children.map(build);
    }

    return node;
  };

  return list.filter((p) => !allPids.has(p.parentPid)).map(build);
};