// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { boundaryPlacementOffers } from './workspace-boundary.utils.js';
import { createAllocatedContextRect, type WorkspaceContextRectResolver } from './workspace-context.utils.js';
import {
  clipCue,
  samePlacementIntent,
  type WorkspaceDropIntent,
  type WorkspaceDragPreview
} from './workspace-drag-preview.utils.js';
import { describePlacementSlot } from './workspace-group-insertion.utils.js';
import {
  panelIds,
  splitSide,
  type WorkspaceLayout,
  type WorkspaceNode,
  type WorkspaceSplit
} from './workspace-layout.utils.js';
import {
  insertionHints,
  orderHintRect,
  placementOfferIntent,
  placementOwnsChrome,
  sourcePeerRegion,
  type PlacementOffer
} from './workspace-offers.utils.js';
import { findGroup, projectLayout } from './workspace-operations.utils.js';
import type { WorkspacePlacedRegion, WorkspaceRect } from './workspace-placement.utils.js';
import { planWorkspacePlacement, type WorkspacePlacementPlanner } from './workspace-planner.utils.js';
import type { WorkspaceLayoutProjector } from './workspace-projection.utils.js';
import { findWorkspaceRegion } from './workspace-region-placement.utils.js';

export interface WorkspacePlacementScene {
  gap: number;
  source: string[];
  point: { x: number; y: number };
  regions: WorkspacePlacedRegion[];
  orderingRegions?: WorkspacePlacedRegion[];
  sourceSlot?: WorkspaceRect;
  headers?: WorkspaceRect[];
  preview?: WorkspaceDragPreview;
  local?: WorkspaceDropIntent;
  header: boolean;
  bounds: WorkspaceRect;
}

type Input = WorkspacePlacementScene;

type DecisionInput = Input & {
  saved: WorkspaceLayout;
  available: string[];
  projectLayout?: WorkspaceLayoutProjector;
  planPlacement?: WorkspacePlacementPlanner;
};

type OfferInput = DecisionInput & { contextRect: WorkspaceContextRectResolver };

const inside = (rect: PlacementOffer['rect'], point: Input['point']) =>
  point.x >= rect.x && point.x < rect.x + rect.width && point.y >= rect.y && point.y < rect.y + rect.height;

/** Chooses input and availability together from the two operation-specific computed projections. */
export function decidePlacement(input: DecisionInput) {
  const boundary = sceneOffers({ ...input, contextRect: createAllocatedContextRect() });
  const selectedKey = selectedScopeKey(boundary.offers, input);
  const sourceSlot = reservedSourceSlot(input);
  const hints = boundary.offers.filter(offer => eligiblePlacementHint(offer, sourceSlot, input.bounds));
  const nearest = hints
    .filter(offer => offer.scope.key !== selectedKey)
    .map(offer => ({ offer, distance: distance(offer, input.point) }))
    .sort((a, b) => a.distance - b.distance)[0];
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

function reservedSourceSlot(input: Input) {
  const preview = input.preview;
  if (
    !input.sourceSlot ||
    preview?.phase !== 'detached' ||
    preview.blocked ||
    preview.allocation !== 'reserved' ||
    preview.cue.kind !== 'group'
  )
    return undefined;
  return clipCue(input.sourceSlot, input.bounds);
}

function eligiblePlacementHint(offer: PlacementOffer, sourceSlot: WorkspaceRect | undefined, bounds: WorkspaceRect) {
  if (!sourceSlot) return true;
  const rect = clipCue(offer.rect, bounds);
  const vertical = offer.destination.position === 'left' || offer.destination.position === 'right';
  const normal = vertical ? 'x' : 'y';
  const normalSize = vertical ? 'width' : 'height';
  const tangent = vertical ? 'y' : 'x';
  const tangentSize = vertical ? 'height' : 'width';
  return !(
    rect[normal] > sourceSlot[normal] &&
    rect[normal] + rect[normalSize] < sourceSlot[normal] + sourceSlot[normalSize] &&
    rect[tangent] >= sourceSlot[tangent] &&
    rect[tangent] + rect[tangentSize] <= sourceSlot[tangent] + sourceSlot[tangentSize]
  );
}

function placementHint({
  hit,
  selectedKey,
  boundary,
  nearest
}: {
  hit?: PlacementOffer;
  selectedKey?: string;
  boundary?: PlacementOffer;
  nearest?: { offer: PlacementOffer; distance: number };
}) {
  if (hit && hit.scope.key !== selectedKey) return hit;
  if (!boundary && nearest && nearest.distance <= 24) return nearest.offer;
  return undefined;
}

function sceneOffers(input: OfferInput) {
  const root = (input.projectLayout ?? projectLayout)(input.saved, input.available).root;
  const regions = input.orderingRegions ?? input.regions;
  const offers = insertionHints({
    ...input,
    root,
    regions,
    explorationRegions: input.regions,
    existing: orderOffers({ ...input, root })
  });
  return boundaryPlacementOffers({
    offers,
    bounds: input.bounds,
    point: input.point,
    current: input.preview?.intent,
    headers: input.headers ?? [],
    scene: { regions, source: input.source, gap: input.gap, contextRect: input.contextRect }
  });
}

function acquiredIntent(input: Input, hit: PlacementOffer | undefined) {
  if (hit) return placementOfferIntent(hit);
  if (!inside(input.bounds, input.point)) return undefined;
  if (input.sourceSlot && inside(input.sourceSlot, input.point)) return input.preview?.intent ?? input.local;
  return input.local;
}

function selectedScopeKey(offers: PlacementOffer[], input: DecisionInput) {
  const preview = input.preview;
  if (!preview || preview.phase !== 'detached') return undefined;
  if ('layout' in preview)
    return describePlacementSlot({
      plan: preview,
      source: input.source,
      available: input.available,
      projectLayout: input.projectLayout
    })?.key;
  return offers.find(offer => samePlacementIntent(placementOfferIntent(offer), preview.intent))?.scope.key;
}

function distance(offer: PlacementOffer, point: Input['point']) {
  const rect = offer.hitRect ?? offer.rect;
  const vertical = offer.destination.position === 'left' || offer.destination.position === 'right';
  const tangent = vertical ? point.y : point.x;
  const start = vertical ? rect.y : rect.x;
  const extent = vertical ? rect.height : rect.width;
  return tangent >= start && tangent < start + extent
    ? Math.abs((vertical ? point.x - rect.x : point.y - rect.y) - (vertical ? rect.width : rect.height) / 2)
    : Infinity;
}

interface OrderOwner {
  key: string;
  owner: WorkspaceSplit;
  rect: WorkspaceRect;
  adjacencyRect: WorkspaceRect;
  peers: { node: WorkspaceNode; index: number }[];
}

function orderOwner(input: OfferInput & { root: WorkspaceNode | null }): OrderOwner | undefined {
  const { root, source } = input;
  const key = sourcePeerRegion(root, source) ?? 'root';
  const owner = findWorkspaceRegion(root, key);
  const group = findGroup(input.saved.root, source[0]);
  if (owner?.type !== 'split' || !wholeSource(group, source)) return undefined;
  const ownerRect = (regions: WorkspacePlacedRegion[]) =>
    regions.find(region => region.key === key)?.rect ??
    input.contextRect({ members: panelIds(owner).filter(id => !source.includes(id)), allocation: regions, source });
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

function orderOffers(input: OfferInput & { root: WorkspaceNode | null }): PlacementOffer[] {
  const owner = orderOwner(input);
  if (!owner) return [];
  const entries = owner.peers.map(peer => ({ ...peer, after: false }));
  const last = owner.peers.at(-1);
  if (last) entries.push({ ...last, after: true });
  return entries.flatMap((entry, slot) => orderOffer({ input, owner, entry, slot }));
}

interface OrderOfferInput {
  input: OfferInput;
  owner: OrderOwner;
  entry: { node: WorkspaceNode; index: number; after: boolean };
  slot: number;
}

function orderOffer({ input, owner, entry, slot }: OrderOfferInput): PlacementOffer[] {
  const neighbors = orderNeighbors({ input, owner, entry, slot });
  if (!neighbors) return [];
  const { region, before } = neighbors;
  const destination = {
    target: panelIds(entry.node)[0]!,
    region: region.key,
    position: splitSide(owner.owner.axis, entry.after ? 'after' : 'before')
  };
  const plan = (input.planPlacement ?? planWorkspacePlacement)({
    layout: input.saved,
    source: input.source,
    destination,
    available: input.available,
    projectLayout: input.projectLayout,
    operation: 'order'
  });
  if (plan?.kind !== 'reorder') return [];
  const descriptor = describePlacementSlot({
    plan,
    source: input.source,
    available: input.available,
    projectLayout: input.projectLayout
  });
  const boundary = orderBoundary(entry, slot);
  const ownerRect = boundary ? owner.rect : owner.adjacencyRect;
  const area = orderHintRect({
    owner: ownerRect,
    recipient: region.rect,
    previous: before?.rect,
    axis: owner.owner.axis,
    after: entry.after,
    sourceSlot: input.sourceSlot,
    boundary
  });
  if (!area || !descriptor) return [];
  return [
    {
      destination,
      owner: owner.key,
      boundary,
      rect: area,
      scopeRect: ownerRect,
      scope: descriptor,
      plan,
      kind: 'order'
    }
  ];
}

function orderBoundary(entry: OrderOfferInput['entry'], slot: number): PlacementOffer['boundary'] {
  if (entry.after) return 'end';
  if (slot === 0) return 'start';
  return undefined;
}

function wholeSource(group: ReturnType<typeof findGroup>, source: string[]) {
  return !!group && group.panels.length === source.length && group.panels.every(id => source.includes(id));
}

function orderNeighbors({ input, owner, entry, slot }: Parameters<typeof orderOffer>[0]) {
  const regions = input.orderingRegions ?? input.regions;
  const region = regions.find(candidate => candidate.key === `${owner.key}.${entry.index}`);
  const previous = owner.peers[slot - 1];
  const before = previous && regions.find(candidate => candidate.key === `${owner.key}.${previous.index}`);
  return !region || (slot > 0 && !entry.after && !before) ? undefined : { region, before };
}
