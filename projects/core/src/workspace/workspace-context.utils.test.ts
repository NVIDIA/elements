// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { affectedSplitContext, allocateContextProxies, contextKey } from './workspace-context.utils.js';
import { allocateWorkspace } from './workspace-placement.utils.js';
import { detachedLayout, projectLayout } from './workspace-operations.utils.js';
import { parseLayout, type WorkspaceLayout, type WorkspaceNode } from './workspace-layout.utils.js';

const pane = (...panels: string[]): WorkspaceNode => ({ type: 'pane', panels, active: panels[0]! });
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
    root: projectLayout(layout, available).root,
    rect: { x: 0, y: 0, width: 606, height: 406 },
    minimum: () => ({ width: 0, height: 0 }),
    policy: 'stop'
  }).regions;
}

describe('workspace contextual allocated regions', () => {
  it('chooses the smallest affected baseline arrangement and ignores numerical allocation noise', () => {
    const layout = saved(split('horizontal', pane('d'), split('vertical', pane('a'), pane('b'), pane('c'))));
    const baseline = regions(detachedLayout(layout, ['a']));
    const achieved = baseline.map(region => {
      if (region.node.type !== 'pane') return region;
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
    const layout = saved(split('horizontal', pane('a'), pane('b'), pane('c')));
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
    const layout = saved(split('horizontal', pane('a'), pane('b'), pane('c')));
    const current = saved(split('horizontal', pane('a'), pane('c'), pane('b')));
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
      split('horizontal', pane('a'), split('vertical', pane('b'), split('horizontal', pane('c'), pane('d'))), pane('e'))
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

  it('includes the original pane rectangle for a surviving tab while excluding only the carried tab', () => {
    const layout = saved(split('horizontal', pane('a', 'companion'), split('vertical', pane('b'), pane('c'))));
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

  it('does not invent a rectangular region across an unrelated pane', () => {
    const layout = saved(split('horizontal', split('vertical', pane('a'), pane('b')), pane('c')));
    const allocation = regions(saved(split('horizontal', pane('a'), pane('d'), pane('b'))));
    const proxies = allocateContextProxies({ catalog: regions(layout), allocation, source: ['c'] });
    expect(proxies.find(proxy => proxy.key === contextKey(['a', 'b']))).toBeUndefined();
  });
});
