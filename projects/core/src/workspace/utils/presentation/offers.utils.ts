// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Point, Rect } from '@nvidia-elements/core/internal';

import { clipCue } from '../interaction/drag-preview.utils.js';
import { getAffectedSplitContext } from '../placement/context.utils.js';

import type { WorkspacePlacedRegion } from '../geometry/allocation.utils.js';
import type { WorkspaceDragAllocation } from '../interaction/drag-preview.utils.js';
import type { WorkspaceDestination } from '../model/operations.utils.js';
import type { WorkspacePlacementPlan } from '../placement/planner.utils.js';

type WorkspaceSeamSide = 'left' | 'right' | 'top' | 'bottom';

export interface WorkspaceSeamPreview {
  kind: 'split' | 'insert';
  edges: { side: WorkspaceSeamSide; offset: number; fraction: number }[];
}

interface SeamInput {
  plan: WorkspacePlacementPlan;
  regions: WorkspacePlacedRegion[];
  sourceKey: string;
  sourceRect: Rect;
  cue: Rect;
  bounds: Rect;
  position: WorkspaceDestination['position'];
}

/** Separates a group split's intended half from its constrained committed allocation. */
export function getOfferPresentation(input: {
  plan: WorkspacePlacementPlan;
  regions: WorkspacePlacedRegion[];
  sourceKey: string;
  sourceRect: Rect;
  cue: Rect;
  bounds: Rect;
  destination: WorkspaceDestination;
  feasible: boolean;
  split?: {
    source: string[];
    regions: WorkspacePlacedRegion[];
    groups: { panels: { id: string }[]; rect: Rect }[];
  };
  client(rect: Rect): Rect;
}) {
  const recipient = input.split?.groups.find(group =>
    group.panels.some(panel => panel.id === input.destination.target)
  );
  const intent =
    recipient && input.destination.position !== 'tab'
      ? splitIntent(input.client(recipient.rect), input.destination.position)
      : undefined;
  const cue = clipCue(intent?.cue ?? input.cue, input.bounds);
  return {
    cue,
    seams: offerSeams(input, intent, cue),
    context:
      recipient && input.split
        ? getAffectedSplitContext({
            baseline: input.split.regions,
            achieved: input.regions,
            source: input.split.source,
            recipient: recipient.panels.map(panel => panel.id)
          })
        : input.plan.context
  };
}

/** Chooses live reservation separately from the unchanged candidate and commitment. */
export function getOfferAllocation(plan: WorkspacePlacementPlan, feasible: boolean): WorkspaceDragAllocation {
  return (plan.kind === 'reorder' || plan.kind === 'tab' || plan.kind === 'insert') && feasible
    ? { allocation: 'reserved', layout: plan.layout }
    : { allocation: 'overlay' };
}

function offerSeams(
  input: Parameters<typeof getOfferPresentation>[0],
  intent: ReturnType<typeof splitIntent> | undefined,
  cue: Rect
): WorkspaceSeamPreview | undefined {
  if (!input.feasible) return undefined;
  if (intent) return intentSeam(intent, cue, input.bounds);
  return planSeamPreview({ ...input, cue, position: input.destination.position });
}

function splitIntent(rect: Rect, position: Exclude<WorkspaceDestination['position'], 'tab'>) {
  const horizontal = position === 'left' || position === 'right';
  const cue = {
    x: rect.x + (position === 'right' ? rect.width / 2 : 0),
    y: rect.y + (position === 'bottom' ? rect.height / 2 : 0),
    width: horizontal ? rect.width / 2 : rect.width,
    height: horizontal ? rect.height : rect.height / 2
  };
  const side = { left: 'right', right: 'left', top: 'bottom', bottom: 'top' } as const;
  const seams: WorkspaceSeamPreview = { kind: 'split', edges: [{ side: side[position], offset: 0, fraction: 0.5 }] };
  return { cue, seams };
}

function intentSeam(
  intent: { cue: Rect; seams: WorkspaceSeamPreview },
  cue: Rect,
  bounds: Rect
): WorkspaceSeamPreview | undefined {
  const edge = intent.seams.edges[0]!;
  const vertical = edge.side === 'left' || edge.side === 'right';
  const { x, y } = seamPoint(intent.cue, edge.side, 0);
  if (x < bounds.x || x >= bounds.x + bounds.width || y < bounds.y || y >= bounds.y + bounds.height) return undefined;
  const fraction = vertical ? (y - cue.y) / cue.height : (x - cue.x) / cue.width;
  return Number.isFinite(fraction) ? { kind: 'split', edges: [{ ...edge, fraction }] } : undefined;
}

/** Describes only the actual adjoining seams of one evaluated candidate. */
function planSeamPreview(input: SeamInput): WorkspaceSeamPreview | undefined {
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

function halfGap(source: Rect, neighbor: Rect, side: WorkspaceSeamSide) {
  const gaps = {
    left: source.x - neighbor.x - neighbor.width,
    right: neighbor.x - source.x - source.width,
    top: source.y - neighbor.y - neighbor.height,
    bottom: neighbor.y - source.y - source.height
  };
  return Math.max(0, gaps[side]) / 2;
}

function seamPoint(r: Rect, side: WorkspaceSeamSide, offset: number) {
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

function inside(rect: Rect, point: Point) {
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
