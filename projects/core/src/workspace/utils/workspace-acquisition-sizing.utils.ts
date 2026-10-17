// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { allocatedContextRect, contextKey } from './workspace-context.utils.js';
import {
  samePlacementIntent,
  type WorkspaceDropIntent,
  type WorkspaceDragPreview
} from './workspace-drag-preview.utils.js';
import { describePlacementSlot } from './workspace-group-insertion.utils.js';
import { panelIds, fitSizes, type WorkspaceLayout, type WorkspaceSplit } from './workspace-layout.utils.js';
import { projectLayout } from './workspace-operations.utils.js';
import { allocateWorkspace, type WorkspacePlacedRegion, type WorkspaceRect } from './workspace-placement.utils.js';
import type { WorkspacePlacementPlan } from './workspace-planner.utils.js';
import { rebaseProjectedSplit } from './workspace-resize.utils.js';
import { minimumWorkspace, type WorkspaceRequirements } from './workspace-sizing.utils.js';

interface AcquisitionInput {
  plan: WorkspacePlacementPlan;
  previous: WorkspaceLayout;
  source: string[];
  available: string[];
  current: WorkspacePlacedRegion[];
  rect: WorkspaceRect;
  acquisition: { rect: WorkspaceRect; point: { x: number; y: number } };
  requirements: WorkspaceRequirements;
}

interface Fit {
  input: AcquisitionInput;
  axis: 'x' | 'y';
  extent: 'width' | 'height';
  range: (axis: 'x' | 'y') => { start: number; end: number };
  covers: (rect: WorkspaceRect, axis: 'x' | 'y') => boolean;
  allocate: (layout: WorkspaceLayout) => ReturnType<typeof allocateWorkspace>;
}

/** Fits a cross-scope interior reservation to its acquired scene without retaining a hidden target. */
export function fitAcquiredPlacement(input: AcquisitionInput): WorkspacePlacementPlan | undefined {
  const next = describePlacementSlot(input);
  const prior = describePlacementSlot({ ...input, plan: { layout: input.previous } });
  if (!crossScopeInterior(next, prior)) return input.plan;
  const fit = acquisitionFit(input, next.axis);
  const moving = fit
    .allocate(input.plan.layout)
    .groups.find(group => group.group.panels.every(id => input.source.includes(id)));
  if (!moving) return undefined;
  if (coversAcquisition(fit, moving.rect)) return input.plan;
  const ancestors = fitReceivingPath(fit, moving.key);
  const layout = ancestors && fitIncoming(fit, ancestors, moving.key);
  const achieved = layout && fit.allocate(layout).groups.find(group => group.key === moving.key);
  return layout && coversAcquisition(fit, achieved?.rect) ? { ...input.plan, layout } : undefined;
}

function crossScopeInterior(
  next: ReturnType<typeof describePlacementSlot>,
  prior: ReturnType<typeof describePlacementSlot>
): next is NonNullable<typeof next> {
  return (
    !!next?.previous &&
    !!next.next &&
    !!prior &&
    (next.axis !== prior.axis || contextKey(next.members) !== contextKey(prior.members))
  );
}

function coversAcquisition(fit: Fit, rect?: WorkspaceRect) {
  return !!rect && fit.covers(rect, 'x') && fit.covers(rect, 'y');
}

function acquisitionFit(input: AcquisitionInput, direction: WorkspaceSplit['axis']): Fit {
  const axis = direction === 'horizontal' ? 'x' : 'y';
  const extent = axis === 'x' ? 'width' : 'height';
  const range = (dimension: 'x' | 'y') =>
    dimension === axis
      ? { start: input.acquisition.rect[axis], end: input.acquisition.rect[axis] + input.acquisition.rect[extent] }
      : { start: input.acquisition.point[dimension], end: input.acquisition.point[dimension] };
  return {
    input,
    axis,
    extent,
    range,
    covers: (rect, dimension) => coversRange(rect, dimension, range(dimension)),
    allocate: layout =>
      allocateWorkspace({
        root: projectLayout(layout, input.available).root,
        rect: input.rect,
        minimum: node => minimumWorkspace(node, input.requirements),
        policy: 'stop',
        gap: input.requirements.gap
      })
  };
}

function coversRange(rect: WorkspaceRect, axis: 'x' | 'y', range: { start: number; end: number }) {
  const end = rect[axis] + rect[axis === 'x' ? 'width' : 'height'];
  return range.start === range.end
    ? rect[axis] <= range.start && range.start < end
    : rect[axis] <= range.start + 1e-7 && end >= range.end - 1e-7;
}

function fitReceivingPath(fit: Fit, moving: string) {
  const path = moving.split('.');
  let layout: WorkspaceLayout | undefined = fit.input.plan.layout;
  for (let depth = 1; depth < path.length - 1; depth++) {
    if (!layout) return undefined;
    const key = path.slice(0, depth).join('.');
    const regions = fit.allocate(layout).regions;
    const parent = regions.find(region => region.key === key)!;
    const receiving = regions.find(region => region.key === `${key}.${path[depth]}`)!;
    if (parent.node.type !== 'split') return undefined;
    const axis = parent.node.axis === 'horizontal' ? 'x' : 'y';
    if (!fit.covers(receiving.rect, axis)) layout = fitAncestor({ fit, layout, parent, index: Number(path[depth]) });
  }
  return layout;
}

function fitAncestor({
  fit,
  layout,
  parent,
  index
}: {
  fit: Fit;
  layout: WorkspaceLayout;
  parent: WorkspacePlacedRegion;
  index: number;
}) {
  if (parent.node.type !== 'split') return undefined;
  const size = parent.node.axis === 'horizontal' ? 'width' : 'height';
  const minima = parent.node.children.map(child => minimumWorkspace(child, fit.input.requirements)[size]);
  const budget = parent.rect[size] - fit.input.requirements.gap * (minima.length - 1);
  const extents = parent.node.children.map((child, slot) =>
    slot === index
      ? 0
      : allocatedContextRect({
          members: panelIds(child),
          allocation: fit.input.current,
          source: fit.input.source
        })?.[size]
  );
  if (extents.some(value => value === undefined) || sum(minima) > budget) return undefined;
  const preferred = extents.map(value => value!);
  preferred[index] = Math.max(minima[index]!, budget - sum(preferred));
  return rebaseProjectedSplit(layout, parent.node, fitSizes(preferred, minima, budget), fit.input.available) ?? layout;
}

function fitIncoming(fit: Fit, layout: WorkspaceLayout, key: string) {
  const allocation = fit.allocate(layout);
  const owner = allocation.regions.find(region => region.key === key.split('.').slice(0, -1).join('.'))!;
  if (owner.node.type !== 'split') return undefined;
  const incoming = allocation.groups.find(group => group.key === key)!;
  const index = Number(key.split('.').at(-1));
  const sizes = incomingSizes({ fit, owner: { ...owner, node: owner.node }, incoming: incoming.rect, index });
  return sizes ? (rebaseProjectedSplit(layout, owner.node, sizes, fit.input.available) ?? layout) : undefined;
}

function incomingSizes(input: {
  fit: Fit;
  owner: WorkspacePlacedRegion & { node: WorkspaceSplit };
  incoming: WorkspaceRect;
  index: number;
}) {
  const { fit, owner, incoming, index } = input;
  const { axis, extent } = fit;
  const minima = owner.node.children.map(child => minimumWorkspace(child, fit.input.requirements)[extent]);
  const before = minima.slice(0, index),
    after = minima.slice(index + 1);
  const start = Math.max(
    owner.rect[axis] + sum(before) + fit.input.requirements.gap * index,
    fit.range(axis).end - incoming[extent]
  );
  const end = Math.min(
    owner.rect[axis] + owner.rect[extent] - sum(after) - fit.input.requirements.gap * after.length - incoming[extent],
    fit.range(axis).start
  );
  if (start > end) return undefined;
  const position = Math.max(start, Math.min(incoming[axis], end));
  return [
    ...fitSizes(
      owner.node.weights.slice(0, index),
      before,
      position - owner.rect[axis] - fit.input.requirements.gap * index
    ),
    incoming[extent],
    ...fitSizes(
      owner.node.weights.slice(index + 1),
      after,
      owner.rect[axis] + owner.rect[extent] - position - incoming[extent] - fit.input.requirements.gap * after.length
    )
  ];
}

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);

/** Reuses the actual selected reservation before considering a different spatial offer. */
export function selectedPlacementPlan(
  input: Omit<AcquisitionInput, 'previous' | 'acquisition'> & {
    previous?: WorkspaceDragPreview;
    acquisition?: { rect: WorkspaceRect; point: { x: number; y: number } };
    origin: WorkspaceRect;
    intent: WorkspaceDropIntent;
  }
): WorkspacePlacementPlan | undefined {
  const prior = input.previous;
  if (blockedSelection(prior, input.intent) && !input.acquisition) return undefined;
  if (!selectedReservation(prior, input.source) || !spatialReservation(prior, input.plan)) return input.plan;
  const current = describePlacementSlot({ ...input, plan: prior });
  const next = describePlacementSlot(input);
  if (current && current.key === next?.key) return { ...input.plan, layout: prior.layout };
  if (!input.acquisition) return input.plan;
  const { rect, point } = input.acquisition;
  return fitAcquiredPlacement({
    ...input,
    previous: prior.layout,
    acquisition: {
      rect: { ...rect, x: rect.x - input.origin.x, y: rect.y - input.origin.y },
      point: { x: point.x - input.origin.x, y: point.y - input.origin.y }
    }
  });
}

function spatialReservation(preview: WorkspaceDragPreview, plan: WorkspacePlacementPlan) {
  return ['order', 'insert'].includes(preview.intent.kind) && ['insert', 'reorder'].includes(plan.kind);
}

function selectedReservation(
  preview: WorkspaceDragPreview | undefined,
  source: string[]
): preview is Extract<WorkspaceDragPreview, { phase: 'detached' }> & { allocation: 'reserved' } {
  return (
    preview?.phase === 'detached' &&
    !preview.blocked &&
    preview.allocation === 'reserved' &&
    contextKey(preview.source) === contextKey(source)
  );
}

function blockedSelection(preview: WorkspaceDragPreview | undefined, intent: WorkspaceDropIntent) {
  return preview?.phase === 'detached' && preview.blocked && samePlacementIntent(preview.intent, intent);
}
