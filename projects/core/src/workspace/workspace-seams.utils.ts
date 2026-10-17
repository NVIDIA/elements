// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { WorkspaceDestination } from './workspace-operations.utils.js';
import type { WorkspacePlacedRegion } from './workspace-placement.utils.js';
import type { WorkspacePlacementPlan } from './workspace-planner.utils.js';
import type { WorkspaceRect } from './workspace-rearrange.controller.js';

export type WorkspaceSeamSide = 'left' | 'right' | 'top' | 'bottom';

export interface WorkspaceSeamPreview {
  kind: 'split' | 'insert';
  edges: { side: WorkspaceSeamSide; offset: number; fraction: number }[];
}

interface SeamInput {
  plan: WorkspacePlacementPlan;
  regions: WorkspacePlacedRegion[];
  sourceKey: string;
  sourceRect: WorkspaceRect;
  cue: WorkspaceRect;
  bounds: WorkspaceRect;
  position: WorkspaceDestination['position'];
}

/** Describes only the actual adjoining seams of one evaluated candidate. */
export function planSeamPreview(input: SeamInput): WorkspaceSeamPreview | undefined {
  const { plan, regions, sourceKey, position } = input;
  if (plan.kind === 'tab' || position === 'tab') return undefined;
  const parts = sourceKey.split('.');
  const index = Number(parts.pop());
  const parent = regions.find(region => region.key === parts.join('.'));
  const source = regions.find(region => region.key === sourceKey);
  if (!source || parent?.node.type !== 'split') return undefined;
  const horizontal = parent.node.axis === 'horizontal';
  const [before, after] = horizontal ? (['left', 'right'] as const) : (['top', 'bottom'] as const);
  const facing = { left: 'right', right: 'left', top: 'bottom', bottom: 'top' }[position];
  const edges = [-1, 1].flatMap(delta => {
    const neighbor = regions.find(region => region.key === `${parent.key}.${index + delta}`);
    const side = delta < 0 ? before : after;
    if (!neighbor || (plan.kind === 'split' && side !== facing)) return [];
    const offset = halfGap(source.rect, neighbor.rect, side);
    const edge = describeEdge(input, side, offset);
    return edge ? [edge] : [];
  });
  const kind = { reorder: 'insert', insert: 'insert', split: 'split' } as const;
  return edges.length ? { kind: kind[plan.kind], edges } : undefined;
}

function halfGap(source: WorkspaceRect, neighbor: WorkspaceRect, side: WorkspaceSeamSide) {
  const gaps = {
    left: source.x - neighbor.x - neighbor.width,
    right: neighbor.x - source.x - source.width,
    top: source.y - neighbor.y - neighbor.height,
    bottom: neighbor.y - source.y - source.height
  };
  return Math.max(0, gaps[side]) / 2;
}

export function seamPoint(r: WorkspaceRect, side: WorkspaceSeamSide, offset: number) {
  switch (side) {
    case 'left':
      return { x: r.x - offset, y: r.y + r.height / 2 };
    case 'right':
      return { x: r.x + r.width + offset, y: r.y + r.height / 2 };
    case 'top':
      return { x: r.x + r.width / 2, y: r.y - offset };
    case 'bottom':
      return { x: r.x + r.width / 2, y: r.y + r.height + offset };
  }
}

function inside(rect: WorkspaceRect, point: { x: number; y: number }) {
  return point.x >= rect.x && point.x < rect.x + rect.width && point.y >= rect.y && point.y < rect.y + rect.height;
}

function describeEdge(input: SeamInput, side: WorkspaceSeamSide, offset: number) {
  const { cue, bounds } = input;
  const point = seamPoint(input.sourceRect, side, offset);
  if (!inside(bounds, point)) return undefined;
  const vertical = side === 'left' || side === 'right';
  const extent = vertical ? cue.height : cue.width;
  if (extent <= 0) return undefined;
  const fraction = ((vertical ? point.y : point.x) - (vertical ? cue.y : cue.x)) / extent;
  return fraction >= 0 && fraction <= 1 ? { side, offset, fraction } : undefined;
}
