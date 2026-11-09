// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Rect } from '@nvidia-elements/core/internal';

import { getPanelIds } from '../model/layout.utils.js';
import { getGroupInsertion } from '../placement/group-insertion.utils.js';
import { resolvePlacementPlan } from '../placement/planner.utils.js';
import { getAllocatedScopeRect } from '../placement/scope.utils.js';

import type { WorkspacePlacedRegion } from '../geometry/allocation.utils.js';
import type { WorkspaceDropIntent } from './drag-preview.utils.js';
import type { WorkspaceLayout, WorkspaceNode } from '../model/layout.utils.js';
import type { WorkspaceDestination } from '../model/operations.utils.js';
import type { WorkspaceLayoutProjector } from '../model/projection.utils.js';
import type { GroupInsertion } from '../placement/group-insertion.utils.js';
import type { WorkspacePlacementPlan, WorkspacePlacementPlanner } from '../placement/planner.utils.js';
import type { WorkspaceScopeRectResolver } from '../placement/scope.utils.js';
import type { WorkspacePlacementSession } from '../placement/session.utils.js';

export interface WorkspaceInsertionOffer {
  kind: 'order' | 'insert';
  owner: string;
  boundary?: 'start' | 'end';
  insertion: GroupInsertion;
  plan: WorkspacePlacementPlan;
  rect: Rect;
  hitRect?: Rect;
  scopeRect: Rect;
  destination: WorkspaceDestination;
}

/** Gives only an explicit peer lane or structural receiving endcap priority over chrome. */
export function placementOwnsChrome(offer: WorkspaceInsertionOffer) {
  const targetsDirectChild =
    offer.destination.region?.slice(0, offer.destination.region.lastIndexOf('.')) === offer.owner;
  return (
    offer.kind === 'order' ||
    !!offer.boundary ||
    (targetsDirectChild && !!offer.insertion.previous && !!offer.insertion.next)
  );
}

const directions = ['left', 'right', 'top', 'bottom'] as const;

export function findSourcePeerRegionKey(
  node: WorkspaceNode | null,
  source: string[],
  key = 'root'
): string | undefined {
  if (node?.type !== 'split') return undefined;
  if (node.children.some(child => child.type === 'group' && child.panels.every(id => source.includes(id)))) return key;
  for (const [index, child] of node.children.entries()) {
    const owner = findSourcePeerRegionKey(child, source, `${key}.${index}`);
    if (owner) return owner;
  }
  return undefined;
}

/** Aliases of the same planned insertion share one offer. */
export function createInsertionOffers(input: {
  currentLayout: WorkspaceLayout;
  root: WorkspaceNode | null;
  source: string[];
  available: string[];
  projectLayout?: WorkspaceLayoutProjector;
  planPlacement?: WorkspacePlacementPlanner;
  placementSession?: WorkspacePlacementSession;
  resolveScopeRect?: WorkspaceScopeRectResolver;
  regions: WorkspacePlacedRegion[];
  explorationRegions?: WorkspacePlacedRegion[];
  existing: WorkspaceInsertionOffer[];
  gap: number;
}) {
  const offers: WorkspaceInsertionOffer[] = [];
  const seen = new Set<string>();
  for (const offer of input.existing) {
    seen.add(offer.insertion.key);
    offers.push(offer);
  }
  const candidates = splitGroups(input.root)
    .flatMap(group => groupInsertions(input, group))
    .sort((a, b) => Number(a.interior) - Number(b.interior));
  for (const { offer } of candidates) {
    if (seen.has(offer.insertion.key)) continue;
    seen.add(offer.insertion.key);
    offers.push(offer);
  }
  return offers;
}

function groupInsertions(
  input: Parameters<typeof createInsertionOffers>[0],
  group: { node: WorkspaceNode; key: string }
): { offer: WorkspaceInsertionOffer; interior: boolean }[] {
  const members = getPanelIds(group.node).filter(id => !input.source.includes(id));
  const rect = (input.resolveScopeRect ?? getAllocatedScopeRect)({
    members,
    allocation: input.regions,
    source: input.source
  });
  if (!rect) return [];
  const explorationRect = (input.resolveScopeRect ?? getAllocatedScopeRect)({
    members,
    allocation: input.explorationRegions ?? input.regions,
    source: input.source
  });
  const context = { input, group, rect };
  const explorationContext = explorationRect ? { ...context, rect: explorationRect } : undefined;
  return insertionDestinations(group).flatMap(destination => {
    // Receiving edges cannot depend on their own reservation; peer seams follow allocated neighbors.
    const receivingContext = destination.interior ? context : explorationContext;
    return receivingContext ? createInsertionOffer(receivingContext, destination) : [];
  });
}

function createInsertionOffer(
  {
    input,
    group,
    rect
  }: {
    input: Parameters<typeof createInsertionOffers>[0];
    group: { node: WorkspaceNode; key: string };
    rect: Rect;
  },
  { target, key, direction, interior }: ReturnType<typeof insertionDestinations>[number]
): { offer: WorkspaceInsertionOffer; interior: boolean }[] {
  const destination: WorkspaceDestination = {
    target: getPanelIds(target).find(id => !input.source.includes(id)) ?? '',
    region: key,
    position: direction
  };
  const plan = resolvePlacementPlan(input, destination, 'insert');
  if (!plan) return [];
  const insertion = getGroupInsertion({
    plan,
    source: input.source,
    available: input.available,
    projectLayout: input.projectLayout,
    placementSession: input.placementSession,
    planPlacement: input.planPlacement
  });
  if (!insertion) return [];
  const domain = insertionEndcap(input, insertion) ?? rect;
  const rectArea = edgeArea(domain, direction);
  if (!rectArea) return [];
  const offer: WorkspaceInsertionOffer = {
    insertion,
    owner: group.key,
    boundary: !insertion.previous ? 'start' : !insertion.next ? 'end' : undefined,
    plan,
    scopeRect: domain,
    rect: rectArea,
    destination,
    kind: plan.kind === 'reorder' ? 'order' : 'insert'
  };
  return (interior ? interiorInsertion(offer, input) : [offer]).map(candidate => ({ offer: candidate, interior }));
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

function interiorInsertion(
  offer: WorkspaceInsertionOffer,
  input: Parameters<typeof createInsertionOffers>[0]
): WorkspaceInsertionOffer[] {
  const seam = getCurrentInsertionSeam(offer, input);
  return seam ? [{ ...offer, rect: seam }] : [];
}

function insertionEndcap(input: Parameters<typeof createInsertionOffers>[0], insertion: GroupInsertion) {
  if (!!insertion.previous === !!insertion.next) return undefined;
  return (input.resolveScopeRect ?? getAllocatedScopeRect)({
    members: insertion.members,
    allocation: input.explorationRegions ?? input.regions,
    source: input.source
  });
}

function splitGroups(node: WorkspaceNode | null, key = 'root'): { key: string; node: WorkspaceNode }[] {
  return node?.type === 'split'
    ? [{ key, node }, ...node.children.flatMap((child, index) => splitGroups(child, `${key}.${index}`))]
    : [];
}

function edgeArea(rect: Rect, direction: (typeof directions)[number]): Rect | undefined {
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

/** Shares the painted offer's exact operation with input resolution. */
export function getPlacementOfferIntent(offer: WorkspaceInsertionOffer): WorkspaceDropIntent {
  if (offer.destination.position === 'tab') return { kind: 'invalid' };
  const destination = { ...offer.destination, position: offer.destination.position };
  return offer.kind === 'insert' ? { kind: 'insert', destination } : { kind: 'order', destination };
}

/** Locates ordering availability in the computed exploration geometry, not a prospective landing. */
export function getOrderHintRect(input: {
  owner: Rect;
  recipient: Rect;
  previous?: Rect;
  axis: 'horizontal' | 'vertical';
  after: boolean;
  sourceReservation?: Rect;
  boundary?: 'start' | 'end';
}): Rect | undefined {
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
  input: Parameters<typeof getOrderHintRect>[0],
  { start, extent }: { start: 'x' | 'y'; extent: 'width' | 'height' }
) {
  if (input.boundary === 'start') return input.owner[start];
  const end = input.owner[start] + input.owner[extent] - 12;
  if (input.boundary === 'end') return end;
  const sourceReservation = input.sourceReservation;
  if (input.after)
    return sourceReservation && sourceReservation[start] >= input.recipient[start] + input.recipient[extent]
      ? (input.recipient[start] + input.recipient[extent] + sourceReservation[start]) / 2 - 6
      : end;
  if (!input.previous) return input.owner[start];
  const previousEnd = input.previous[start] + input.previous[extent];
  const nextStart =
    sourceReservation && sourceReservation[start] >= previousEnd && sourceReservation[start] < input.recipient[start]
      ? sourceReservation[start]
      : input.recipient[start];
  return (previousEnd + nextStart) / 2 - 6;
}

/** Orders overlapping insertion offers into lanes from outermost to innermost. */
export function partitionPlacementOffers(offers: WorkspaceInsertionOffer[]): WorkspaceInsertionOffer[] {
  const sorted = [...offers].sort((a, b) => tangentExtent(b) - tangentExtent(a));
  const placed: WorkspaceInsertionOffer[] = [];
  const occupied: WorkspaceInsertionOffer[] = [];
  for (const offer of sorted) {
    const lane = occupied.filter(other => sameEdge(offer, other)).length;
    occupied.push(offer);
    const vertical = isVerticalEdge(offer.destination.position);
    const shift =
      (offer.destination.position === 'right' || offer.destination.position === 'bottom' ? -1 : 1) * lane * 12;
    const rect = { ...offer.rect, x: offer.rect.x + (vertical ? shift : 0), y: offer.rect.y + (vertical ? 0 : shift) };
    if (
      rect.x < offer.scopeRect.x ||
      rect.y < offer.scopeRect.y ||
      rect.x + rect.width > offer.scopeRect.x + offer.scopeRect.width ||
      rect.y + rect.height > offer.scopeRect.y + offer.scopeRect.height
    ) {
      continue;
    }
    placed.push({ ...offer, rect });
  }
  return placed;
}

function isVerticalEdge(position: WorkspaceDestination['position']) {
  return position === 'left' || position === 'right';
}

function tangentExtent(offer: WorkspaceInsertionOffer) {
  return offer.destination.position === 'left' || offer.destination.position === 'right'
    ? offer.rect.height
    : offer.rect.width;
}

function sameEdge(a: WorkspaceInsertionOffer, b: WorkspaceInsertionOffer) {
  if (a.destination.position !== b.destination.position) return false;
  const vertical = isVerticalEdge(a.destination.position);
  const normal = vertical ? 'x' : 'y';
  const tangent = vertical ? 'y' : 'x';
  const extent = vertical ? 'height' : 'width';
  return (
    Math.abs(a.rect[normal] - b.rect[normal]) < 1 &&
    Math.max(a.rect[tangent], b.rect[tangent]) <
      Math.min(a.rect[tangent] + a.rect[extent], b.rect[tangent] + b.rect[extent])
  );
}

/** Uses current peer geometry for interior insertion cues, before allocating the candidate. */
export function getCurrentInsertionSeam(
  offer: WorkspaceInsertionOffer,
  geometry: {
    regions: WorkspacePlacedRegion[];
    source: string[];
    gap: number;
    resolveScopeRect?: WorkspaceScopeRectResolver;
  }
): Rect | undefined {
  if (offer.kind !== 'insert' || !offer.insertion.previous || !offer.insertion.next) return undefined;
  const previous = (geometry.resolveScopeRect ?? getAllocatedScopeRect)({
    members: offer.insertion.previous,
    allocation: geometry.regions,
    source: geometry.source
  });
  const next = (geometry.resolveScopeRect ?? getAllocatedScopeRect)({
    members: offer.insertion.next,
    allocation: geometry.regions,
    source: geometry.source
  });
  if (!previous || !next) return undefined;
  const { normal, normalExtent, tangent, tangentSize } = axisDimensions(offer.insertion.axis);
  const gap = next[normal] - previous[normal] - previous[normalExtent];
  if (Math.abs(gap - geometry.gap) > 1) return undefined;
  const from = Math.max(previous[tangent], next[tangent]);
  const to = Math.min(previous[tangent] + previous[tangentSize], next[tangent] + next[tangentSize]);
  if (to <= from) return undefined;
  const owner = { ...offer.scopeRect, [tangent]: from, [tangentSize]: to - from };
  return getOrderHintRect({ owner, recipient: next, previous, axis: offer.insertion.axis, after: false });
}

function axisDimensions(axis: 'horizontal' | 'vertical') {
  return axis === 'horizontal'
    ? ({ normal: 'x', normalExtent: 'width', tangent: 'y', tangentSize: 'height' } as const)
    : ({ normal: 'y', normalExtent: 'height', tangent: 'x', tangentSize: 'width' } as const);
}
