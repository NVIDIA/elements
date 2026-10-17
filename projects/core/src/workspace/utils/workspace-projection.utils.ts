// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { WorkspaceLayout, WorkspaceNode } from './workspace-layout.utils.js';
import { projectLayout } from './workspace-operations.utils.js';

export type WorkspaceLayoutProjector = (layout: WorkspaceLayout, available: string[]) => WorkspaceLayout;

export function createWorkspaceLayoutProjector(): WorkspaceLayoutProjector {
  const domains: {
    available: string[];
    closed: string[];
    roots: Map<WorkspaceNode | null, WorkspaceLayout>;
  }[] = [];
  return (layout, available) => {
    let domain = domains.find(entry => sameIds(entry.available, available) && sameIds(entry.closed, layout.closed));
    if (!domain) {
      domain = { available, closed: layout.closed, roots: new Map() };
      domains.push(domain);
    }
    let projectedLayout = domain.roots.get(layout.root);
    if (!projectedLayout) {
      projectedLayout = projectLayout(layout, available);
      domain.roots.set(layout.root, projectedLayout);
    }
    return projectedLayout;
  };
}

export function signature(node: WorkspaceNode | null): string {
  if (!node) return 'null';
  return node.type === 'group'
    ? JSON.stringify(node.panels)
    : JSON.stringify([node.axis, node.children.map(signature)]);
}

export function deepestCarrier(
  node: WorkspaceNode | null,
  expected: string,
  project: (node: WorkspaceNode) => WorkspaceNode | null
): WorkspaceNode | undefined {
  if (!node) return undefined;
  if (node.type === 'split')
    for (const child of node.children) {
      const found = deepestCarrier(child, expected, project);
      if (found) return found;
    }
  return signature(project(node)) === expected ? node : undefined;
}

function sameIds(left: string[], right: string[]) {
  return left === right || (left.length === right.length && left.every((id, index) => id === right[index]));
}
