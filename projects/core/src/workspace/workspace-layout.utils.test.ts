// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { fitSizes, normalizeLayout, parseLayout, resizeSizes, type WorkspaceGroup } from './workspace-layout.utils.js';

const group = (id: string): WorkspaceGroup => ({ type: 'group', panels: [id], active: id });

describe('workspace layout and sizing', () => {
  it('accepts group snapshots and rejects the former pane discriminator', () => {
    const root = group('a');
    expect(parseLayout(JSON.stringify({ version: 1, root, closed: [] })).root).toEqual(root);
    expect(() => parseLayout(JSON.stringify({ version: 1, root: { ...root, type: 'pane' }, closed: [] }))).toThrow();
  });

  it('exchanges adjacent space without disturbing a third group', () => {
    expect(resizeSizes([300, 300, 300], [120, 120, 120], { boundary: 0, delta: 100, policy: 'stop' })).toEqual([
      400, 200, 300
    ]);
  });

  it('compares stopping and propagation at constraints', () => {
    expect(resizeSizes([300, 300, 300], [120, 250, 120], { boundary: 0, delta: 100, policy: 'stop' })).toEqual([
      350, 250, 300
    ]);
    expect(resizeSizes([300, 300, 300], [120, 250, 120], { boundary: 0, delta: 100, policy: 'propagate' })).toEqual([
      400, 250, 250
    ]);
  });

  it('retains preferences across constrained container sizes', () => {
    const weights = [1, 2, 1];
    expect(fitSizes(weights, [120, 120, 120], 400)).toEqual([120, 160, 120]);
    expect(fitSizes(weights, [120, 120, 120], 800)).toEqual([200, 400, 200]);
    expect(weights).toEqual([1, 2, 1]);
  });

  it('overflows instead of violating minimum sizes', () => {
    expect(fitSizes([1, 1, 1], [200, 200, 200], 300)).toEqual([200, 200, 200]);
  });

  it('normalizes binary encoding to three siblings with equivalent proportions', () => {
    const result = normalizeLayout({
      type: 'split',
      axis: 'horizontal',
      weights: [1, 2],
      children: [group('a'), { type: 'split', axis: 'horizontal', weights: [1, 1], children: [group('b'), group('c')] }]
    });
    expect(result).toEqual({
      type: 'split',
      axis: 'horizontal',
      weights: [1 / 3, 1 / 3, 1 / 3],
      children: [group('a'), group('b'), group('c')]
    });
  });

  it('rejects invalid identities and overflowing weights', () => {
    expect(() =>
      parseLayout(
        JSON.stringify({
          version: 1,
          root: { type: 'split', axis: 'horizontal', weights: [1e308, 1e308], children: [group('a'), group('b')] },
          closed: []
        })
      )
    ).toThrow();
    expect(() =>
      parseLayout(JSON.stringify({ version: 1, root: { type: 'group', panels: ['a', 'a'], active: 'a' }, closed: [] }))
    ).toThrow();
  });

  it('requires unique closed references within the layout and an explicit closed list', () => {
    const root = { type: 'group', panels: ['a', 'missing'], active: 'missing' };
    expect(parseLayout(JSON.stringify({ version: 1, root, closed: ['a', 'missing'] }))).toEqual({
      version: 1,
      root,
      closed: ['a', 'missing']
    });
    for (const closed of [['unknown'], ['a', 'a']])
      expect(() => parseLayout(JSON.stringify({ version: 1, root, closed }))).toThrow();
    expect(() => parseLayout(JSON.stringify({ version: 1, root: null, closed: ['a'] }))).toThrow();
    expect(() => parseLayout(JSON.stringify({ version: 1, root }))).toThrow();
    expect(parseLayout(JSON.stringify({ version: 1, root: null, closed: [] })).root).toBeNull();
  });
});
