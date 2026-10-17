// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createFixture, removeFixture } from '@internals/testing';
import { allocateWorkspace } from './workspace-placement.utils.js';
import { allocateContextProxies } from './workspace-context.utils.js';
import type { WorkspaceLayout, WorkspaceNode } from './workspace-layout.utils.js';
import { projectLayout } from './workspace-operations.utils.js';
import { planWorkspacePlacement } from './workspace-planner.utils.js';
import { contentDirection, computedRegionCatalog } from './workspace-targeting.utils.js';

const makeGroup = (...panels: string[]): WorkspaceNode => ({ type: 'group', panels, active: panels[0]! });
const split = (axis: 'horizontal' | 'vertical', ...children: WorkspaceNode[]): WorkspaceNode => ({
  type: 'split',
  axis,
  children,
  weights: children.map(() => 1)
});
const bounds = { x: 0, y: 0, width: 800, height: 600 };

const rect = (value: { x: number; y: number; width: number; height: number }) =>
  new DOMRect(value.x, value.y, value.width, value.height);
const geometry = (root: WorkspaceNode | null) =>
  allocateWorkspace({ gap: 6, root, rect: bounds, minimum: () => ({ width: 20, height: 20 }), policy: 'stop' });

function ids(node: WorkspaceNode | null): string[] {
  return !node ? [] : node.type === 'group' ? node.panels : node.children.flatMap(ids);
}

describe('workspace content drop directions', () => {
  const contentRect = { x: 10, y: 20, width: 400, height: 236 };

  it('uses directional splits throughout the content, including its center region', () => {
    expect(contentDirection(180, 156, { rect: contentRect, headerHeight: 36 })).toBe('left');
    expect(contentDirection(240, 156, { rect: contentRect, headerHeight: 36 })).toBe('right');
    expect(contentDirection(210, 136, { rect: contentRect, headerHeight: 36 })).toBe('top');
    expect(contentDirection(210, 176, { rect: contentRect, headerHeight: 36 })).toBe('bottom');
  });

  it('normalizes distance by content dimensions for wide and short groups', () => {
    expect(contentDirection(210, 110, { rect: contentRect, headerHeight: 36 })).toBe('top');
    expect(contentDirection(230, 190, { rect: contentRect, headerHeight: 36 })).toBe('bottom');
    expect(contentDirection(40, 170, { rect: contentRect, headerHeight: 36 })).toBe('left');
  });

  it('keeps all four directions available above a short group minimum', () => {
    const short = { x: 0, y: 0, width: 400, height: 100 };
    expect(contentDirection(200, 45, { rect: short, headerHeight: 36 })).toBe('top');
    expect(contentDirection(200, 90, { rect: short, headerHeight: 36 })).toBe('bottom');
    expect(contentDirection(30, 68, { rect: short, headerHeight: 36 })).toBe('left');
    expect(contentDirection(370, 68, { rect: short, headerHeight: 36 })).toBe('right');
  });
});

describe('workspace presented target geometry', () => {
  let fixture: HTMLElement;

  afterEach(() => {
    removeFixture(fixture);
    vi.restoreAllMocks();
  });

  async function setup(saved: WorkspaceLayout, current: WorkspaceNode, source = ['a']) {
    if (fixture?.isConnected) removeFixture(fixture);
    fixture = await createFixture(html` <div></div> `);
    const host = fixture.querySelector('div')!;
    const root = host.attachShadow({ mode: 'open' });
    const available = ids(saved.root);
    const catalog = geometry(projectLayout(saved, available).root).regions;
    const allocation = geometry(current).regions;
    for (const proxy of allocateContextProxies({ catalog, allocation, source })) {
      const element = document.createElement('div');
      element.dataset.contextBoundary = proxy.key;
      root.append(element);
      vi.spyOn(element, 'getBoundingClientRect').mockReturnValue(rect(proxy.rect));
    }
    const input = { saved, catalog, allocation, source, available, root, bounds };
    return { root, input, regions: computedRegionCatalog(input) };
  }

  it('keeps canonical E and branch addresses while their displayed positions move', async () => {
    const branch = split('vertical', makeGroup('b'), makeGroup('c'));
    const saved: WorkspaceLayout = {
      version: 1,
      closed: [],
      root: split('horizontal', makeGroup('a'), branch, makeGroup('e'))
    };
    const result = await setup(saved, split('horizontal', branch, makeGroup('a'), makeGroup('e')));
    const moved = result.regions.find(region => region.key === 'root.1')!;
    expect(moved.rect.x).toBe(0);
    expect(moved.node).toEqual(result.input.catalog.find(region => region.key === 'root.1')!.node);
    const e = result.regions.find(region => region.node.type === 'group' && region.node.panels.includes('e'))!;
    expect(e.key).toBe('root.2');
    expect(e.rect.width).toBeCloseTo(result.input.allocation.find(region => region.key === 'root.2')!.rect.width, 8);
    expect(result.root.querySelector('[data-active]')).toBeNull();
  });

  it('retains the full allocated owner around interior and outer source vacancies', async () => {
    const branch = split('vertical', makeGroup('b'), makeGroup('c'));
    const saved: WorkspaceLayout = {
      version: 1,
      closed: [],
      root: split('horizontal', makeGroup('a'), branch, makeGroup('e'))
    };
    const result = await setup(saved, split('horizontal', branch, makeGroup('a'), makeGroup('e')));
    expect(result.regions.find(region => region.key === 'root')!.rect).toEqual(bounds);
    const outer = await setup(saved, split('horizontal', branch, makeGroup('e'), makeGroup('a')));
    expect(outer.regions.find(region => region.key === 'root')!.rect).toEqual(bounds);
    expect(
      outer.regions.some(region => region.node.type === 'group' && region.node.panels.every(id => id === 'a'))
    ).toBe(false);
  });

  it('maps a partial source group to Companion rather than stretching through its proposed tab destination', async () => {
    const saved: WorkspaceLayout = {
      version: 1,
      closed: [],
      root: split('horizontal', makeGroup('a', 'companion'), makeGroup('b'))
    };
    const result = await setup(saved, split('horizontal', makeGroup('companion'), makeGroup('b', 'a')));
    const origin = result.regions.find(region => region.key === 'root.0')!;
    expect(origin.rect.width).toBeCloseTo(
      result.input.allocation.find(region => region.key === 'root.0')!.rect.width,
      8
    );
    expect(origin.rect.width).toBeLessThan(bounds.width);
  });

  it('chooses the deepest collapsed scope and preserves its unequal peer contract', async () => {
    const saved: WorkspaceLayout = {
      version: 1,
      closed: [],
      root: { type: 'split', axis: 'horizontal', children: [makeGroup('a'), makeGroup('b')], weights: [1, 4] }
    };
    const result = await setup(saved, makeGroup('b'));
    expect(result.regions.map(region => region.key)).toEqual(['root.1']);
    const plan = planWorkspacePlacement({
      layout: saved,
      source: ['a'],
      operation: 'order',
      destination: { target: 'b', region: result.regions[0]!.key, position: 'right' },
      available: ['a', 'b']
    })!;
    expect(plan.kind).toBe('reorder');
    const after = geometry(plan.layout.root).groups.find(group => group.group.panels.includes('a'))!;
    expect(after.rect.width).toBeCloseTo((800 - 6) / 5, 8);
  });

  it('retains distinct dormant ownership even when visible bounds and members match', async () => {
    const saved: WorkspaceLayout = {
      version: 1,
      closed: ['closed'],
      root: split('horizontal', makeGroup('a'), split('vertical', makeGroup('b'), makeGroup('closed')))
    };
    const result = await setup(saved, makeGroup('b'));
    expect(result.regions.map(region => region.key)).toEqual(['root', 'root.1']);
  });

  it('preserves real edges while excluding fully clipped targets', async () => {
    const saved: WorkspaceLayout = {
      version: 1,
      closed: [],
      root: split('horizontal', makeGroup('a'), makeGroup('b'), makeGroup('e'))
    };
    const result = await setup(saved, split('horizontal', makeGroup('a'), makeGroup('b'), makeGroup('e')));
    const clipped = computedRegionCatalog({ ...result.input, bounds: { ...bounds, width: 380 } });
    expect(clipped.find(region => region.key === 'root')!.rect.width).toBe(800);
    expect(clipped.some(region => region.rect.x + region.rect.width > 380)).toBe(true);
    expect(clipped.some(region => region.node.type === 'group' && region.node.panels.includes('e'))).toBe(false);
  });

  it('retains the true header origin when the viewport clips its top', async () => {
    const saved: WorkspaceLayout = {
      version: 1,
      closed: [],
      root: split('horizontal', makeGroup('a'), makeGroup('b'))
    };
    const result = await setup(saved, makeGroup('b'));
    const partial = computedRegionCatalog({ ...result.input, bounds: { x: 0, y: 20, width: 800, height: 580 } });
    expect(partial[0]!.rect.y).toBe(0);
    const content = computedRegionCatalog({ ...result.input, bounds: { x: 0, y: 80, width: 800, height: 520 } });
    expect(content[0]!.rect.y).toBe(0);
    expect(content[0]!.rect.height).toBe(600);
  });
});
