// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';

import { allocateWorkspace } from '../geometry/allocation.utils.js';
import { getPanelMembershipKey } from '../model/membership.utils.js';
import { createDetachedLayout, projectLayout } from '../model/operations.utils.js';
import { parseWorkspaceValue } from '../model/value.utils.js';
import {
  createScopeRectResolver,
  getAffectedSplitScope,
  getAllocatedScopeRect,
  getAllocatedScopes
} from './scope.utils.js';

import type { WorkspaceLayout, WorkspaceNode } from '../model/layout.utils.js';

vi.mock('../model/membership.utils.js', { spy: true });

const group = (...panels: string[]): WorkspaceNode => ({ type: 'group', panels, active: panels[0]! });
const split = (axis: 'horizontal' | 'vertical', ...children: WorkspaceNode[]): WorkspaceNode => ({
  type: 'split',
  axis,
  children,
  weights: children.map(() => 1)
});
const saved = (root: WorkspaceNode): WorkspaceLayout => {
  const value = parseWorkspaceValue(JSON.stringify({ version: 1, root, closed: [] }));
  if (!value) throw new Error('Expected a workspace layout');
  return value;
};
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

describe('workspace scope geometry', () => {
  it('encodes each scope once when removing the source leaves its membership unchanged', () => {
    const catalog = regions(saved(split('horizontal', group('a'), split('vertical', group('b'), group('c')))));
    const encode = vi.mocked(getPanelMembershipKey);
    encode.mockClear();
    const scopes = getAllocatedScopes({ catalog, allocation: catalog, source: [] });
    expect(scopes).toHaveLength(catalog.length);
    expect(encode.mock.calls.length).toBeLessThanOrEqual(catalog.length);
  });

  it('chooses the smallest affected baseline arrangement and ignores numerical allocation noise', () => {
    const layout = saved(split('horizontal', group('d'), split('vertical', group('a'), group('b'), group('c'))));
    const baseline = regions(createDetachedLayout(layout, ['a']));
    const achieved = baseline.map(region => {
      if (region.node.type !== 'group') return region;
      return region.node.panels.includes('b')
        ? { ...region, rect: { ...region.rect, height: region.rect.height - 10 } }
        : region.node.panels.includes('c')
          ? { ...region, rect: { ...region.rect, y: region.rect.y - 10, height: region.rect.height + 10 } }
          : region;
    });
    expect(getAffectedSplitScope({ baseline, achieved, source: ['a'], recipient: ['b'] })).toEqual({
      kind: 'rail',
      members: ['b', 'c']
    });
    const rounded = baseline.map(region => ({ ...region, rect: { ...region.rect, x: region.rect.x + 0.00000001 } }));
    expect(getAffectedSplitScope({ baseline, achieved: rounded, source: ['a'], recipient: ['b'] })).toEqual({
      kind: 'recipient',
      members: ['b']
    });
  });

  it('seeds full rails and source-excluded recipient subranges before detachment', () => {
    const layout = saved(split('horizontal', group('a'), group('b'), group('c')));
    const catalog = regions(layout);
    const before = JSON.stringify(catalog);
    const scopes = getAllocatedScopes({ catalog, allocation: catalog, source: ['a'] });
    const recipient = scopes.find(scope => scope.key === getPanelMembershipKey(['b', 'c']))!;
    const rail = scopes.find(scope => scope.key === getPanelMembershipKey(['a', 'b', 'c']))!;
    const b = catalog.find(region => region.key === 'root.1')!.rect;
    expect(recipient.rect).toEqual({ x: b.x, y: 0, width: 606 - b.x, height: 406 });
    expect(rail.rect).toEqual({ x: 0, y: 0, width: 606, height: 406 });
    expect(scopes.length).toBeLessThanOrEqual(2 * catalog.length);
    expect(new Set(scopes.map(scope => scope.key)).size).toBe(scopes.length);
    expect(JSON.stringify(catalog)).toBe(before);
    const detached = getAllocatedScopes({
      catalog,
      allocation: regions(createDetachedLayout(layout, ['a'])),
      source: ['a']
    });
    expect(detached.find(scope => scope.key === recipient.key)!.rect).toEqual(rail.rect);
  });

  it('keeps an owner rail across peer reordering including the carried reservation', () => {
    const layout = saved(split('horizontal', group('a'), group('b'), group('c')));
    const current = saved(split('horizontal', group('a'), group('c'), group('b')));
    const scopes = getAllocatedScopes({ catalog: regions(layout), allocation: regions(current), source: ['c'] });
    expect(scopes.find(scope => scope.key === getPanelMembershipKey(['a', 'b', 'c']))!.rect).toEqual({
      x: 0,
      y: 0,
      width: 606,
      height: 406
    });
    expect(scopes.find(scope => scope.key === getPanelMembershipKey(['a', 'b']))!.rect).toEqual({
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
    const allocation = regions(createDetachedLayout(layout, ['b']));
    const scopes = getAllocatedScopes({ catalog: regions(layout), allocation, source: ['b'] });
    const first = allocation.find(region => region.key === 'root.1')!.rect;
    const last = allocation.find(region => region.key === 'root.2')!.rect;
    expect(scopes.find(scope => scope.key === getPanelMembershipKey(['c', 'd']))!.rect).toEqual({
      x: first.x,
      y: 0,
      width: last.x + last.width - first.x,
      height: 406
    });
  });

  it('includes the original group rectangle for a surviving tab while excluding only the carried tab', () => {
    const layout = saved(split('horizontal', group('a', 'companion'), split('vertical', group('b'), group('c'))));
    const allocation = regions(layout);
    const scopes = getAllocatedScopes({ catalog: allocation, allocation, source: ['companion'] });
    expect(scopes.find(scope => scope.key === getPanelMembershipKey(['a', 'b', 'c']))!.rect).toEqual({
      x: 0,
      y: 0,
      width: 606,
      height: 406
    });
    expect(scopes.find(scope => scope.key === getPanelMembershipKey(['a']))!.rect).toEqual(
      allocation.find(region => region.key === 'root.0')!.rect
    );
  });

  it('does not invent a rectangular region across an unrelated group', () => {
    const layout = saved(split('horizontal', split('vertical', group('a'), group('b')), group('c')));
    const allocation = regions(saved(split('horizontal', group('a'), group('d'), group('b'))));
    const scopes = getAllocatedScopes({ catalog: regions(layout), allocation, source: ['c'] });
    expect(scopes.find(scope => scope.key === getPanelMembershipKey(['a', 'b']))).toBeUndefined();
  });

  it('shares an allocation index while resolving each member and carried-source query independently', () => {
    const allocation = regions(saved(split('horizontal', group('a'), group('d'), group('b'))));
    const resolveScopeRect = createScopeRectResolver();
    expect(resolveScopeRect({ members: ['a', 'b'], allocation, source: [] })).toBeUndefined();
    expect(resolveScopeRect({ members: ['a', 'b'], allocation, source: ['d'] })).toEqual({
      x: 0,
      y: 0,
      width: 606,
      height: 406
    });
    expect(resolveScopeRect({ members: ['a', 'b'], allocation, source: [] })).toBeUndefined();
    expect(resolveScopeRect({ members: ['a'], allocation, source: [] })).toEqual(
      allocation.find(region => region.key === 'root.0')!.rect
    );
  });

  it('deduplicates tab members into one leaf and ignores unavailable member IDs', () => {
    const allocation = regions(saved(split('horizontal', group('a', 'companion'), group('b'))));
    const rect = allocation.find(region => region.key === 'root.0')!.rect;
    expect(getAllocatedScopeRect({ members: ['companion', 'a', 'unknown'], allocation, source: [] })).toEqual(rect);
    expect(getAllocatedScopeRect({ members: [], allocation, source: [] })).toBeUndefined();
    expect(getAllocatedScopeRect({ members: ['unknown'], allocation, source: [] })).toBeUndefined();
  });

  it('keeps the last supplied exact scope when filtered ancestors contain the same surviving leaves', () => {
    const allocation = regions(saved(split('horizontal', group('a'), split('vertical', group('b'), group('c')))));
    const root = allocation.find(region => region.key === 'root')!;
    const nested = allocation.find(region => region.key === 'root.1')!;
    const filtered = allocation.filter(region => region.key !== 'root.0');
    expect(getAllocatedScopeRect({ members: ['c', 'b'], allocation: filtered, source: [] })).toEqual(nested.rect);
    expect(getAllocatedScopeRect({ members: ['b', 'c'], allocation: [...filtered].reverse(), source: [] })).toEqual(
      root.rect
    );
    expect(
      getAllocatedScopeRect({
        members: ['b', 'c'],
        allocation: filtered.filter(region => region !== nested),
        source: []
      })
    ).toEqual(root.rect);
  });

  it('uses each allocation array’s current geometry without reusing another candidate’s index', () => {
    const allocation = regions(saved(split('horizontal', group('a'), group('b'))));
    const candidate = allocation.map(region => ({ ...region, rect: { ...region.rect, x: region.rect.x + 100 } }));
    const resolveScopeRect = createScopeRectResolver();
    const before = resolveScopeRect({ members: ['a'], allocation, source: [] });
    const after = resolveScopeRect({ members: ['a'], allocation: candidate, source: [] });
    expect(after).toEqual(getAllocatedScopeRect({ members: ['a'], allocation: candidate, source: [] }));
    expect(after!.x).toBe(before!.x + 100);
    expect(resolveScopeRect({ members: ['a'], allocation, source: [] })).toEqual(before);
  });
  it('keeps scope bounds caller-owned and observes changes to caller-owned geometry', () => {
    const allocation = regions(saved(split('horizontal', group('a', 'companion'), group('b'), group('c'))));
    const input = { catalog: allocation, allocation, source: ['companion'] };
    const first = getAllocatedScopes(input);
    const key = getPanelMembershipKey(['a', 'b', 'c']);
    const before = first.find(scope => scope.key === key)!.rect.x;
    const count = first.length;
    first[0]!.key = 'caller-modified';
    first.pop();
    allocation.forEach(region => (region.rect.x += 40));

    const next = getAllocatedScopes(input);
    expect(next).toHaveLength(count);
    expect(next.some(scope => scope.key === 'caller-modified')).toBe(false);
    expect(next.find(scope => scope.key === key)!.rect.x).toBe(before + 40);
  });
});
