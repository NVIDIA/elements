// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { fitSizes, type WorkspaceNode, type WorkspaceGroup, type WorkspaceSplit } from './workspace-layout.utils.js';
import type { WorkspaceRect } from './workspace-rearrange.controller.js';

export interface WorkspacePlacedGroup {
  key: string;
  group: WorkspaceGroup;
  rect: WorkspaceRect;
}

export interface WorkspacePlacedRegion {
  key: string;
  node: WorkspaceNode;
  rect: WorkspaceRect;
}

export interface WorkspaceBoundary {
  key: string;
  branch: WorkspaceSplit;
  index: number;
  rect: WorkspaceRect;
  sizes: number[];
  minima: number[];
  value: number;
  min: number;
  max: number;
}

interface PlacementInput {
  root: WorkspaceNode | null;
  rect: WorkspaceRect;
  minimum: (node: WorkspaceNode) => { width: number; height: number };
  policy: 'stop' | 'propagate';
  gap: number;
}

/** Allocates geometry without configuring or moving application panels. */
export function allocateWorkspace(input: PlacementInput) {
  const groups: WorkspacePlacedGroup[] = [];
  const regions: WorkspacePlacedRegion[] = [];
  const boundaries: WorkspaceBoundary[] = [];
  const place = (node: WorkspaceNode, rect: WorkspaceRect, path: string) => {
    regions.push({ key: path, node, rect });
    if (node.type === 'group') {
      groups.push({ key: path, group: node, rect });
      return;
    }
    const horizontal = node.axis === 'horizontal';
    const minima = node.children.map(child => input.minimum(child)[horizontal ? 'width' : 'height']);
    const sizes = fitSizes(
      node.weights,
      minima,
      (horizontal ? rect.width : rect.height) - input.gap * (node.children.length - 1)
    );
    let offset = 0;
    node.children.forEach((child, index) => {
      const size = sizes[index]!;
      place(
        child,
        horizontal ? { ...rect, x: rect.x + offset, width: size } : { ...rect, y: rect.y + offset, height: size },
        `${path}.${index}`
      );
      offset += size;
      if (index < node.children.length - 1) {
        boundaries.push(
          boundary({ node, rect, path, index, offset, sizes, minima, policy: input.policy, gap: input.gap })
        );
        offset += input.gap;
      }
    });
  };
  if (input.root) place(input.root, input.rect, 'root');
  return { groups, boundaries, regions };
}

function boundary(input: {
  node: WorkspaceSplit;
  rect: WorkspaceRect;
  path: string;
  index: number;
  offset: number;
  sizes: number[];
  minima: number[];
  policy: PlacementInput['policy'];
  gap: number;
}): WorkspaceBoundary {
  const { node, rect, path, index, offset, sizes, minima, policy } = input;
  const horizontal = node.axis === 'horizontal';
  const after = policy === 'stop' ? [index + 1] : sizes.map((_, i) => i).slice(index + 1);
  const before = policy === 'stop' ? [index] : sizes.map((_, i) => i).slice(0, index + 1);
  const prefix = sizes.slice(0, index + 1).reduce((a, b) => a + b, 0);
  const total = sizes.reduce((a, b) => a + b, 0);
  const negative = before.reduce((sum, i) => sum + sizes[i]! - minima[i]!, 0);
  const positive = after.reduce((sum, i) => sum + sizes[i]! - minima[i]!, 0);
  return {
    key: `${path}:${index}`,
    branch: node,
    index,
    rect: horizontal
      ? { x: rect.x + offset, y: rect.y, width: input.gap, height: rect.height }
      : { x: rect.x, y: rect.y + offset, width: rect.width, height: input.gap },
    sizes,
    minima,
    value: horizontal ? prefix : total - prefix,
    min: horizontal ? prefix - negative : total - prefix - positive,
    max: horizontal ? prefix + positive : total - prefix + negative
  };
}
