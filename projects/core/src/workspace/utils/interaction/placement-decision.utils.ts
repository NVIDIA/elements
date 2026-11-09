// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Point, Rect } from '@nvidia-elements/core/internal';

import { getBoundaryPlacementOffers } from './boundary.utils.js';
import { clipCue, matchesPlacementIntent } from './drag-preview.utils.js';
import {
  createInsertionOffers,
  findSourcePeerRegionKey,
  getOrderHintRect,
  getPlacementOfferIntent,
  placementOwnsChrome
} from './insertion-offers.utils.js';
import { getPanelIds, getSplitSide } from '../model/layout.utils.js';
import { getTabInsertionIndex, preservesGroupMembership } from '../model/membership.utils.js';
import { findGroup, projectLayout } from '../model/operations.utils.js';
import { getGroupInsertion } from '../placement/group-insertion.utils.js';
import { resolvePlacementPlan } from '../placement/planner.utils.js';
import { findWorkspaceRegion } from '../placement/region.utils.js';
import { createScopeRectResolver } from '../placement/scope.utils.js';

import type { WorkspacePlacedRegion } from '../geometry/allocation.utils.js';
import type { WorkspaceDragPreview, WorkspaceDropIntent, WorkspacePlacementAcquisition } from './drag-preview.utils.js';
import type { WorkspaceInsertionOffer } from './insertion-offers.utils.js';
import type { WorkspaceLayout, WorkspaceNode, WorkspaceSplit } from '../model/layout.utils.js';
import type { WorkspaceDestination } from '../model/operations.utils.js';
import type { WorkspaceLayoutProjector } from '../model/projection.utils.js';
import type { WorkspacePlacementPlanner } from '../placement/planner.utils.js';
import type { WorkspaceScopeRectResolver } from '../placement/scope.utils.js';
import type { WorkspacePlacementSession } from '../placement/session.utils.js';
import type { WorkspaceTarget } from '../presentation/groups.utils.js';
import type { WorkspacePlacementCatalog } from '../evaluation.utils.js';

interface WorkspacePlacementQuery {
  resolveScopeRect?: WorkspaceScopeRectResolver;
  gap: number;
  source: string[];
  point: Point;
  regions: WorkspacePlacedRegion[];
  orderingRegions?: WorkspacePlacedRegion[];
  sourceReservation?: Rect;
  headers?: Rect[];
  preview?: WorkspaceDragPreview;
  local?: WorkspaceDropIntent;
  header: boolean;
  bounds: Rect;
}

type DecisionInput = WorkspacePlacementQuery & {
  currentLayout: WorkspaceLayout;
  available: string[];
  projectLayout?: WorkspaceLayoutProjector;
  planPlacement?: WorkspacePlacementPlanner;
  placementSession?: WorkspacePlacementSession;
};

type OfferInput = DecisionInput & { resolveScopeRect: WorkspaceScopeRectResolver };

export interface WorkspacePlacementDecision {
  intent: WorkspaceDropIntent | undefined;
  acquisition?: WorkspacePlacementAcquisition;
}

interface PointerPlacementInput {
  placement: WorkspacePlacementCatalog;
  canonicalRoot: WorkspaceNode | null;
  currentLayout: WorkspaceLayout;
  source: string[];
  point: Point;
  heldIntent: WorkspaceDropIntent;
  groupable: boolean;
  gap: number;
  available: string[];
  projectLayout?: WorkspaceLayoutProjector;
  planPlacement?: WorkspacePlacementPlanner;
  placementSession?: WorkspacePlacementSession;
}

const inside = (rect: Rect, point: Point) =>
  point.x >= rect.x && point.x < rect.x + rect.width && point.y >= rect.y && point.y < rect.y + rect.height;

export function decidePointerPlacement(input: PointerPlacementInput): WorkspacePlacementDecision {
  const { placement, point } = input;
  const header = !!placement.headerTarget;
  const target =
    placement.headerTarget ??
    (inside(placement.bounds, point) ? placement.targets.find(item => inside(item.rect, point)) : undefined);
  const local = localPlacementIntent(input, target, header);
  return decidePlacement({
    ...placement,
    source: input.source,
    point,
    local,
    header,
    currentLayout: input.currentLayout,
    gap: input.gap,
    available: input.available,
    projectLayout: input.projectLayout,
    planPlacement: input.planPlacement,
    placementSession: input.placementSession
  });
}

/** Chooses input and availability together from the two operation-specific computed projections. */
export function decidePlacement(input: DecisionInput) {
  const boundary = placementOffers({ ...input, resolveScopeRect: input.resolveScopeRect ?? createScopeRectResolver() });
  const selectedKey = selectedInsertionKey(boundary.offers, input);
  const sourceReservation = getActiveSourceReservation(input);
  const hints = boundary.offers.filter(offer => eligiblePlacementHint(offer, sourceReservation, input.bounds));
  const nearest = nearestPlacementHint(hints, selectedKey, input.point);
  const candidate = inside(input.bounds, input.point)
    ? boundary.offers.find(
        offer => inside(offer.hitRect ?? offer.rect, input.point) && (!input.header || placementOwnsChrome(offer))
      )
    : undefined;
  const hit = boundary.hit ?? candidate;
  return {
    acquisition: hit ? { plan: hit.plan, rect: hit.hitRect ?? hit.rect } : undefined,
    intent: acquiredIntent(input, hit),
    hint: placementHint({
      hit: hit && hints.includes(hit) ? hit : undefined,
      selectedKey,
      boundary: boundary.hit,
      nearest
    })
  };
}

function nearestPlacementHint(hints: WorkspaceInsertionOffer[], selectedKey: string | undefined, point: Point) {
  let nearestOffer: WorkspaceInsertionOffer | undefined;
  let nearestDistance = Infinity;
  for (const offer of hints) {
    if (offer.insertion.key === selectedKey) continue;
    const offerDistance = distance(offer, point);
    if (!nearestOffer || offerDistance < nearestDistance) {
      nearestOffer = offer;
      nearestDistance = offerDistance;
    }
  }
  return nearestOffer && { offer: nearestOffer, distance: nearestDistance };
}

function localPlacementIntent(input: PointerPlacementInput, target: WorkspaceTarget | undefined, header: boolean) {
  const { reservationHit } = input.placement;
  const overReservedBody = !header && reservationHit;
  const overReservedTab = header && reservationHit === 'tab' && input.heldIntent.kind === 'tab';
  if (overReservedBody || overReservedTab) {
    return input.heldIntent;
  }
  if (!target) return undefined;
  const anchor = target.panels[0];
  if (!anchor) return { kind: 'invalid' } as const;
  if (header) {
    return headerPlacementIntent(input, target, anchor);
  }
  return {
    kind: 'split',
    destination: {
      target: anchor,
      position: contentDirection(input.point, { rect: target.rect, headerHeight: target.headerHeight })
    }
  } as const;
}

function headerPlacementIntent(input: PointerPlacementInput, target: WorkspaceTarget, anchor: string) {
  const tab = target.tabs.find(item => input.point.x < item.rect.x + item.rect.width / 2);
  const preferred = findGroup(input.canonicalRoot, anchor)?.panels ?? [];
  const index = getTabInsertionIndex(preferred, tab?.id);
  const intent = { kind: 'tab', destination: { target: anchor, position: 'tab', index } } as const;
  const allowed =
    input.groupable || preservesGroupMembership({ root: input.canonicalRoot, source: input.source, intent });
  return allowed ? intent : undefined;
}

function getActiveSourceReservation(input: WorkspacePlacementQuery) {
  const preview = input.preview;
  if (
    !input.sourceReservation ||
    preview?.phase !== 'detached' ||
    preview.blocked ||
    preview.allocation !== 'reserved' ||
    preview.cue.kind !== 'group'
  ) {
    return undefined;
  }
  return clipCue(input.sourceReservation, input.bounds);
}

function eligiblePlacementHint(offer: WorkspaceInsertionOffer, sourceReservation: Rect | undefined, bounds: Rect) {
  if (!sourceReservation) return true;
  const rect = clipCue(offer.rect, bounds);
  const vertical = offer.destination.position === 'left' || offer.destination.position === 'right';
  const normal = vertical ? 'x' : 'y';
  const normalSize = vertical ? 'width' : 'height';
  const tangent = vertical ? 'y' : 'x';
  const tangentSize = vertical ? 'height' : 'width';
  const normalInsideSource =
    rect[normal] > sourceReservation[normal] &&
    rect[normal] + rect[normalSize] < sourceReservation[normal] + sourceReservation[normalSize];
  if (!normalInsideSource) return true;

  const tangentCoveredBySource =
    rect[tangent] >= sourceReservation[tangent] &&
    rect[tangent] + rect[tangentSize] <= sourceReservation[tangent] + sourceReservation[tangentSize];
  return !tangentCoveredBySource;
}

function placementHint({
  hit,
  selectedKey,
  boundary,
  nearest
}: {
  hit?: WorkspaceInsertionOffer;
  selectedKey?: string;
  boundary?: WorkspaceInsertionOffer;
  nearest?: { offer: WorkspaceInsertionOffer; distance: number };
}) {
  if (hit && hit.insertion.key !== selectedKey) return hit;
  if (!boundary && nearest && nearest.distance <= 24) return nearest.offer;
  return undefined;
}

function placementOffers(input: OfferInput) {
  const root = (input.projectLayout ?? projectLayout)(input.currentLayout, input.available).root;
  const regions = input.orderingRegions ?? input.regions;
  const offers = createInsertionOffers({
    ...input,
    root,
    regions,
    explorationRegions: input.regions,
    existing: orderOffers({ ...input, root })
  });
  return getBoundaryPlacementOffers({
    offers,
    bounds: input.bounds,
    point: input.point,
    current: input.preview?.intent,
    headers: input.headers ?? [],
    geometry: { regions, source: input.source, gap: input.gap, resolveScopeRect: input.resolveScopeRect }
  });
}

function acquiredIntent(input: WorkspacePlacementQuery, hit: WorkspaceInsertionOffer | undefined) {
  if (hit) return getPlacementOfferIntent(hit);
  if (!inside(input.bounds, input.point)) return undefined;
  if (input.sourceReservation && inside(input.sourceReservation, input.point))
    return input.preview?.intent ?? input.local;
  return input.local;
}

function selectedInsertionKey(offers: WorkspaceInsertionOffer[], input: DecisionInput) {
  const preview = input.preview;
  if (!preview || preview.phase !== 'detached') return undefined;
  if ('layout' in preview)
    return getGroupInsertion({
      plan: preview,
      source: input.source,
      available: input.available,
      projectLayout: input.projectLayout,
      placementSession: input.placementSession,
      planPlacement: input.planPlacement
    })?.key;
  return offers.find(offer => matchesPlacementIntent(getPlacementOfferIntent(offer), preview.intent))?.insertion.key;
}

function distance(offer: WorkspaceInsertionOffer, point: Point) {
  const rect = offer.hitRect ?? offer.rect;
  const vertical = offer.destination.position === 'left' || offer.destination.position === 'right';
  const tangent = vertical ? point.y : point.x;
  const start = vertical ? rect.y : rect.x;
  const extent = vertical ? rect.height : rect.width;
  const withinTangent = tangent >= start && tangent < start + extent;
  if (!withinTangent) return Infinity;

  const normalOffset = vertical ? point.x - rect.x : point.y - rect.y;
  const normalExtent = vertical ? rect.width : rect.height;
  return Math.abs(normalOffset - normalExtent / 2);
}

interface OrderOwner {
  key: string;
  owner: WorkspaceSplit;
  rect: Rect;
  adjacencyRect: Rect;
  peers: { node: WorkspaceNode; index: number }[];
}

function orderOwner(input: OfferInput & { root: WorkspaceNode | null }): OrderOwner | undefined {
  const { root, source } = input;
  const key = findSourcePeerRegionKey(root, source) ?? 'root';
  const owner = findWorkspaceRegion(root, key);
  const group = findGroup(input.currentLayout.root, source[0]);
  if (owner?.type !== 'split' || !wholeSource(group, source)) return undefined;
  const ownerRect = (regions: WorkspacePlacedRegion[]) =>
    regions.find(region => region.key === key)?.rect ??
    input.resolveScopeRect({
      members: getPanelIds(owner).filter(id => !source.includes(id)),
      allocation: regions,
      source
    });
  const rect = ownerRect(input.regions);
  const adjacencyRect = ownerRect(input.orderingRegions ?? input.regions);
  if (!rect || !adjacencyRect) return undefined;
  const from = owner.children.findIndex(node => node.type === 'group' && node.panels.some(id => source.includes(id)));
  if (from < 0) return undefined;
  return {
    key,
    owner,
    rect,
    adjacencyRect,
    peers: owner.children.flatMap((node, index) => (index === from ? [] : [{ node, index }]))
  };
}

function orderOffers(input: OfferInput & { root: WorkspaceNode | null }): WorkspaceInsertionOffer[] {
  const owner = orderOwner(input);
  if (!owner) return [];
  const entries = owner.peers.map(peer => ({ ...peer, after: false }));
  const last = owner.peers.at(-1);
  if (last) {
    entries.push({ ...last, after: true });
  }
  return entries.flatMap((entry, insertionIndex) => orderOffer({ input, owner, entry, insertionIndex }));
}

interface OrderOfferInput {
  input: OfferInput;
  owner: OrderOwner;
  entry: { node: WorkspaceNode; index: number; after: boolean };
  insertionIndex: number;
}

function orderOffer({ input, owner, entry, insertionIndex }: OrderOfferInput): WorkspaceInsertionOffer[] {
  const neighbors = orderNeighbors({ input, owner, entry, insertionIndex });
  if (!neighbors) return [];
  const { region, before } = neighbors;
  const destination = {
    target: getPanelIds(entry.node)[0]!,
    region: region.key,
    position: getSplitSide(owner.owner.axis, entry.after ? 'after' : 'before')
  };
  const plan = resolvePlacementPlan(input, destination, 'order');
  if (plan?.kind !== 'reorder') return [];
  const insertion = getGroupInsertion({
    plan,
    source: input.source,
    available: input.available,
    projectLayout: input.projectLayout,
    placementSession: input.placementSession,
    planPlacement: input.planPlacement
  });
  const boundary = orderBoundary(entry, insertionIndex);
  const ownerRect = boundary ? owner.rect : owner.adjacencyRect;
  const area = getOrderHintRect({
    owner: ownerRect,
    recipient: region.rect,
    previous: before?.rect,
    axis: owner.owner.axis,
    after: entry.after,
    sourceReservation: input.sourceReservation,
    boundary
  });
  if (!area || !insertion) return [];
  return [
    {
      destination,
      owner: owner.key,
      boundary,
      rect: area,
      scopeRect: ownerRect,
      insertion,
      plan,
      kind: 'order'
    }
  ];
}

function orderBoundary(entry: OrderOfferInput['entry'], insertionIndex: number): WorkspaceInsertionOffer['boundary'] {
  if (entry.after) return 'end';
  if (insertionIndex === 0) return 'start';
  return undefined;
}

function wholeSource(group: ReturnType<typeof findGroup>, source: string[]) {
  return !!group && group.panels.length === source.length && group.panels.every(id => source.includes(id));
}

function orderNeighbors({ input, owner, entry, insertionIndex }: Parameters<typeof orderOffer>[0]) {
  const regions = input.orderingRegions ?? input.regions;
  const region = regions.find(candidate => candidate.key === `${owner.key}.${entry.index}`);
  const previous = owner.peers[insertionIndex - 1];
  const before = previous && regions.find(candidate => candidate.key === `${owner.key}.${previous.index}`);
  return !region || (insertionIndex > 0 && !entry.after && !before) ? undefined : { region, before };
}

function contentDirection(
  point: Point,
  input: { rect: Rect; headerHeight: number }
): Exclude<WorkspaceDestination['position'], 'tab'> {
  const { rect, headerHeight } = input;
  const centerX = rect.x + rect.width / 2;
  const contentHeight = Math.max(1, rect.height - headerHeight);
  const centerY = rect.y + headerHeight + contentHeight / 2;
  const dx = (point.x - centerX) / Math.max(1, rect.width / 2);
  const dy = (point.y - centerY) / Math.max(1, contentHeight / 2);
  if (Math.abs(dx) > Math.abs(dy)) return dx < 0 ? 'left' : 'right';
  return dy < 0 ? 'top' : 'bottom';
}
