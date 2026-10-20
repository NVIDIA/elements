// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * Finds disjoint cycles in a single-parent graph without changing its edges.
 * Null and parents outside the map end a path. Nodes use Map identity.
 * Visits each node once, using O(n) time and space without recursion.
 */
export function findParentCycles<Node extends object | string | number | bigint | boolean | symbol>(
  parents: ReadonlyMap<Node, Node | null>
): Node[][] {
  const complete = new Set<Node>();
  const cycles: Node[][] = [];
  for (const node of parents.keys()) {
    if (complete.has(node)) continue;
    const { path, cycleStart } = traceParentPath(node, parents, complete);
    if (cycleStart !== undefined) cycles.push(path.slice(cycleStart));
    for (const visited of path) complete.add(visited);
  }
  return cycles;
}

function traceParentPath<Node>(node: Node, parents: ReadonlyMap<Node, Node | null>, complete: ReadonlySet<Node>) {
  const path: Node[] = [];
  const visiting = new Map<Node, number>();
  let current: Node | null = node;
  while (current !== null && parents.has(current) && !complete.has(current) && !visiting.has(current)) {
    visiting.set(current, path.length);
    path.push(current);
    current = parents.get(current) ?? null;
  }
  return { path, cycleStart: current === null ? undefined : visiting.get(current) };
}
