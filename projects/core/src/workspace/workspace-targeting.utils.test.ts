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
import { computedRegionCatalog } from './workspace-targeting.utils.js';

const pane = (...panels: string[]): WorkspaceNode => ({ type: 'pane', panels, active: panels[0]! });
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
  allocateWorkspace({ root, rect: bounds, minimum: () => ({ width: 20, height: 20 }), policy: 'stop' });

function ids(node: WorkspaceNode | null): string[] {
  return !node ? [] : node.type === 'pane' ? node.panels : node.children.flatMap(ids);
}

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
    const branch = split('vertical', pane('b'), pane('c'));
    const saved: WorkspaceLayout = { version: 1, closed: [], root: split('horizontal', pane('a'), branch, pane('e')) };
    const result = await setup(saved, split('horizontal', branch, pane('a'), pane('e')));
    const moved = result.regions.find(region => region.key === 'root.1')!;
    expect(moved.rect.x).toBe(0);
    expect(moved.node).toEqual(result.input.catalog.find(region => region.key === 'root.1')!.node);
    const e = result.regions.find(region => region.node.type === 'pane' && region.node.panels.includes('e'))!;
    expect(e.key).toBe('root.2');
    expect(e.rect.width).toBeCloseTo(result.input.allocation.find(region => region.key === 'root.2')!.rect.width, 8);
    expect(result.root.querySelector('[data-active]')).toBeNull();
  });

  it('retains the full allocated owner around interior and outer source vacancies', async () => {
    const branch = split('vertical', pane('b'), pane('c'));
    const saved: WorkspaceLayout = { version: 1, closed: [], root: split('horizontal', pane('a'), branch, pane('e')) };
    const result = await setup(saved, split('horizontal', branch, pane('a'), pane('e')));
    expect(result.regions.find(region => region.key === 'root')!.rect).toEqual(bounds);
    const outer = await setup(saved, split('horizontal', branch, pane('e'), pane('a')));
    expect(outer.regions.find(region => region.key === 'root')!.rect).toEqual(bounds);
    expect(
      outer.regions.some(region => region.node.type === 'pane' && region.node.panels.every(id => id === 'a'))
    ).toBe(false);
  });

  it('maps a partial source pane to Companion rather than stretching through its proposed tab destination', async () => {
    const saved: WorkspaceLayout = {
      version: 1,
      closed: [],
      root: split('horizontal', pane('a', 'companion'), pane('b'))
    };
    const result = await setup(saved, split('horizontal', pane('companion'), pane('b', 'a')));
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
      root: { type: 'split', axis: 'horizontal', children: [pane('a'), pane('b')], weights: [1, 4] }
    };
    const result = await setup(saved, pane('b'));
    expect(result.regions.map(region => region.key)).toEqual(['root.1']);
    const plan = planWorkspacePlacement({
      layout: saved,
      source: ['a'],
      operation: 'order',
      destination: { target: 'b', region: result.regions[0]!.key, position: 'right' },
      available: ['a', 'b']
    })!;
    expect(plan.kind).toBe('reorder');
    const after = geometry(plan.layout.root).groups.find(group => group.pane.panels.includes('a'))!;
    expect(after.rect.width).toBeCloseTo((800 - 6) / 5, 8);
  });

  it('retains distinct dormant ownership even when visible bounds and members match', async () => {
    const saved: WorkspaceLayout = {
      version: 1,
      closed: ['closed'],
      root: split('horizontal', pane('a'), split('vertical', pane('b'), pane('closed')))
    };
    const result = await setup(saved, pane('b'));
    expect(result.regions.map(region => region.key)).toEqual(['root', 'root.1']);
  });

  it('preserves real edges while excluding fully clipped targets', async () => {
    const saved: WorkspaceLayout = {
      version: 1,
      closed: [],
      root: split('horizontal', pane('a'), pane('b'), pane('e'))
    };
    const result = await setup(saved, split('horizontal', pane('a'), pane('b'), pane('e')));
    const clipped = computedRegionCatalog({ ...result.input, bounds: { ...bounds, width: 380 } });
    expect(clipped.find(region => region.key === 'root')!.rect.width).toBe(800);
    expect(clipped.some(region => region.rect.x + region.rect.width > 380)).toBe(true);
    expect(clipped.some(region => region.node.type === 'pane' && region.node.panels.includes('e'))).toBe(false);
  });

  it('retains the true header origin when the viewport clips its top', async () => {
    const saved: WorkspaceLayout = { version: 1, closed: [], root: split('horizontal', pane('a'), pane('b')) };
    const result = await setup(saved, pane('b'));
    const partial = computedRegionCatalog({ ...result.input, bounds: { x: 0, y: 20, width: 800, height: 580 } });
    expect(partial[0]!.rect.y).toBe(0);
    const content = computedRegionCatalog({ ...result.input, bounds: { x: 0, y: 80, width: 800, height: 520 } });
    expect(content[0]!.rect.y).toBe(0);
    expect(content[0]!.rect.height).toBe(600);
  });
});
