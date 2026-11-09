// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import { getBoundaryPlacementOffers, getBoundarySide } from './boundary.utils.js';

import type { WorkspaceInsertionOffer } from './insertion-offers.utils.js';

const bounds = { x: 0, y: 0, width: 600, height: 300 };

function offer(position: 'left' | 'right' | 'top' | 'bottom'): WorkspaceInsertionOffer {
  const vertical = position === 'left' || position === 'right';
  const end = position === 'right' || position === 'bottom';
  const rects = {
    left: { x: 0, y: 0, width: 12, height: 300 },
    right: { x: 588, y: 0, width: 12, height: 300 },
    top: { x: 0, y: 0, width: 600, height: 12 },
    bottom: { x: 0, y: 288, width: 600, height: 12 }
  };
  return {
    kind: 'insert',
    owner: 'root',
    boundary: end ? 'end' : 'start',
    insertion: {
      key: position,
      axis: vertical ? 'horizontal' : 'vertical',
      index: end ? 1 : 0,
      members: ['b', 'c'],
      previous: end ? ['b', 'c'] : undefined,
      next: end ? undefined : ['b', 'c']
    },
    plan: {
      kind: 'insert',
      layout: { version: 1, closed: [], root: { type: 'group', panels: ['a', 'b'], active: 'a' } }
    },
    scopeRect: bounds,
    rect: rects[position],
    destination: { target: 'b', region: 'root', position }
  };
}

describe('workspace outer boundary targeting', () => {
  it('selects the true root outside at any distance while painting only the inward half', () => {
    const result = getBoundaryPlacementOffers({
      offers: [offer('bottom')],
      bounds,
      point: { x: 500, y: 3000 },
      headers: []
    });

    expect(result.hit?.owner).toBe('root');
    expect(result.hit?.destination.position).toBe('bottom');
    expect(result.hit?.rect).toEqual({ x: 0, y: 294, width: 600, height: 6 });
  });

  it('does not mistake a collapsed nested owner filling the canvas for root', () => {
    const result = getBoundaryPlacementOffers({
      offers: [{ ...offer('bottom'), owner: 'root.1' }],
      bounds,
      point: { x: 500, y: 3000 },
      headers: []
    });

    expect(result.hit).toBeUndefined();
  });

  it('limits root priority to six pixels and leaves the local header endcap reachable', () => {
    const local = {
      ...offer('top'),
      owner: 'root.1',
      insertion: { ...offer('top').insertion, key: 'local' },
      scopeRect: { x: 240, y: 0, width: 360, height: 300 },
      rect: { x: 240, y: 0, width: 360, height: 12 }
    };
    const input = { offers: [offer('top'), local], bounds, headers: [{ ...bounds, height: 40 }] };

    expect(getBoundaryPlacementOffers({ ...input, point: { x: 300, y: 5 } }).hit?.destination.position).toBe('top');
    const result = getBoundaryPlacementOffers({ ...input, point: { x: 500, y: 7 } });
    expect(result.hit).toBeUndefined();
    const endcap = result.offers.find(candidate => candidate.owner === 'root.1')!;
    expect(endcap.boundary).toBe('start');
    expect(endcap.rect.y).toBe(0);
    expect(endcap.hitRect).toEqual({ x: 240, y: 6, width: 360, height: 12 });
  });

  it('keeps local reorder paint flush while separating its narrow header-edge acquisition', () => {
    const local: WorkspaceInsertionOffer = {
      ...offer('top'),
      kind: 'order',
      owner: 'root.1',
      insertion: { ...offer('top').insertion, key: 'local' },
      scopeRect: { x: 240, y: 0, width: 360, height: 300 },
      rect: { x: 240, y: 0, width: 360, height: 12 }
    };
    const result = getBoundaryPlacementOffers({
      offers: [offer('top'), local],
      bounds,
      point: { x: 500, y: 12 },
      headers: [{ x: 240, y: 0, width: 360, height: 40 }]
    });
    const cue = result.offers.find(candidate => candidate.kind === 'order')!;

    expect(cue.rect).toEqual(local.rect);
    expect(cue.hitRect).toEqual({ x: 240, y: 6, width: 360, height: 12 });
  });

  it('keeps the full side insertion cue while protecting intervening chrome from acquisition', () => {
    const local: WorkspaceInsertionOffer = {
      ...offer('right'),
      owner: 'root.1',
      boundary: undefined,
      insertion: { ...offer('right').insertion, previous: ['b'], next: ['c'] }
    };
    const result = getBoundaryPlacementOffers({
      offers: [local],
      bounds,
      point: { x: 590, y: 200 },
      headers: [{ x: 0, y: 100, width: 600, height: 40 }]
    });

    expect(result.offers.map(candidate => candidate.rect)).toEqual([local.rect, local.rect]);
    expect(result.offers.map(candidate => candidate.hitRect)).toEqual([
      { x: 588, y: 0, width: 12, height: 100 },
      { x: 588, y: 140, width: 12, height: 160 }
    ]);
  });

  it('partitions corners by distance and uses the current edge only on exact ties', () => {
    expect(getBoundarySide(bounds, { x: -20, y: -10 })).toBe('left');
    expect(getBoundarySide(bounds, { x: -10, y: -20 })).toBe('top');
    expect(getBoundarySide(bounds, { x: -20, y: -20 }, 'top')).toBe('top');
    expect(getBoundarySide(bounds, { x: 4, y: 4 }, 'left')).toBe('left');
    expect(getBoundarySide(bounds, { x: 4, y: 3 }, 'left')).toBe('top');
  });
});
