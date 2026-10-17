// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createFixture, removeFixture } from '@internals/testing';
import type { Rect } from '@nvidia-elements/core/internal';

import { getPanelIds } from './model/layout.utils.js';
import { WorkspaceEvaluation } from './evaluation.utils.js';

import type { WorkspaceDragPreview } from './interaction/drag-preview.utils.js';
import type { WorkspaceLayout, WorkspaceNode } from './model/layout.utils.js';

import '../define.js';

const layout: WorkspaceLayout = {
  version: 1,
  closed: [],
  root: {
    type: 'split',
    axis: 'vertical',
    weights: [1, 1],
    children: [
      { type: 'group', panels: ['a'], active: 'a' },
      { type: 'group', panels: ['b'], active: 'b' }
    ]
  }
};

const measurements = {
  gap: 6,
  width: 300,
  height: 100,
  headerHeight: 30,
  gripWidth: 20,
  tabWidth: 60,
  tabMinWidth: 0,
  actionWidth: 20
};

function createPanels() {
  return ['a', 'b'].map(id => {
    const panel = document.createElement('nve-workspace-panel');
    panel.id = id;
    return panel;
  });
}

describe('workspace evaluations', () => {
  it('keeps the retained source extent separate from a candidate’s own minimum extent', () => {
    const supplied = createPanels();
    supplied[0]!.minHeight = 200;
    supplied[1]!.minHeight = 100;
    const evaluation = new WorkspaceEvaluation(document.createElement('div'), {
      panels: supplied,
      layout,
      source: ['a'],
      measurements,
      policy: 'stop',
      strip: () => undefined
    });
    const candidate: WorkspaceLayout = { ...layout, root: { type: 'group', panels: ['b'], active: 'b' } };
    const reserved = evaluation.geometry(candidate, evaluation.project(layout));
    const independent = evaluation.geometry(candidate);
    expect(reserved.height).toBe(306);
    expect(independent.height).toBe(100);
    expect(evaluation.detached(['a']).height).toBe(306);
    expect(independent.groups[0]!.panels).toEqual([supplied[1]]);
  });

  it('reuses projections without conflating closed state', () => {
    const evaluation = new WorkspaceEvaluation(document.createElement('div'), {
      panels: createPanels(),
      layout,
      source: ['a'],
      measurements: { ...measurements, height: 300 },
      policy: 'stop',
      strip: () => undefined
    });
    const projected = evaluation.project(layout);
    expect(evaluation.project(layout)).toBe(projected);
    const closed = evaluation.project({ ...layout, closed: ['a'] });
    expect(closed.root).toEqual({ type: 'group', panels: ['b'], active: 'b' });
    expect(evaluation.geometry(closed).groups).toHaveLength(1);
  });

  it('reuses geometry by root identity without conflating distinct candidate weights', () => {
    const evaluation = new WorkspaceEvaluation(document.createElement('div'), {
      panels: createPanels(),
      layout,
      source: ['a'],
      measurements: { ...measurements, height: 300 },
      policy: 'stop',
      strip: () => undefined
    });
    const projected = evaluation.project(layout);
    const geometry = evaluation.geometry(projected);
    expect(evaluation.geometry({ ...projected })).toBe(geometry);
    if (layout.root?.type !== 'split') throw new Error('Expected split');
    const candidate = { ...layout, root: { ...layout.root, weights: [3, 1] } };
    expect(evaluation.geometry(candidate).groups[0]!.rect.height).not.toBe(geometry.groups[0]!.rect.height);
  });

  it('reuses detached geometry only for the same source', () => {
    const evaluation = new WorkspaceEvaluation(document.createElement('div'), {
      panels: createPanels(),
      layout,
      source: ['a'],
      measurements: { ...measurements, height: 300 },
      policy: 'stop',
      strip: () => undefined
    });
    const source = ['a'];
    expect(evaluation.detached(source)).toBe(evaluation.detached(source));
    expect(evaluation.detached(['b']).groups[0]!.panels[0]!.id).toBe('a');
  });

  it('separates the queried source from live reservation occupancy without reading animated panels', () => {
    const host = document.createElement('div');
    const readBounds = vi.spyOn(host, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 300, 300));
    const measuredMeasurements = { ...measurements, height: 300 };
    const supplied = createPanels();
    for (const panel of supplied) {
      vi.spyOn(panel, 'getBoundingClientRect').mockImplementation(() => {
        throw new Error('Animated panels do not define placement inputs');
      });
    }
    let preview: WorkspaceDragPreview | undefined = {
      phase: 'attached',
      source: ['b'],
      intent: { kind: 'invalid' },
      blocked: false,
      cue: { kind: 'group', rect: { x: 0, y: 153, width: 300, height: 147 } }
    };
    const evaluation = new WorkspaceEvaluation(
      host,
      {
        panels: supplied,
        layout,
        source: [],
        measurements: measuredMeasurements,
        policy: 'stop',
        strip: () => undefined
      },
      {
        getCurrentLayout: () => layout,
        getCurrentMeasurements: () => measuredMeasurements,
        getCurrentPreview: () => preview,
        getFullscreenTarget: () => undefined,
        getResizePreview: () => undefined
      }
    );

    const body = evaluation.getPlacementCatalog(['a'], { x: 150, y: 200 });
    expect(body.targets.map(target => target.panels)).toEqual([['b']]);
    expect(body.sourceSlot).toEqual({ x: 0, y: 0, width: 300, height: 147 });
    expect(body.reservationHit).toBe('group');
    expect(body.headerTarget).toBeUndefined();
    expect(evaluation.getPlacementCatalog(['a'], { x: 150, y: 10 }).headerTarget?.panels).toEqual(['b']);

    preview = undefined;
    expect(evaluation.getPlacementCatalog(['a'], { x: 150, y: 200 }).reservationHit).toBeUndefined();
    expect(readBounds).toHaveBeenCalledOnce();
  });

  it('reads changed constraints and supplied panels in the next evaluation', () => {
    const supplied = createPanels();
    const host = document.createElement('div');
    const initial = new WorkspaceEvaluation(host, {
      panels: supplied,
      layout,
      source: [],
      measurements,
      policy: 'stop',
      strip: () => undefined
    });
    const before = initial.geometry(initial.project(layout));
    supplied[0]!.minWidth = 500;
    const next = new WorkspaceEvaluation(host, {
      panels: [supplied[0]!],
      layout,
      source: [],
      measurements,
      policy: 'stop',
      strip: () => undefined
    });
    const after = next.geometry(next.project(layout));
    expect(before.width).toBe(300);
    expect(after.width).toBe(500);
    expect(after.groups).toHaveLength(1);
    expect(after.groups[0]!.panels).toEqual([supplied[0]]);
  });
});

describe('workspace presented target geometry', () => {
  const makeGroup = (...panels: string[]): WorkspaceNode => ({ type: 'group', panels, active: panels[0]! });
  const split = (axis: 'horizontal' | 'vertical', ...children: WorkspaceNode[]): WorkspaceNode => ({
    type: 'split',
    axis,
    children,
    weights: children.map(() => 1)
  });
  const bounds = { x: 0, y: 0, width: 800, height: 600 };

  const rect = (value: Rect) => new DOMRect(value.x, value.y, value.width, value.height);
  let fixture: HTMLElement;

  afterEach(() => {
    removeFixture(fixture);
    vi.restoreAllMocks();
  });

  async function setup(
    currentLayout: WorkspaceLayout,
    current: WorkspaceNode,
    options: { source?: string[]; clip?: Rect } = {}
  ) {
    const { source = ['a'], clip = bounds } = options;
    if (fixture?.isConnected) removeFixture(fixture);
    const panels = getPanelIds(currentLayout.root).map(id => {
      const panel = document.createElement('nve-workspace-panel');
      panel.id = id;
      return panel;
    });
    fixture = await createFixture(html`<div>${panels}</div>`);
    const host = fixture.querySelector('div')!;
    vi.spyOn(host, 'getBoundingClientRect').mockReturnValue(rect(clip));
    const evaluation = new WorkspaceEvaluation(host, {
      panels,
      layout: currentLayout,
      source,
      measurements: {
        ...bounds,
        gap: 6,
        headerHeight: 20,
        gripWidth: 0,
        actionWidth: 0,
        tabWidth: 20,
        tabMinWidth: 0
      },
      policy: 'stop',
      strip: () => null
    });
    const catalog = evaluation.geometry(evaluation.project(currentLayout)).regions;
    const allocation = evaluation.geometry({ version: 1, root: current, closed: [] });
    return {
      input: { catalog, allocation: allocation.regions },
      regions: evaluation.targetCatalog(source, allocation).regions
    };
  }

  it('keeps saved E and branch addresses while their displayed positions move', async () => {
    const branch = split('vertical', makeGroup('b'), makeGroup('c'));
    const currentLayout: WorkspaceLayout = {
      version: 1,
      closed: [],
      root: split('horizontal', makeGroup('a'), branch, makeGroup('e'))
    };
    const result = await setup(currentLayout, split('horizontal', branch, makeGroup('a'), makeGroup('e')));
    const moved = result.regions.find(region => region.key === 'root.1')!;
    expect(moved.rect.x).toBe(0);
    expect(moved.node).toEqual(result.input.catalog.find(region => region.key === 'root.1')!.node);
    const e = result.regions.find(region => region.node.type === 'group' && region.node.panels.includes('e'))!;
    expect(e.key).toBe('root.2');
    expect(e.rect.width).toBeCloseTo(result.input.allocation.find(region => region.key === 'root.2')!.rect.width, 8);
  });

  it('retains the full allocated owner around interior and outer source vacancies', async () => {
    const branch = split('vertical', makeGroup('b'), makeGroup('c'));
    const currentLayout: WorkspaceLayout = {
      version: 1,
      closed: [],
      root: split('horizontal', makeGroup('a'), branch, makeGroup('e'))
    };
    const result = await setup(currentLayout, split('horizontal', branch, makeGroup('a'), makeGroup('e')));
    expect(result.regions.find(region => region.key === 'root')!.rect).toEqual(bounds);
    const outer = await setup(currentLayout, split('horizontal', branch, makeGroup('e'), makeGroup('a')));
    expect(outer.regions.find(region => region.key === 'root')!.rect).toEqual(bounds);
    expect(
      outer.regions.some(region => region.node.type === 'group' && region.node.panels.every(id => id === 'a'))
    ).toBe(false);
  });

  it('maps a partial source group to Companion rather than stretching through its proposed tab destination', async () => {
    const currentLayout: WorkspaceLayout = {
      version: 1,
      closed: [],
      root: split('horizontal', makeGroup('a', 'companion'), makeGroup('b'))
    };
    const result = await setup(currentLayout, split('horizontal', makeGroup('companion'), makeGroup('b', 'a')));
    const origin = result.regions.find(region => region.key === 'root.0')!;
    expect(origin.rect.width).toBeCloseTo(
      result.input.allocation.find(region => region.key === 'root.0')!.rect.width,
      8
    );
    expect(origin.rect.width).toBeLessThan(bounds.width);
  });

  it('chooses the deepest collapsed scope', async () => {
    const currentLayout: WorkspaceLayout = {
      version: 1,
      closed: [],
      root: { type: 'split', axis: 'horizontal', children: [makeGroup('a'), makeGroup('b')], weights: [1, 4] }
    };
    const result = await setup(currentLayout, makeGroup('b'));
    expect(result.regions.map(region => region.key)).toEqual(['root.1']);
  });

  it('retains distinct dormant ownership even when visible bounds and members match', async () => {
    const currentLayout: WorkspaceLayout = {
      version: 1,
      closed: ['closed'],
      root: split('horizontal', makeGroup('a'), split('vertical', makeGroup('b'), makeGroup('closed')))
    };
    const result = await setup(currentLayout, makeGroup('b'));
    expect(result.regions.map(region => region.key)).toEqual(['root', 'root.1']);
  });

  it('preserves real edges while excluding fully clipped targets', async () => {
    const currentLayout: WorkspaceLayout = {
      version: 1,
      closed: [],
      root: split('horizontal', makeGroup('a'), makeGroup('b'), makeGroup('e'))
    };
    const clipped = (await setup(currentLayout, currentLayout.root!, { clip: { ...bounds, width: 380 } })).regions;
    expect(clipped.find(region => region.key === 'root')!.rect.width).toBe(800);
    expect(clipped.some(region => region.rect.x + region.rect.width > 380)).toBe(true);
    expect(clipped.some(region => region.node.type === 'group' && region.node.panels.includes('e'))).toBe(false);
  });

  it('retains the true header origin when the viewport clips its top', async () => {
    const currentLayout: WorkspaceLayout = {
      version: 1,
      closed: [],
      root: split('horizontal', makeGroup('a'), makeGroup('b'))
    };
    const partial = (await setup(currentLayout, makeGroup('b'), { clip: { x: 0, y: 20, width: 800, height: 580 } }))
      .regions;
    expect(partial[0]!.rect.y).toBe(0);
    const content = (await setup(currentLayout, makeGroup('b'), { clip: { x: 0, y: 80, width: 800, height: 520 } }))
      .regions;
    expect(content[0]!.rect.y).toBe(0);
    expect(content[0]!.rect.height).toBe(600);
  });
});
