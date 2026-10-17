// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { WorkspaceNode } from './workspace-layout.utils.js';

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
