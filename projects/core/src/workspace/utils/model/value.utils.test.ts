// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import { parseWorkspaceValue, sameSerializedWorkspaceLayout, serializeWorkspaceValue } from './value.utils.js';

import type { WorkspaceGroup, WorkspaceLayout, WorkspaceNode } from './layout.utils.js';

const group = (id: string): WorkspaceGroup => ({ type: 'group', panels: [id], active: id });

describe('workspace values', () => {
  it('distinguishes an absent value from an empty arrangement', () => {
    expect(parseWorkspaceValue('')).toBeUndefined();
    expect(serializeWorkspaceValue(undefined)).toBe('');
    const empty: WorkspaceLayout = { version: 1, root: null, closed: [] };
    const value = serializeWorkspaceValue(empty);
    expect(value).toBe('{"version":1,"root":null,"closed":[]}');
    expect(parseWorkspaceValue(value)).toEqual(empty);
  });

  it('accepts group snapshots and rejects unsupported node types', () => {
    const root = group('a');
    expect(parseWorkspaceValue(JSON.stringify({ version: 1, root, closed: [] }))?.root).toEqual(root);
    expect(() =>
      parseWorkspaceValue(JSON.stringify({ version: 1, root: { ...root, type: 'unsupported' }, closed: [] }))
    ).toThrow();
  });

  it('rejects invalid identities and overflowing weights', () => {
    expect(() =>
      parseWorkspaceValue(
        JSON.stringify({
          version: 1,
          root: { type: 'split', axis: 'horizontal', weights: [1e308, 1e308], children: [group('a'), group('b')] },
          closed: []
        })
      )
    ).toThrow();
    expect(() =>
      parseWorkspaceValue(
        JSON.stringify({ version: 1, root: { type: 'group', panels: ['a', 'a'], active: 'a' }, closed: [] })
      )
    ).toThrow();
  });

  it('requires unique closed references within the layout and an explicit closed list', () => {
    const root = { type: 'group', panels: ['a', 'missing'], active: 'missing' };
    expect(parseWorkspaceValue(JSON.stringify({ version: 1, root, closed: ['a', 'missing'] }))).toEqual({
      version: 1,
      root,
      closed: ['a', 'missing']
    });
    for (const closed of [['unknown'], ['a', 'a']]) {
      expect(() => parseWorkspaceValue(JSON.stringify({ version: 1, root, closed }))).toThrow();
    }
    expect(() => parseWorkspaceValue(JSON.stringify({ version: 1, root: null, closed: ['a'] }))).toThrow();
    expect(() => parseWorkspaceValue(JSON.stringify({ version: 1, root }))).toThrow();
    expect(parseWorkspaceValue(JSON.stringify({ version: 1, root: null, closed: [] }))?.root).toBeNull();
  });

  it('rejects malformed JSON and unsupported versions', () => {
    expect(() => parseWorkspaceValue('{')).toThrow(SyntaxError);
    expect(() => parseWorkspaceValue('{"version":2,"root":null,"closed":[]}')).toThrow(TypeError);
  });

  it('serializes retained preferences without normalizing or mutating them', () => {
    const layout: WorkspaceLayout = {
      version: 1,
      root: { type: 'split', axis: 'horizontal', weights: [2, 1], children: [group('a'), group('b')] },
      closed: ['a']
    };
    const before = structuredClone(layout);
    const value = serializeWorkspaceValue(layout);
    expect(value).toBe(
      '{"version":1,"root":{"type":"split","axis":"horizontal","weights":[2,1],"children":[{"type":"group","panels":["a"],"active":"a"},{"type":"group","panels":["b"],"active":"b"}]},"closed":["a"]}'
    );
    expect(layout).toEqual(before);
  });

  describe('serialized layout equality', () => {
    it('distinguishes an absent layout from an empty arrangement', () => {
      const empty: WorkspaceLayout = { version: 1, root: null, closed: [] };
      expect(sameSerializedWorkspaceLayout(undefined, undefined)).toBe(true);
      expect(sameSerializedWorkspaceLayout(undefined, empty)).toBe(false);
      expect(sameSerializedWorkspaceLayout(empty, undefined)).toBe(false);
    });

    it('compares identical and copied layouts without changing their preferences', () => {
      const layout: WorkspaceLayout = { version: 1, root: group('a'), closed: [] };
      const copy = structuredClone(layout);
      expect(sameSerializedWorkspaceLayout(layout, layout)).toBe(true);
      expect(sameSerializedWorkspaceLayout(layout, copy)).toBe(true);
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
      expect(sameSerializedWorkspaceLayout(layout, changed)).toBe(false);
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
      expect(
        sameSerializedWorkspaceLayout({ version: 1, root: left, closed: [] }, { version: 1, root: right, closed: [] })
      ).toBe(false);
    });

    it('distinguishes the order of closed panels', () => {
      const root: WorkspaceNode = { type: 'group', panels: ['a', 'b', 'c'], active: 'a' };
      expect(
        sameSerializedWorkspaceLayout(
          { version: 1, root, closed: ['b', 'c'] },
          { version: 1, root, closed: ['c', 'b'] }
        )
      ).toBe(false);
    });

    it('distinguishes the property order of supplied groups', () => {
      const left = parseWorkspaceValue('{"version":1,"root":{"type":"group","panels":["a"],"active":"a"},"closed":[]}');
      const right = parseWorkspaceValue(
        '{"version":1,"root":{"active":"a","panels":["a"],"type":"group"},"closed":[]}'
      );
      expect(sameSerializedWorkspaceLayout(left, right)).toBe(false);
    });

    it('compares copied group extensions without discarding them', () => {
      const layout = parseWorkspaceValue(
        '{"version":1,"root":{"type":"group","panels":["a"],"active":"a","extra":{"items":[1,null]}},"closed":[]}'
      );
      expect(sameSerializedWorkspaceLayout(layout, structuredClone(layout))).toBe(true);
    });

    it('distinguishes changes to supplied group extensions', () => {
      const left = parseWorkspaceValue(
        '{"version":1,"root":{"type":"group","panels":["a"],"active":"a","extra":{"items":[1,null]}},"closed":[]}'
      );
      const right = parseWorkspaceValue(
        '{"version":1,"root":{"type":"group","panels":["a"],"active":"a","extra":{"items":[2,null]}},"closed":[]}'
      );
      expect(sameSerializedWorkspaceLayout(left, right)).toBe(false);
    });
  });
});
