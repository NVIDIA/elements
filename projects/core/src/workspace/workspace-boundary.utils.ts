// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { WorkspaceDropIntent } from './workspace-drag-preview.utils.js';
import {
  partitionPlacementOffers,
  currentInsertionSeam,
  placementOwnsChrome,
  type PlacementOffer
} from './workspace-offers.utils.js';
import type { WorkspacePlacedRegion } from './workspace-placement.utils.js';
import type { WorkspaceRect } from './workspace-rearrange.controller.js';

type Side = 'left' | 'right' | 'top' | 'bottom';

const sides: Side[] = ['left', 'right', 'top', 'bottom'];

interface BoundaryInput {
  offers: PlacementOffer[];
  bounds: WorkspaceRect;
  point: { x: number; y: number };
  current?: WorkspaceDropIntent;
  headers: WorkspaceRect[];
  scene?: { regions: WorkspacePlacedRegion[]; source: string[] };
}

/** Separates a mathematical boundary selection from its clipped, inward-only cue. */
export function boundaryPlacementOffers(input: BoundaryInput) {
  const { offers, bounds, point, current } = input;
  const roots = offers.filter(offer => offer.owner === 'root' && offer.boundary);
  const side = boundarySide(
    bounds,
    point,
    current && current.kind !== 'invalid' && current.kind !== 'tab' ? current.destination.position : undefined
  );
  const root = roots.find(offer => offer.destination.position === side);
  const hit = root && edgeDistances(bounds, point)[side] <= 6 ? root : undefined;
  const local = partitionPlacementOffers(offers.filter(offer => !roots.includes(offer))).flatMap(offer =>
    localGeometry({ input, roots, offer })
  );
  const painted = roots
    .filter(offer => offer.destination.position === side)
    .flatMap(offer => {
      const rect = boundaryPaint(bounds, side);
      return rect.width && rect.height ? [{ ...offer, rect }] : [];
    });
  return {
    offers: [...painted, ...local],
    hit: hit ? painted.find(offer => offer.scope.key === hit.scope.key) : undefined
  };
}

function boundaryPaint(bounds: WorkspaceRect, side: Side): WorkspaceRect {
  return side === 'left' || side === 'right'
    ? { x: side === 'left' ? bounds.x : bounds.x + bounds.width - 6, y: bounds.y, width: 6, height: bounds.height }
    : { x: bounds.x, y: side === 'top' ? bounds.y : bounds.y + bounds.height - 6, width: bounds.width, height: 6 };
}

function localGeometry({
  input,
  roots,
  offer
}: {
  input: BoundaryInput;
  roots: PlacementOffer[];
  offer: PlacementOffer;
}) {
  const paint = input.offers.find(original => original.scope.key === offer.scope.key)!;
  const paintRect = input.scene
    ? (currentInsertionSeam(paint, input.scene.regions, input.scene.source) ?? paint.rect)
    : paint.rect;
  const position = offer.destination.position;
  const vertical = position === 'left' || position === 'right';
  const rect = { ...offer.rect };
  if (roots.some(root => root.destination.position === position) && touches(rect, input.bounds, position)) {
    if (vertical) rect.x += position === 'left' ? 6 : -6;
    else rect.y += position === 'top' ? 6 : -6;
  }
  if (placementOwnsChrome(offer)) return [{ ...offer, rect: paint.rect, hitRect: rect }];
  return protectChrome(rect, input.headers, vertical).map(hitRect => ({
    ...offer,
    rect: paintRect,
    hitRect
  }));
}

export function boundarySide(bounds: WorkspaceRect, point: { x: number; y: number }, current?: Side): Side {
  const distances = edgeDistances(bounds, point);
  const minimum = Math.min(...Object.values(distances));
  const tied = sides.filter(side => distances[side] === minimum);
  return current && tied.includes(current) ? current : tied[0]!;
}

function edgeDistances(bounds: WorkspaceRect, point: { x: number; y: number }) {
  return {
    left: point.x - bounds.x,
    right: bounds.x + bounds.width - point.x,
    top: point.y - bounds.y,
    bottom: bounds.y + bounds.height - point.y
  };
}

function touches(rect: WorkspaceRect, bounds: WorkspaceRect, side: PlacementOffer['destination']['position']) {
  switch (side) {
    case 'left':
      return Math.abs(rect.x - bounds.x) < 1;
    case 'right':
      return Math.abs(rect.x + rect.width - bounds.x - bounds.width) < 1;
    case 'top':
      return Math.abs(rect.y - bounds.y) < 1;
    case 'bottom':
    case 'tab':
      return Math.abs(rect.y + rect.height - bounds.y - bounds.height) < 1;
  }
}

export function protectChrome(
  rect: WorkspaceRect,
  headers: WorkspaceRect[],
  vertical = rect.width === 12
): WorkspaceRect[] {
  const start = vertical ? 'y' : 'x';
  const extent = vertical ? 'height' : 'width';
  let fragments = [rect];
  for (const header of headers)
    fragments = fragments.flatMap(fragment => {
      if (
        fragment.x >= header.x + header.width ||
        fragment.x + fragment.width <= header.x ||
        fragment.y >= header.y + header.height ||
        fragment.y + fragment.height <= header.y
      )
        return [fragment];
      const before = header[start] - fragment[start];
      const after = fragment[start] + fragment[extent] - header[start] - header[extent];
      return [
        ...(before > 0 ? [{ ...fragment, [extent]: before }] : []),
        ...(after > 0 ? [{ ...fragment, [start]: header[start] + header[extent], [extent]: after }] : [])
      ];
    });
  return fragments;
}
