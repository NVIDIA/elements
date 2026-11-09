// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import { projectLayout } from '../model/operations.utils.js';
import { parseWorkspaceValue } from '../model/value.utils.js';
import { findWorkspaceRegion, placeRegion } from './region.utils.js';

import type { WorkspaceLayout, WorkspaceNode } from '../model/layout.utils.js';

const group = (...panels: string[]): WorkspaceNode => ({ type: 'group', panels, active: panels[0]! });
const split = (axis: 'horizontal' | 'vertical', weights: number[], ...children: WorkspaceNode[]): WorkspaceNode => ({
  type: 'split',
  axis,
  weights,
  children
});
const saved = (root: WorkspaceNode, closed: string[] = []) => {
  const value = parseWorkspaceValue(JSON.stringify({ version: 1, root, closed }));
  if (!value) throw new Error('Expected a workspace layout');
  return value;
};
const available = ['a', 'b', 'c', 'd', 'e', 'f', 'companion'];

function place(
  layout: WorkspaceLayout,
  source: string[],
  destination: { region: string; position: 'left' | 'right' | 'top' | 'bottom' }
) {
  const { region, position } = destination;
  return placeRegion({
    layout,
    source,
    available,
    destination: { target: 'b', region, position }
  });
}

function visible(layout: WorkspaceLayout) {
  return projectLayout(layout, available).root;
}

describe('workspace region topology', () => {
  it('resolves visible paths and rejects malformed or vanished scopes', () => {
    const root = split('horizontal', [1, 1], group('a'), split('vertical', [1, 1], group('b'), group('c')));
    expect(findWorkspaceRegion(root, 'root')).toBe(root);
    expect(findWorkspaceRegion(root, 'root.1.0')).toEqual(group('b'));
    for (const key of ['branch', 'root.9', 'root.0.0', 'root.-1', 'root.x']) {
      expect(findWorkspaceRegion(root, key)).toBeUndefined();
    }
    expect(findWorkspaceRegion(null, 'root')).toBeUndefined();
  });

  it('restores a full-height group after it enters a nested region without reconstruction', () => {
    const layout = saved(split('horizontal', [2, 8], group('a'), split('vertical', [1, 1], group('b'), group('c'))));
    const inside = place(layout, ['a'], { region: 'root.1.0', position: 'top' })!;
    expect(inside.kind).toBe('split');
    const outside = place(inside.layout, ['a'], { region: 'root', position: 'right' })!;
    expect(visible(outside.layout)).toEqual(
      split('horizontal', [0.5, 0.5], split('vertical', [1 / 3, 2 / 3], group('b'), group('c')), group('a'))
    );
  });

  it('maps a collapsed visible region before stripping source and leaves dormant ancestors intact', () => {
    const layout = saved(split('vertical', [3, 1], split('horizontal', [1, 1], group('a'), group('b')), group('f')), [
      'f'
    ]);
    const result = place(layout, ['a'], { region: 'root', position: 'top' })!;
    expect(result.kind).toBe('split');
    expect(result.layout.closed).toEqual(['f']);
    expect(result.layout.root).toEqual(split('vertical', [0.375, 0.375, 0.25], group('a'), group('b'), group('f')));
    expect(visible(result.layout)).toEqual(split('vertical', [0.5, 0.5], group('a'), group('b')));
  });

  it('extracts one tab by splitting a region while leaving its companion in place', () => {
    const layout = saved(
      split('horizontal', [2, 8], group('a', 'companion'), split('vertical', [1, 1], group('b'), group('c')))
    );
    const result = place(layout, ['a'], { region: 'root.1', position: 'right' })!;
    expect(result.kind).toBe('split');
    expect(visible(result.layout)).toEqual(
      split(
        'horizontal',
        [0.2, 0.4, 0.4],
        group('companion'),
        split('vertical', [0.5, 0.5], group('b'), group('c')),
        group('a')
      )
    );
  });

  it('reports the evaluated recipient membership before source stripping, independently of destination size', () => {
    const layout = saved(
      split('horizontal', [2, 5, 3], group('a'), split('vertical', [1, 1], group('b'), group('c')), group('d'))
    );
    expect(place(layout, ['d'], { region: 'root.1', position: 'top' })?.scope).toEqual({
      kind: 'recipient',
      members: ['b', 'c']
    });
    expect(place(layout, ['d'], { region: 'root', position: 'top' })?.scope).toEqual({
      kind: 'recipient',
      members: ['a', 'b', 'c']
    });
  });

  it('includes a surviving source-group member in an enclosing scope and excludes closed or carried panels', () => {
    const layout = saved(
      split(
        'horizontal',
        [2, 8],
        group('a', 'companion'),
        split('vertical', [1, 1, 1], group('b'), group('c'), group('f'))
      ),
      ['f']
    );
    expect(place(layout, ['companion'], { region: 'root', position: 'top' })?.scope).toEqual({
      kind: 'recipient',
      members: ['a', 'b', 'c']
    });
    expect(place(layout, ['a', 'companion'], { region: 'root', position: 'top' })?.scope).toEqual({
      kind: 'recipient',
      members: ['b', 'c']
    });
  });
});
