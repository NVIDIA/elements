// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import { normalizeWorkspaceValue, sameWorkspaceLayout } from './value.utils.js';

import type { WorkspaceGroup, WorkspaceLayout, WorkspaceNode } from './layout.utils.js';

const group = (id: string): WorkspaceGroup => ({ type: 'group', panels: [id], active: id });

describe('workspace values', () => {
  it('distinguishes an absent value from an empty arrangement', () => {
    expect(normalizeWorkspaceValue(undefined)).toBeUndefined();
    const empty: WorkspaceLayout = { version: 1, root: null, closed: [] };
    expect(normalizeWorkspaceValue(empty)).toEqual(empty);
  });

  it('accepts group snapshots and rejects unsupported node types', () => {
    const root = group('a');
    expect(normalizeWorkspaceValue({ version: 1 as const, root, closed: [] })?.root).toEqual(root);
    expect(() =>
      normalizeWorkspaceValue({ version: 1 as const, root: { ...root, type: 'unsupported' }, closed: [] })
    ).toThrow();
  });

  it('rejects invalid identities and overflowing weights', () => {
    expect(() =>
      normalizeWorkspaceValue({
        version: 1,
        root: { type: 'split', axis: 'horizontal', weights: [1e308, 1e308], children: [group('a'), group('b')] },
        closed: []
      })
    ).toThrow();
    expect(() =>
      normalizeWorkspaceValue({
        version: 1 as const,
        root: { type: 'group' as const, panels: ['a', 'a'], active: 'a' },
        closed: []
      })
    ).toThrow();
  });

  it('requires unique closed references within the layout and an explicit closed list', () => {
    const root = { type: 'group', panels: ['a', 'missing'], active: 'missing' };
    expect(normalizeWorkspaceValue({ version: 1 as const, root, closed: ['a', 'missing'] })).toEqual({
      version: 1,
      root,
      closed: ['a', 'missing']
    });
    for (const closed of [['unknown'], ['a', 'a']]) {
      expect(() => normalizeWorkspaceValue({ version: 1 as const, root, closed })).toThrow();
    }
    expect(() => normalizeWorkspaceValue({ version: 1 as const, root: null, closed: ['a'] })).toThrow();
    expect(() => normalizeWorkspaceValue({ version: 1 as const, root })).toThrow();
    expect(normalizeWorkspaceValue({ version: 1 as const, root: null, closed: [] })?.root).toBeNull();
  });

  it('rejects strings and unsupported versions', () => {
    expect(() => normalizeWorkspaceValue('{')).toThrow(TypeError);
    expect(() => normalizeWorkspaceValue({ version: 2, root: null, closed: [] })).toThrow(TypeError);
  });

  it('normalizes supplied groups to the owned value schema', () => {
    const parsed = normalizeWorkspaceValue({
      version: 1,
      root: { active: 'a', panels: ['a'], extra: { items: [1, null] }, type: 'group' },
      closed: []
    });
    const expected: WorkspaceLayout = { version: 1, root: group('a'), closed: [] };
    expect(parsed).toEqual(expected);
    expect(sameWorkspaceLayout(parsed, structuredClone(expected))).toBe(true);
  });

  it('rejects cycles, sparse arrays, and coercible axes in object values', () => {
    const cycle = { type: 'split', axis: 'horizontal', weights: [1, 1], children: [] as unknown[] };
    cycle.children.push(cycle, group('a'));
    expect(() => normalizeWorkspaceValue({ version: 1, root: cycle, closed: [] })).toThrow(TypeError);
    const root = { type: 'split', axis: ['horizontal'], weights: [1, 1], children: [group('a'), group('b')] };
    expect(() => normalizeWorkspaceValue({ version: 1, root, closed: [] })).toThrow(TypeError);
    expect(() =>
      normalizeWorkspaceValue({ version: 1, root: { ...root, axis: 'horizontal', weights: [1, ,] }, closed: [] })
    ).toThrow(TypeError);
    expect(() =>
      normalizeWorkspaceValue({ version: 1, root: { type: 'group', panels: ['a', ,], active: 'a' }, closed: [] })
    ).toThrow(TypeError);
  });

  describe('layout equality', () => {
    it('distinguishes an absent layout from an empty arrangement', () => {
      const empty: WorkspaceLayout = { version: 1, root: null, closed: [] };
      expect(sameWorkspaceLayout(undefined, undefined)).toBe(true);
      expect(sameWorkspaceLayout(undefined, empty)).toBe(false);
      expect(sameWorkspaceLayout(empty, undefined)).toBe(false);
    });

    it('compares identical and copied layouts without changing their preferences', () => {
      const layout: WorkspaceLayout = { version: 1, root: group('a'), closed: [] };
      const copy = structuredClone(layout);
      expect(sameWorkspaceLayout(layout, layout)).toBe(true);
      expect(sameWorkspaceLayout(layout, copy)).toBe(true);
      expect(layout).toEqual(copy);
    });

    it('distinguishes exact split weights without a tolerance', () => {
      const root: WorkspaceNode = {
        type: 'split',
        axis: 'horizontal',
        children: [group('a'), group('b')],
        weights: [0.5, 0.5]
      };
      const layout: WorkspaceLayout = { version: 1, root, closed: [] };
      const changed = { ...layout, root: { ...root, weights: [0.5 + 1e-14, 0.5] } };
      expect(sameWorkspaceLayout(layout, changed)).toBe(false);
    });

    it.each<[string, WorkspaceNode, WorkspaceNode]>([
      [
        'selection',
        { type: 'group', panels: ['a', 'b'], active: 'a' },
        { type: 'group', panels: ['a', 'b'], active: 'b' }
      ],
      [
        'panel order',
        { type: 'group', panels: ['a', 'b'], active: 'a' },
        { type: 'group', panels: ['b', 'a'], active: 'a' }
      ],
      [
        'child order',
        { type: 'split', axis: 'horizontal', children: [group('a'), group('b')], weights: [0.5, 0.5] },
        { type: 'split', axis: 'horizontal', children: [group('b'), group('a')], weights: [0.5, 0.5] }
      ],
      [
        'split axis',
        { type: 'split', axis: 'horizontal', children: [group('a'), group('b')], weights: [0.5, 0.5] },
        { type: 'split', axis: 'vertical', children: [group('a'), group('b')], weights: [0.5, 0.5] }
      ]
    ])('distinguishes changes to %s', (_, left, right) => {
      expect(sameWorkspaceLayout({ version: 1, root: left, closed: [] }, { version: 1, root: right, closed: [] })).toBe(
        false
      );
    });

    it('distinguishes the order of closed panels', () => {
      const root: WorkspaceNode = { type: 'group', panels: ['a', 'b', 'c'], active: 'a' };
      expect(
        sameWorkspaceLayout({ version: 1, root, closed: ['b', 'c'] }, { version: 1, root, closed: ['c', 'b'] })
      ).toBe(false);
    });

    it('compares owned layout fields independently of property order', () => {
      const left: WorkspaceLayout = { version: 1, root: group('a'), closed: [] };
      const right: WorkspaceLayout = { closed: [], root: { active: 'a', panels: ['a'], type: 'group' }, version: 1 };
      expect(sameWorkspaceLayout(left, right)).toBe(true);
    });
  });
});
