// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import {
  affectedSplitContext,
  allocatedContextRect,
  allocateContextProxies,
  contextKey,
  createAllocatedContextRect
} from './workspace-context.utils.js';
import { allocateWorkspace } from './workspace-placement.utils.js';
import { detachedLayout, projectLayout } from './workspace-operations.utils.js';
import { parseLayout, type WorkspaceLayout, type WorkspaceNode } from './workspace-layout.utils.js';

const group = (...panels: string[]): WorkspaceNode => ({ type: 'group', panels, active: panels[0]! });
const split = (axis: 'horizontal' | 'vertical', ...children: WorkspaceNode[]): WorkspaceNode => ({
  type: 'split',
  axis,
  children,
  weights: children.map(() => 1)
});
const saved = (root: WorkspaceNode): WorkspaceLayout => parseLayout(JSON.stringify({ version: 1, root, closed: [] }));
const available = ['a', 'b', 'c', 'd', 'e', 'companion'];

function regions(layout: WorkspaceLayout) {
  return allocateWorkspace({
    gap: 6,
    root: projectLayout(layout, available).root,
    rect: { x: 0, y: 0, width: 606, height: 406 },
    minimum: () => ({ width: 0, height: 0 }),
    policy: 'stop'
  }).regions;
}

describe('workspace contextual allocated regions', () => {
  it('chooses the smallest affected baseline arrangement and ignores numerical allocation noise', () => {
    const layout = saved(split('horizontal', group('d'), split('vertical', group('a'), group('b'), group('c'))));
    const baseline = regions(detachedLayout(layout, ['a']));
    const achieved = baseline.map(region => {
      if (region.node.type !== 'group') return region;
      return region.node.panels.includes('b')
        ? { ...region, rect: { ...region.rect, height: region.rect.height - 10 } }
        : region.node.panels.includes('c')
          ? { ...region, rect: { ...region.rect, y: region.rect.y - 10, height: region.rect.height + 10 } }
          : region;
    });
    expect(affectedSplitContext({ baseline, achieved, source: ['a'], recipient: ['b'] })).toEqual({
      kind: 'rail',
      members: ['b', 'c']
    });
    const rounded = baseline.map(region => ({ ...region, rect: { ...region.rect, x: region.rect.x + 0.00000001 } }));
    expect(affectedSplitContext({ baseline, achieved: rounded, source: ['a'], recipient: ['b'] })).toEqual({
      kind: 'recipient',
      members: ['b']
    });
  });

  it('seeds full rails and source-excluded recipient subranges before detachment', () => {
    const layout = saved(split('horizontal', group('a'), group('b'), group('c')));
    const catalog = regions(layout);
    const before = JSON.stringify(catalog);
    const proxies = allocateContextProxies({ catalog, allocation: catalog, source: ['a'] });
    const recipient = proxies.find(proxy => proxy.key === contextKey(['b', 'c']))!;
    const rail = proxies.find(proxy => proxy.key === contextKey(['a', 'b', 'c']))!;
    const b = catalog.find(region => region.key === 'root.1')!.rect;
    expect(recipient.rect).toEqual({ x: b.x, y: 0, width: 606 - b.x, height: 406 });
    expect(rail.rect).toEqual({ x: 0, y: 0, width: 606, height: 406 });
    expect(proxies.length).toBeLessThanOrEqual(2 * catalog.length);
    expect(new Set(proxies.map(proxy => proxy.key)).size).toBe(proxies.length);
    expect(JSON.stringify(catalog)).toBe(before);
    const detached = allocateContextProxies({
      catalog,
      allocation: regions(detachedLayout(layout, ['a'])),
      source: ['a']
    });
    expect(detached.find(proxy => proxy.key === recipient.key)!.rect).toEqual(rail.rect);
  });

  it('keeps an owner rail across peer reordering including the carried reserved slot', () => {
    const layout = saved(split('horizontal', group('a'), group('b'), group('c')));
    const current = saved(split('horizontal', group('a'), group('c'), group('b')));
    const proxies = allocateContextProxies({ catalog: regions(layout), allocation: regions(current), source: ['c'] });
    expect(proxies.find(proxy => proxy.key === contextKey(['a', 'b', 'c']))!.rect).toEqual({
      x: 0,
      y: 0,
      width: 606,
      height: 406
    });
    expect(proxies.find(proxy => proxy.key === contextKey(['a', 'b']))!.rect).toEqual({
      x: 0,
      y: 0,
      width: 606,
      height: 406
    });
  });

  it('resolves a flattened recipient as a contiguous allocated child range including its gutter', () => {
    const layout = saved(
      split(
        'horizontal',
        group('a'),
        split('vertical', group('b'), split('horizontal', group('c'), group('d'))),
        group('e')
      )
    );
    const allocation = regions(detachedLayout(layout, ['b']));
    const proxies = allocateContextProxies({ catalog: regions(layout), allocation, source: ['b'] });
    const first = allocation.find(region => region.key === 'root.1')!.rect;
    const last = allocation.find(region => region.key === 'root.2')!.rect;
    expect(proxies.find(proxy => proxy.key === contextKey(['c', 'd']))!.rect).toEqual({
      x: first.x,
      y: 0,
      width: last.x + last.width - first.x,
      height: 406
    });
  });

  it('includes the original group rectangle for a surviving tab while excluding only the carried tab', () => {
    const layout = saved(split('horizontal', group('a', 'companion'), split('vertical', group('b'), group('c'))));
    const allocation = regions(layout);
    const proxies = allocateContextProxies({ catalog: allocation, allocation, source: ['companion'] });
    expect(proxies.find(proxy => proxy.key === contextKey(['a', 'b', 'c']))!.rect).toEqual({
      x: 0,
      y: 0,
      width: 606,
      height: 406
    });
    expect(proxies.find(proxy => proxy.key === contextKey(['a']))!.rect).toEqual(
      allocation.find(region => region.key === 'root.0')!.rect
    );
  });

  it('does not invent a rectangular region across an unrelated group', () => {
    const layout = saved(split('horizontal', split('vertical', group('a'), group('b')), group('c')));
    const allocation = regions(saved(split('horizontal', group('a'), group('d'), group('b'))));
    const proxies = allocateContextProxies({ catalog: regions(layout), allocation, source: ['c'] });
    expect(proxies.find(proxy => proxy.key === contextKey(['a', 'b']))).toBeUndefined();
  });

  it('shares an allocation index while resolving each member and carried-source query independently', () => {
    const allocation = regions(saved(split('horizontal', group('a'), group('d'), group('b'))));
    const contextRect = createAllocatedContextRect();
    expect(contextRect({ members: ['a', 'b'], allocation, source: [] })).toBeUndefined();
    expect(contextRect({ members: ['a', 'b'], allocation, source: ['d'] })).toEqual({
      x: 0,
      y: 0,
      width: 606,
      height: 406
    });
    expect(contextRect({ members: ['a', 'b'], allocation, source: [] })).toBeUndefined();
    expect(contextRect({ members: ['a'], allocation, source: [] })).toEqual(
      allocation.find(region => region.key === 'root.0')!.rect
    );
  });

  it('uses each allocation array’s current geometry without reusing another candidate’s index', () => {
    const allocation = regions(saved(split('horizontal', group('a'), group('b'))));
    const candidate = allocation.map(region => ({ ...region, rect: { ...region.rect, x: region.rect.x + 100 } }));
    const contextRect = createAllocatedContextRect();
    const before = contextRect({ members: ['a'], allocation, source: [] });
    const after = contextRect({ members: ['a'], allocation: candidate, source: [] });
    expect(after).toEqual(allocatedContextRect({ members: ['a'], allocation: candidate, source: [] }));
    expect(after!.x).toBe(before!.x + 100);
    expect(contextRect({ members: ['a'], allocation, source: [] })).toEqual(before);
  });
});
