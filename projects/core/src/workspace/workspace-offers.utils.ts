// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { allocatedContextRect } from './workspace-context.utils.js';
import type { WorkspaceDropIntent } from './workspace-drag-preview.utils.js';
import { describePlacementSlot } from './workspace-group-insertion.utils.js';
import type { WorkspaceLayout, WorkspaceNode } from './workspace-layout.utils.js';
import type { WorkspaceDestination } from './workspace-operations.utils.js';
import type { WorkspacePlacedRegion } from './workspace-placement.utils.js';
import { planWorkspacePlacement, type WorkspacePlacementPlan } from './workspace-planner.utils.js';
import type { WorkspaceRect } from './workspace-rearrange.controller.js';

export interface PlacementOffer {
  kind: 'order' | 'insert';
  owner: string;
  boundary?: 'start' | 'end';
  scope: NonNullable<ReturnType<typeof describePlacementSlot>>;
  plan: WorkspacePlacementPlan;
  rect: WorkspaceRect;
  hitRect?: WorkspaceRect;
  scopeRect: WorkspaceRect;
  destination: WorkspaceDestination;
}

/** Gives only an explicit peer lane or structural receiving endcap priority over chrome. */
export function placementOwnsChrome(offer: PlacementOffer) {
  const childSlot = offer.destination.region?.slice(0, offer.destination.region.lastIndexOf('.')) === offer.owner;
  return offer.kind === 'order' || !!offer.boundary || (childSlot && !!offer.scope.previous && !!offer.scope.next);
}

const ids = (node: WorkspaceNode): string[] => (node.type === 'group' ? node.panels : node.children.flatMap(ids));

const directions = ['left', 'right', 'top', 'bottom'] as const;

export function sourcePeerRegion(node: WorkspaceNode | null, source: string[], key = 'root'): string | undefined {
  if (node?.type !== 'split') return undefined;
  if (node.children.some(child => child.type === 'group' && child.panels.every(id => source.includes(id)))) return key;
  for (const [index, child] of node.children.entries()) {
    const owner = sourcePeerRegion(child, source, `${key}.${index}`);
    if (owner) return owner;
  }
  return undefined;
}

/** Adds only canonical planner-backed insertion slots; aliases share one descriptor. */
export function insertionHints(input: {
  saved: WorkspaceLayout;
  root: WorkspaceNode | null;
  source: string[];
  available: string[];
  regions: WorkspacePlacedRegion[];
  explorationRegions?: WorkspacePlacedRegion[];
  existing: PlacementOffer[];
  gap: number;
}) {
  const hints: PlacementOffer[] = [];
  const seen = new Set<string>();
  for (const hint of input.existing) {
    seen.add(hint.scope.key);
    hints.push(hint);
  }
  const candidates = splitGroups(input.root)
    .flatMap(group => groupInsertions(input, group))
    .sort((a, b) => Number(a.interior) - Number(b.interior));
  for (const { offer } of candidates) {
    if (seen.has(offer.scope.key)) continue;
    seen.add(offer.scope.key);
    hints.push(offer);
  }
  return hints;
}

function groupInsertions(
  input: Parameters<typeof insertionHints>[0],
  group: { node: WorkspaceNode; key: string }
): { offer: PlacementOffer; interior: boolean }[] {
  const rect = allocatedContextRect({
    members: ids(group.node).filter(id => !input.source.includes(id)),
    allocation: input.regions,
    source: input.source
  });
  if (!rect) return [];
  return insertionDestinations(group).flatMap(({ target, key, direction, interior }) => {
    const destination: WorkspaceDestination = {
      target: ids(target).find(id => !input.source.includes(id)) ?? '',
      region: key,
      position: direction
    };
    const plan = planWorkspacePlacement({
      layout: input.saved,
      source: input.source,
      destination,
      available: input.available,
      operation: 'insert'
    });
    if (!plan) return [];
    const slot = describePlacementSlot({ plan, source: input.source, available: input.available });
    if (!slot) return [];
    const domain = insertionEndcap(input, slot) ?? rect;
    const rectArea = edgeArea(domain, direction);
    if (!rectArea) return [];
    const offer: PlacementOffer = {
      scope: slot,
      owner: group.key,
      boundary: !slot.previous ? 'start' : !slot.next ? 'end' : undefined,
      plan,
      scopeRect: domain,
      rect: rectArea,
      destination,
      kind: plan.kind === 'reorder' ? 'order' : 'insert'
    };
    return (interior ? interiorInsertion(offer, input) : [offer]).map(candidate => ({ offer: candidate, interior }));
  });
}

function insertionDestinations(group: { node: WorkspaceNode; key: string }) {
  const destinations = directions.map(direction => ({
    target: group.node,
    key: group.key,
    direction,
    interior: false
  }));
  if (group.node.type === 'split') {
    const direction = group.node.axis === 'horizontal' ? 'left' : 'top';
    group.node.children.slice(1).forEach((target, index) =>
      destinations.push({
        target,
        key: `${group.key}.${index + 1}`,
        direction,
        interior: true
      })
    );
  }
  return destinations;
}

function interiorInsertion(offer: PlacementOffer, input: Parameters<typeof insertionHints>[0]): PlacementOffer[] {
  const seam = currentInsertionSeam(offer, input);
  return seam ? [{ ...offer, rect: seam }] : [];
}

function insertionEndcap(
  input: Parameters<typeof insertionHints>[0],
  slot: NonNullable<ReturnType<typeof describePlacementSlot>>
) {
  if (!!slot.previous === !!slot.next) return undefined;
  return allocatedContextRect({
    members: slot.members,
    allocation: input.explorationRegions ?? input.regions,
    source: input.source
  });
}

function splitGroups(node: WorkspaceNode | null, key = 'root'): { key: string; node: WorkspaceNode }[] {
  return node?.type === 'split'
    ? [{ key, node }, ...node.children.flatMap((child, index) => splitGroups(child, `${key}.${index}`))]
    : [];
}

function edgeArea(rect: WorkspaceRect, direction: (typeof directions)[number]): WorkspaceRect | undefined {
  if (direction === 'left' || direction === 'right')
    return 12 <= rect.width
      ? {
          x: direction === 'left' ? rect.x : rect.x + rect.width - 12,
          y: rect.y,
          width: 12,
          height: rect.height
        }
      : undefined;
  return 12 <= rect.height
    ? {
        x: rect.x,
        y: direction === 'top' ? rect.y : rect.y + rect.height - 12,
        width: rect.width,
        height: 12
      }
    : undefined;
}

/** Shares the painted descriptor's exact operation with input resolution. */
export function placementOfferIntent(hint: PlacementOffer): WorkspaceDropIntent {
  if (hint.destination.position === 'tab') return { kind: 'invalid' };
  const destination = { ...hint.destination, position: hint.destination.position };
  return hint.kind === 'insert' ? { kind: 'insert', destination } : { kind: 'order', destination };
}

/** Locates ordering availability in the computed exploration scene, not a prospective landing. */
export function orderHintRect(input: {
  owner: WorkspaceRect;
  recipient: WorkspaceRect;
  previous?: WorkspaceRect;
  axis: 'horizontal' | 'vertical';
  after: boolean;
  sourceSlot?: WorkspaceRect;
  boundary?: 'start' | 'end';
}): WorkspaceRect | undefined {
  const horizontal = input.axis === 'horizontal';
  const start = horizontal ? 'x' : 'y';
  const extent = horizontal ? 'width' : 'height';
  if (input.owner[extent] < 12) return undefined;
  const normal = orderAnchor(input, { start, extent });
  return horizontal
    ? { x: normal, y: input.owner.y, width: 12, height: input.owner.height }
    : { x: input.owner.x, y: normal, width: input.owner.width, height: 12 };
}

function orderAnchor(
  input: Parameters<typeof orderHintRect>[0],
  { start, extent }: { start: 'x' | 'y'; extent: 'width' | 'height' }
) {
  if (input.boundary === 'start') return input.owner[start];
  const end = input.owner[start] + input.owner[extent] - 12;
  if (input.boundary === 'end') return end;
  const slot = input.sourceSlot;
  if (input.after)
    return slot && slot[start] >= input.recipient[start] + input.recipient[extent]
      ? (input.recipient[start] + input.recipient[extent] + slot[start]) / 2 - 6
      : end;
  if (!input.previous) return input.owner[start];
  const previousEnd = input.previous[start] + input.previous[extent];
  const nextStart =
    slot && slot[start] >= previousEnd && slot[start] < input.recipient[start] ? slot[start] : input.recipient[start];
  return (previousEnd + nextStart) / 2 - 6;
}

/** Partitions coincident scoped offers with the existing outer-to-inner twelve-pixel lanes. */
export function partitionPlacementOffers(offers: PlacementOffer[]): PlacementOffer[] {
  const sorted = [...offers].sort((a, b) => tangentExtent(b) - tangentExtent(a));
  const placed: PlacementOffer[] = [];
  const occupied: PlacementOffer[] = [];
  for (const offer of sorted) {
    const lane = occupied.filter(other => sameEdge(offer, other)).length;
    occupied.push(offer);
    const vertical = offer.rect.width === 12;
    const shift =
      (offer.destination.position === 'right' || offer.destination.position === 'bottom' ? -1 : 1) * lane * 12;
    const rect = { ...offer.rect, x: offer.rect.x + (vertical ? shift : 0), y: offer.rect.y + (vertical ? 0 : shift) };
    if (
      rect.x < offer.scopeRect.x ||
      rect.y < offer.scopeRect.y ||
      rect.x + rect.width > offer.scopeRect.x + offer.scopeRect.width ||
      rect.y + rect.height > offer.scopeRect.y + offer.scopeRect.height
    )
      continue;
    placed.push({ ...offer, rect });
  }
  return placed;
}

function tangentExtent(offer: PlacementOffer) {
  return offer.rect.width === 12 ? offer.rect.height : offer.rect.width;
}

function sameEdge(a: PlacementOffer, b: PlacementOffer) {
  const vertical = a.rect.width === 12;
  if (vertical !== (b.rect.width === 12) || a.destination.position !== b.destination.position) return false;
  const normal = vertical ? 'x' : 'y';
  const tangent = vertical ? 'y' : 'x';
  const extent = vertical ? 'height' : 'width';
  return (
    Math.abs(a.rect[normal] - b.rect[normal]) < 1 &&
    Math.max(a.rect[tangent], b.rect[tangent]) <
      Math.min(a.rect[tangent] + a.rect[extent], b.rect[tangent] + b.rect[extent])
  );
}

/** Resolves an interior normalized INSERT slot against today's computed peers, not its future candidate boxes. */
export function currentInsertionSeam(
  offer: PlacementOffer,
  scene: { regions: WorkspacePlacedRegion[]; source: string[]; gap: number }
): WorkspaceRect | undefined {
  if (offer.kind !== 'insert' || !offer.scope.previous || !offer.scope.next) return undefined;
  const previous = allocatedContextRect({
    members: offer.scope.previous,
    allocation: scene.regions,
    source: scene.source
  });
  const next = allocatedContextRect({ members: offer.scope.next, allocation: scene.regions, source: scene.source });
  if (!previous || !next) return undefined;
  const { normal, normalExtent, tangent, tangentSize } = axisDimensions(offer.scope.axis);
  const gap = next[normal] - previous[normal] - previous[normalExtent];
  if (Math.abs(gap - scene.gap) > 1) return undefined;
  const from = Math.max(previous[tangent], next[tangent]);
  const to = Math.min(previous[tangent] + previous[tangentSize], next[tangent] + next[tangentSize]);
  if (to <= from) return undefined;
  const owner = { ...offer.scopeRect, [tangent]: from, [tangentSize]: to - from };
  return orderHintRect({ owner, recipient: next, previous, axis: offer.scope.axis, after: false });
}

function axisDimensions(axis: 'horizontal' | 'vertical') {
  return axis === 'horizontal'
    ? ({ normal: 'x', normalExtent: 'width', tangent: 'y', tangentSize: 'height' } as const)
    : ({ normal: 'y', normalExtent: 'height', tangent: 'x', tangentSize: 'width' } as const);
}
