// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { affectedSplitContext } from './workspace-context.utils.js';
import { clipCue } from './workspace-drag-preview.utils.js';
import type { WorkspaceDestination } from './workspace-operations.utils.js';
import type { WorkspacePlacedRegion } from './workspace-placement.utils.js';
import type { WorkspacePlacementPlan } from './workspace-planner.utils.js';
import type { WorkspaceDragAllocation, WorkspaceRect } from './workspace-rearrange.controller.js';
import { planSeamPreview, seamPoint, type WorkspaceSeamPreview } from './workspace-seams.utils.js';

/** Separates a group split's intended half from its constrained committed allocation. */
export function offerPresentation(input: {
  plan: WorkspacePlacementPlan;
  regions: WorkspacePlacedRegion[];
  sourceKey: string;
  sourceRect: WorkspaceRect;
  cue: WorkspaceRect;
  bounds: WorkspaceRect;
  destination: WorkspaceDestination;
  feasible: boolean;
  split?: {
    source: string[];
    regions: WorkspacePlacedRegion[];
    groups: { panels: { id: string }[]; rect: WorkspaceRect }[];
  };
  client(rect: WorkspaceRect): WorkspaceRect;
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
        ? affectedSplitContext({
            baseline: input.split.regions,
            achieved: input.regions,
            source: input.split.source,
            recipient: recipient.panels.map(panel => panel.id)
          })
        : input.plan.context
  };
}

function offerSeams(
  input: Parameters<typeof offerPresentation>[0],
  intent: ReturnType<typeof splitIntent> | undefined,
  cue: WorkspaceRect
): WorkspaceSeamPreview | undefined {
  if (!input.feasible) return undefined;
  if (intent) return intentSeam(intent, cue, input.bounds);
  return planSeamPreview({ ...input, cue, position: input.destination.position });
}

function splitIntent(rect: WorkspaceRect, position: Exclude<WorkspaceDestination['position'], 'tab'>) {
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
  intent: { cue: WorkspaceRect; seams: WorkspaceSeamPreview },
  cue: WorkspaceRect,
  bounds: WorkspaceRect
): WorkspaceSeamPreview | undefined {
  const edge = intent.seams.edges[0]!;
  const vertical = edge.side === 'left' || edge.side === 'right';
  const { x, y } = seamPoint(intent.cue, edge.side, 0);
  if (x < bounds.x || x >= bounds.x + bounds.width || y < bounds.y || y >= bounds.y + bounds.height) return undefined;
  const fraction = vertical ? (y - cue.y) / cue.height : (x - cue.x) / cue.width;
  return Number.isFinite(fraction) ? { kind: 'split', edges: [{ ...edge, fraction }] } : undefined;
}

/** Chooses live reservation separately from the unchanged candidate and commitment. */
export function offerAllocation(plan: WorkspacePlacementPlan, feasible: boolean): WorkspaceDragAllocation {
  return (plan.kind === 'reorder' || plan.kind === 'tab' || plan.kind === 'insert') && feasible
    ? { allocation: 'reserved', layout: plan.layout }
    : { allocation: 'overlay' };
}
