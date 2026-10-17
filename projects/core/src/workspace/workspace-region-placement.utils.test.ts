// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { parseLayout, type WorkspaceNode, type WorkspaceLayout } from './workspace-layout.utils.js';
import { projectLayout } from './workspace-operations.utils.js';
import { planWorkspacePlacement } from './workspace-planner.utils.js';
import { allocateWorkspace } from './workspace-placement.utils.js';

const pane = (...panels: string[]): WorkspaceNode => ({ type: 'pane', panels, active: panels[0]! });
const split = (axis: 'horizontal' | 'vertical', weights: number[], ...children: WorkspaceNode[]): WorkspaceNode => ({
  type: 'split',
  axis,
  weights,
  children
});
const saved = (root: WorkspaceNode, closed: string[] = []) => parseLayout(JSON.stringify({ version: 1, root, closed }));
const available = ['a', 'b', 'c', 'd', 'e', 'f', 'companion'];

function place(
  layout: WorkspaceLayout,
  source: string[],
  destination: { region: string; position: 'left' | 'right' | 'top' | 'bottom'; operation?: 'split' | 'order' }
) {
  const { region, position, operation = 'split' } = destination;
  return planWorkspacePlacement({
    layout,
    operation,
    source,
    available,
    destination: { target: 'b', region, position }
  });
}

function visible(layout: WorkspaceLayout) {
  return projectLayout(layout, available).root;
}

describe('workspace region topology', () => {
  it('allocates nested region rectangles alongside leaves from one traversal', () => {
    const layout = saved(split('horizontal', [2, 8], pane('a'), split('vertical', [1, 1], pane('b'), pane('c'))));
    const allocation = allocateWorkspace({
      root: layout.root,
      rect: { x: 0, y: 0, width: 606, height: 406 },
      minimum: () => ({ width: 0, height: 0 }),
      policy: 'stop'
    });
    expect(allocation.regions.map(region => region.key)).toEqual(['root', 'root.0', 'root.1', 'root.1.0', 'root.1.1']);
    expect(allocation.regions[2]!.rect).toEqual({ x: 126, y: 0, width: 480, height: 406 });
  });

  it('reorders a pane beside a subtree with both preferred shares intact', () => {
    const layout = saved(split('horizontal', [2, 8], pane('a'), split('vertical', [1, 1], pane('b'), pane('c'))));
    const result = place(layout, ['a'], { region: 'root.1', position: 'right', operation: 'order' })!;
    expect(result.kind).toBe('reorder');
    expect(visible(result.layout)).toEqual(
      split('horizontal', [0.8, 0.2], split('vertical', [0.5, 0.5], pane('b'), pane('c')), pane('a'))
    );
    expect(layout.root).toEqual(
      saved(split('horizontal', [2, 8], pane('a'), split('vertical', [1, 1], pane('b'), pane('c')))).root
    );
  });

  it('restores a full-height pane after it enters a nested region without reconstruction', () => {
    const layout = saved(split('horizontal', [2, 8], pane('a'), split('vertical', [1, 1], pane('b'), pane('c'))));
    const inside = place(layout, ['a'], { region: 'root.1.0', position: 'top' })!;
    expect(inside.kind).toBe('split');
    const outside = place(inside.layout, ['a'], { region: 'root', position: 'right' })!;
    expect(visible(outside.layout)).toEqual(
      split('horizontal', [0.5, 0.5], split('vertical', [1 / 3, 2 / 3], pane('b'), pane('c')), pane('a'))
    );
  });

  it('maps a collapsed visible region before stripping source and leaves dormant ancestors intact', () => {
    const layout = saved(split('vertical', [3, 1], split('horizontal', [1, 1], pane('a'), pane('b')), pane('f')), [
      'f'
    ]);
    const result = place(layout, ['a'], { region: 'root', position: 'top' })!;
    expect(result.kind).toBe('split');
    expect(result.layout.closed).toEqual(['f']);
    expect(result.layout.root).toEqual(split('vertical', [0.375, 0.375, 0.25], pane('a'), pane('b'), pane('f')));
    expect(visible(result.layout)).toEqual(split('vertical', [0.5, 0.5], pane('a'), pane('b')));
  });

  it('moves closed tab companions with a whole pane, leaving separate dormant nodes coherent', () => {
    const layout = saved(
      split(
        'horizontal',
        [2, 8],
        pane('a', 'companion'),
        split('vertical', [2, 3, 1], pane('b'), pane('c'), pane('f'))
      ),
      ['companion', 'f']
    );
    const result = place(layout, ['a', 'companion'], { region: 'root.1', position: 'right', operation: 'order' })!;
    expect(result.kind).toBe('reorder');
    expect(result.layout.closed).toEqual(layout.closed);
    expect(visible(result.layout)).toEqual(
      split(
        'horizontal',
        [0.8, 0.2],
        split('vertical', [expect.closeTo(0.4), expect.closeTo(0.6)], pane('b'), pane('c')),
        pane('a')
      )
    );
    expect(JSON.stringify(result.layout.root)).toContain('companion');
    expect(JSON.stringify(result.layout.root)).toContain('f');
  });

  it('extracts one tab by splitting a region while leaving its companion in place', () => {
    const layout = saved(
      split('horizontal', [2, 8], pane('a', 'companion'), split('vertical', [1, 1], pane('b'), pane('c')))
    );
    const result = place(layout, ['a'], { region: 'root.1', position: 'right' })!;
    expect(result.kind).toBe('split');
    expect(visible(result.layout)).toEqual(
      split(
        'horizontal',
        [0.2, 0.4, 0.4],
        pane('companion'),
        split('vertical', [0.5, 0.5], pane('b'), pane('c')),
        pane('a')
      )
    );
  });

  it('supports parent endpoints, stable own-region no-ops, and rejects vanished scope paths', () => {
    const layout = saved(split('horizontal', [2, 5, 3], pane('a'), pane('b'), pane('c')));
    const result = place(layout, ['b'], { region: 'root', position: 'right', operation: 'order' })!;
    expect(result.kind).toBe('reorder');
    expect(visible(result.layout)).toEqual(split('horizontal', [0.2, 0.3, 0.5], pane('a'), pane('c'), pane('b')));
    expect(place(layout, ['b'], { region: 'root.1', position: 'top' })?.layout).toEqual(layout);
    expect(place(layout, ['b'], { region: 'root.9', position: 'left' })).toBeUndefined();
  });

  it('recognizes an unchanged original tab position as a silent placement while allowing explicit reordering', () => {
    const layout = saved(split('horizontal', [1, 1], pane('a', 'companion'), pane('b')));
    const input = { layout, source: ['a'], operation: 'tab' as const, available };
    expect(
      planWorkspacePlacement({ ...input, destination: { target: 'companion', position: 'tab', index: 0 } })
    ).toEqual({ kind: 'tab', layout, context: { kind: 'recipient', members: ['companion'] } });
    const reordered = planWorkspacePlacement({
      ...input,
      destination: { target: 'companion', position: 'tab', index: 2 }
    })!;
    expect(reordered.kind).toBe('tab');
    expect(visible(reordered.layout)).toEqual(
      split('horizontal', [0.5, 0.5], { type: 'pane', panels: ['companion', 'a'], active: 'a' }, pane('b'))
    );
  });

  it('reports the evaluated recipient membership before source stripping, independently of destination size', () => {
    const layout = saved(
      split('horizontal', [2, 5, 3], pane('a'), split('vertical', [1, 1], pane('b'), pane('c')), pane('d'))
    );
    expect(place(layout, ['d'], { region: 'root.1', position: 'top' })?.context).toEqual({
      kind: 'recipient',
      members: ['b', 'c']
    });
    expect(place(layout, ['d'], { region: 'root', position: 'top' })?.context).toEqual({
      kind: 'recipient',
      members: ['a', 'b', 'c']
    });
    expect(place(layout, ['d'], { region: 'root.0', position: 'left', operation: 'order' })?.context).toEqual({
      kind: 'rail',
      members: ['a', 'b', 'c', 'd']
    });
  });

  it('includes a surviving source-group member in an enclosing scope and excludes closed or carried views', () => {
    const layout = saved(
      split(
        'horizontal',
        [2, 8],
        pane('a', 'companion'),
        split('vertical', [1, 1, 1], pane('b'), pane('c'), pane('f'))
      ),
      ['f']
    );
    expect(place(layout, ['companion'], { region: 'root', position: 'top' })?.context).toEqual({
      kind: 'recipient',
      members: ['a', 'b', 'c']
    });
    expect(place(layout, ['a', 'companion'], { region: 'root', position: 'top' })?.context).toEqual({
      kind: 'recipient',
      members: ['b', 'c']
    });
  });
});
