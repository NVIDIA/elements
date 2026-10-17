// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { boundaryPlacementOffers } from './workspace-boundary.utils.js';
import { allocatedContextRect } from './workspace-context.utils.js';
import { samePlacementIntent, type WorkspaceDropIntent } from './workspace-drag-preview.utils.js';
import { describePlacementSlot } from './workspace-group-insertion.utils.js';
import { splitSide, type WorkspaceLayout, type WorkspaceNode, type WorkspaceSplit } from './workspace-layout.utils.js';
import {
  insertionHints,
  orderHintRect,
  placementOfferIntent,
  placementOwnsChrome,
  sourcePeerRegion,
  type PlacementOffer
} from './workspace-offers.utils.js';
import { findGroup, projectLayout } from './workspace-operations.utils.js';
import type { WorkspacePlacedRegion } from './workspace-placement.utils.js';
import { planWorkspacePlacement } from './workspace-planner.utils.js';
import type { WorkspaceDragPreview, WorkspaceRect } from './workspace-rearrange.controller.js';
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

type DecisionInput = Input & { saved: WorkspaceLayout; available: string[] };

const ids = (node: WorkspaceNode): string[] => (node.type === 'group' ? node.panels : node.children.flatMap(ids));

const inside = (rect: PlacementOffer['rect'], point: Input['point']) =>
  point.x >= rect.x && point.x < rect.x + rect.width && point.y >= rect.y && point.y < rect.y + rect.height;

/** Chooses input and availability together from the two operation-specific computed projections. */
export function decidePlacement(input: DecisionInput) {
  const boundary = sceneOffers(input);
  const selected = selectedOffer(boundary.offers, input);
  const nearest = boundary.offers
    .filter(offer => offer.scope.key !== selected)
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
    hint: placementHint({ hit, selected, boundary: boundary.hit, nearest })
  };
}

function placementHint({
  hit,
  selected,
  boundary,
  nearest
}: {
  hit?: PlacementOffer;
  selected?: string;
  boundary?: PlacementOffer;
  nearest?: { offer: PlacementOffer; distance: number };
}) {
  if (hit && hit.scope.key !== selected) return hit;
  if (!boundary && nearest && nearest.distance <= 24) return nearest.offer;
  return undefined;
}

function sceneOffers(input: DecisionInput) {
  const root = projectLayout(input.saved, input.available).root;
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
    scene: { regions, source: input.source, gap: input.gap }
  });
}

function acquiredIntent(input: Input, hit: PlacementOffer | undefined) {
  if (hit) return placementOfferIntent(hit);
  if (!inside(input.bounds, input.point)) return undefined;
  if (input.sourceSlot && inside(input.sourceSlot, input.point)) return input.preview?.intent ?? input.local;
  return input.local;
}

function selectedOffer(offers: PlacementOffer[], input: Input & { available: string[] }) {
  const preview = input.preview;
  if (!preview || preview.phase !== 'detached') return undefined;
  if ('layout' in preview)
    return describePlacementSlot({ plan: preview, source: input.source, available: input.available })?.key;
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

function orderOwner(input: DecisionInput & { root: WorkspaceNode | null }): OrderOwner | undefined {
  const { root, source } = input;
  const key = sourcePeerRegion(root, source) ?? 'root';
  const owner = findWorkspaceRegion(root, key);
  const group = findGroup(input.saved.root, source[0]);
  if (owner?.type !== 'split' || !wholeSource(group, source)) return undefined;
  const ownerRect = (regions: WorkspacePlacedRegion[]) =>
    regions.find(region => region.key === key)?.rect ??
    allocatedContextRect({ members: ids(owner).filter(id => !source.includes(id)), allocation: regions, source });
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

function orderOffers(input: DecisionInput & { root: WorkspaceNode | null }): PlacementOffer[] {
  const owner = orderOwner(input);
  if (!owner) return [];
  const entries = owner.peers.map(peer => ({ ...peer, after: false }));
  const last = owner.peers.at(-1);
  if (last) entries.push({ ...last, after: true });
  return entries.flatMap((entry, slot) => orderOffer({ input, owner, entry, slot }));
}

interface OrderOfferInput {
  input: DecisionInput;
  owner: OrderOwner;
  entry: { node: WorkspaceNode; index: number; after: boolean };
  slot: number;
}

function orderOffer({ input, owner, entry, slot }: OrderOfferInput): PlacementOffer[] {
  const neighbors = orderNeighbors({ input, owner, entry, slot });
  if (!neighbors) return [];
  const { region, before } = neighbors;
  const destination = {
    target: ids(entry.node)[0]!,
    region: region.key,
    position: splitSide(owner.owner.axis, entry.after ? 'after' : 'before')
  };
  const plan = planWorkspacePlacement({
    layout: input.saved,
    source: input.source,
    destination,
    available: input.available,
    operation: 'order'
  });
  if (plan?.kind !== 'reorder') return [];
  const descriptor = describePlacementSlot({ plan, source: input.source, available: input.available });
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
