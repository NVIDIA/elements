// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createFixture, removeFixture } from '@internals/testing';
import type { Rect } from '@nvidia-elements/core/internal';

import { getPanelIds } from './model/layout.utils.js';
import { WorkspaceEvaluation, WorkspaceEvaluationCache } from './evaluation.utils.js';

import type { WorkspacePlacementCatalog } from './evaluation.utils.js';
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
    expect(body.sourceReservation).toEqual({ x: 0, y: 0, width: 300, height: 147 });
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

describe('workspace evaluation reuse scope', () => {
  let fixture: HTMLElement | undefined;

  afterEach(() => {
    if (fixture) removeFixture(fixture);
    fixture = undefined;
    vi.restoreAllMocks();
  });

  async function createEvaluationContext() {
    fixture = await createFixture(html`<div></div>`);
    const host = fixture.querySelector('div')!;
    const viewport = document.createElement('div');
    viewport.className = 'viewport';
    viewport.style.cssText = 'position:fixed;left:0;top:0;width:300px;height:300px';
    host.attachShadow({ mode: 'open' }).append(viewport);
    const currentLayout = structuredClone(layout);
    const currentMeasurements = { ...measurements, height: 300 };
    const panels = createPanels();
    const source = ['a'];
    const preview: WorkspaceDragPreview = {
      phase: 'detached',
      source,
      intent: { kind: 'invalid' },
      blocked: false,
      allocation: 'overlay',
      cue: { kind: 'group', rect: { x: 0, y: 0, width: 300, height: 300 } }
    };
    const inputs = {
      layout: currentLayout,
      panels,
      source,
      measurements: currentMeasurements,
      policy: 'stop' as const,
      strip: () => undefined
    };
    const delegate = {
      getCurrentLayout: () => currentLayout,
      getCurrentMeasurements: () => currentMeasurements,
      getCurrentPreview: () => preview,
      getFullscreenTarget: () => undefined,
      getResizePreview: () => undefined
    };
    const cache = new WorkspaceEvaluationCache(host);
    const createEvaluation = () => new WorkspaceEvaluation(host, inputs, delegate);
    return { createEvaluation, cache, inputs, delegate, host, currentLayout, currentMeasurements };
  }

  it('reuses geometry across scoped evaluations and refreshes changed measurement values', async () => {
    const { cache, inputs, delegate, currentLayout, currentMeasurements } = await createEvaluationContext();
    const readGeometry = () =>
      cache.run(inputs, delegate, evaluation => evaluation.geometry(evaluation.project(currentLayout)));
    const first = readGeometry();
    expect(readGeometry()).toBe(first);

    currentMeasurements.width = 500;
    const changed = readGeometry();
    expect(changed).not.toBe(first);
    expect(changed.width).toBe(500);
    expect(first.width).toBe(300);
    expect(readGeometry()).toBe(changed);
  });

  it('reuses the same geometry for omitted and explicitly equal extents', async () => {
    const { cache, inputs, delegate, currentLayout } = await createEvaluationContext();
    const first = cache.run(inputs, delegate, evaluation => evaluation.geometry(evaluation.project(currentLayout)));
    const explicit = cache.run(inputs, delegate, evaluation => {
      const projected = evaluation.project(currentLayout);
      return evaluation.geometry(projected, projected);
    });
    expect(explicit).toBe(first);
  });

  it('keeps a distinct extent out of retained current-layout geometry', async () => {
    const { cache, inputs, delegate, currentLayout } = await createEvaluationContext();
    const result = cache.run(inputs, delegate, evaluation => {
      const projected = evaluation.project(currentLayout);
      const base = evaluation.geometry(projected);
      const otherExtent: WorkspaceLayout = { version: 1, closed: [], root: null };
      const distinct = evaluation.geometry(projected, otherExtent);
      expect(distinct).not.toBe(base);
      expect(distinct.minimum).toEqual({ width: 0, height: 0 });
      expect(evaluation.geometry(projected, projected)).toBe(base);
      return base;
    });
    expect(cache.run(inputs, delegate, evaluation => evaluation.geometry(evaluation.project(currentLayout)))).toBe(
      result
    );
  });

  it('reuses catalog structure across scoped evaluations while returning fresh hit views', async () => {
    const { cache, inputs, delegate, currentMeasurements } = await createEvaluationContext();
    const readCatalog = (): WorkspacePlacementCatalog =>
      cache.run(inputs, delegate, evaluation => evaluation.targetCatalog(['a']));
    const first = readCatalog();
    first.headerTarget = first.targets[0];
    const second = readCatalog();
    expect(second).not.toBe(first);
    expect(second.regions).toBe(first.regions);
    expect(second.targets).toBe(first.targets);
    expect(second.headerTarget).toBeUndefined();

    currentMeasurements.headerHeight = 40;
    const changed = readCatalog();
    expect(changed.regions).not.toBe(first.regions);
    expect(changed.targets[0]?.headerHeight).toBe(40);
    expect(first.targets[0]?.headerHeight).toBe(30);
    expect(readCatalog().regions).toBe(changed.regions);
  });

  it('keeps scope rectangles fresh across retained views and native or constraint changes', async () => {
    const { cache, inputs, delegate, host, currentMeasurements } = await createEvaluationContext();
    const canvas = document.createElement('div');
    host.shadowRoot!.append(canvas);
    canvas.className = 'canvas';
    let origin = new DOMRect(0, 0, 300, 300);
    vi.spyOn(canvas, 'getBoundingClientRect').mockImplementation(() => origin);
    const readCatalog = () => cache.run(inputs, delegate, evaluation => evaluation.targetCatalog(['a']));
    const resolve = (catalog: WorkspacePlacementCatalog) =>
      catalog.resolveScopeRect?.({ members: ['b'], allocation: catalog.regions, source: ['a'] });

    const first = readCatalog();
    expect(resolve(first)).toEqual({ x: 0, y: 0, width: 300, height: 300 });
    expect(resolve(readCatalog())).toEqual(resolve(first));

    origin = new DOMRect(40, 25, 300, 300);
    const moved = readCatalog();
    expect(resolve(moved)).toEqual({ x: 40, y: 25, width: 300, height: 300 });
    expect(resolve(first)).toEqual({ x: 0, y: 0, width: 300, height: 300 });

    currentMeasurements.width = 500;
    const expanded = readCatalog();
    expect(resolve(expanded)).toEqual({ x: 40, y: 25, width: 500, height: 300 });
    inputs.panels[1]!.minHeight = 600;
    const constrained = readCatalog();
    expect(resolve(constrained)).toEqual({ x: 40, y: 25, width: 500, height: 636 });
    expect(resolve(readCatalog())).toEqual(resolve(constrained));
  });

  it('snapshots native DOMRect bounds on the host fallback path', async () => {
    const { cache, inputs, delegate, host } = await createEvaluationContext();
    host.shadowRoot!.querySelector('.viewport')!.remove();
    let bounds = new DOMRect(0, 0, 300, 300);
    vi.spyOn(host, 'getBoundingClientRect').mockImplementation(() => bounds);
    const readCatalog = () => cache.run(inputs, delegate, evaluation => evaluation.targetCatalog(['a']));
    const first = readCatalog();
    expect(first.bounds.width).toBe(300);
    expect(readCatalog().regions).toBe(first.regions);
    bounds = new DOMRect(20, 0, 300, 300);
    const changed = readCatalog();
    expect(changed.regions).not.toBe(first.regions);
    expect(changed.bounds.x).toBe(20);
    expect(readCatalog().regions).toBe(changed.regions);
  });

  it('does not retain caller-mutated catalogs outside a reuse scope', async () => {
    const { createEvaluation } = await createEvaluationContext();
    const evaluation = createEvaluation();
    const first = evaluation.targetCatalog(['a']);
    const expected = structuredClone({ ...first, resolveScopeRect: undefined });
    first.regions[0]!.rect.x = -1234;
    first.regions.pop();
    first.targets[0]!.panels.push('caller-modified');

    const next = evaluation.targetCatalog(['a']);
    expect(next).not.toBe(first);
    expect(next.regions).not.toBe(first.regions);
    expect(next.targets).not.toBe(first.targets);
    expect({ ...next, resolveScopeRect: undefined }).toEqual(expected);
  });

  it('keeps ordinary evaluations separate from the component owner', async () => {
    const { cache, inputs, delegate, currentLayout, createEvaluation } = await createEvaluationContext();
    const readGeometry = () =>
      cache.run(inputs, delegate, evaluation => evaluation.geometry(evaluation.project(currentLayout)));
    const retained = readGeometry();
    const ordinary = createEvaluation();
    const independent = ordinary.geometry(ordinary.project(currentLayout));
    expect(independent).not.toBe(retained);
    independent.regions[0]!.rect.x = -1234;
    expect(readGeometry()).toBe(retained);
    expect(retained.regions[0]!.rect.x).not.toBe(-1234);
  });

  it('preserves the current evaluation while nested and revokes it when the outer scope exits', async () => {
    const { cache, inputs, delegate, currentLayout } = await createEvaluationContext();
    const first = cache.run(inputs, delegate, evaluation => {
      const geometry = evaluation.geometry(evaluation.project(currentLayout));
      cache.run(inputs, delegate, nested => {
        expect(nested).toBe(evaluation);
        expect(nested.geometry(nested.project(currentLayout))).toBe(geometry);
      });
      expect(cache.current).toBe(evaluation);
      expect(evaluation.geometry(evaluation.project(currentLayout))).toBe(geometry);
      return { evaluation, geometry };
    });
    expect(cache.current).toBeUndefined();
    const escaped = first.evaluation.geometry(first.evaluation.project(currentLayout));
    expect(escaped).not.toBe(first.geometry);
    expect(escaped).toEqual(first.geometry);
  });

  it('clears retained results without ending the active evaluation', async () => {
    const { cache, inputs, delegate, currentLayout } = await createEvaluationContext();
    cache.run(inputs, delegate, evaluation => {
      const first = evaluation.geometry(evaluation.project(currentLayout));
      cache.clear();
      expect(cache.current).toBe(evaluation);
      expect(evaluation.geometry(evaluation.project(currentLayout))).not.toBe(first);
    });
    expect(cache.current).toBeUndefined();
  });

  it('revokes reuse admission when a synchronous evaluation throws', async () => {
    const { cache, inputs, delegate, currentLayout } = await createEvaluationContext();
    let interrupted:
      | { evaluation: WorkspaceEvaluation; geometry: ReturnType<WorkspaceEvaluation['geometry']> }
      | undefined;
    expect(() =>
      cache.run(inputs, delegate, evaluation => {
        interrupted = { evaluation, geometry: evaluation.geometry(evaluation.project(currentLayout)) };
        throw new Error('Interrupted evaluation');
      })
    ).toThrow('Interrupted evaluation');
    expect(cache.current).toBeUndefined();
    if (!interrupted) throw new Error('Expected the interrupted evaluation');
    const escaped = interrupted.evaluation.geometry(interrupted.evaluation.project(currentLayout));
    expect(escaped).not.toBe(interrupted.geometry);
    expect(escaped).toEqual(interrupted.geometry);
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

  async function createTargetGeometry(
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
    const result = await createTargetGeometry(
      currentLayout,
      split('horizontal', branch, makeGroup('a'), makeGroup('e'))
    );
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
    const result = await createTargetGeometry(
      currentLayout,
      split('horizontal', branch, makeGroup('a'), makeGroup('e'))
    );
    expect(result.regions.find(region => region.key === 'root')!.rect).toEqual(bounds);
    const outer = await createTargetGeometry(
      currentLayout,
      split('horizontal', branch, makeGroup('e'), makeGroup('a'))
    );
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
    const result = await createTargetGeometry(
      currentLayout,
      split('horizontal', makeGroup('companion'), makeGroup('b', 'a'))
    );
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
    const result = await createTargetGeometry(currentLayout, makeGroup('b'));
    expect(result.regions.map(region => region.key)).toEqual(['root.1']);
  });

  it('retains distinct dormant ownership even when visible bounds and members match', async () => {
    const currentLayout: WorkspaceLayout = {
      version: 1,
      closed: ['closed'],
      root: split('horizontal', makeGroup('a'), split('vertical', makeGroup('b'), makeGroup('closed')))
    };
    const result = await createTargetGeometry(currentLayout, makeGroup('b'));
    expect(result.regions.map(region => region.key)).toEqual(['root', 'root.1']);
  });

  it('preserves real edges while excluding fully clipped targets', async () => {
    const currentLayout: WorkspaceLayout = {
      version: 1,
      closed: [],
      root: split('horizontal', makeGroup('a'), makeGroup('b'), makeGroup('e'))
    };
    const clipped = (
      await createTargetGeometry(currentLayout, currentLayout.root!, { clip: { ...bounds, width: 380 } })
    ).regions;
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
    const partial = (
      await createTargetGeometry(currentLayout, makeGroup('b'), { clip: { x: 0, y: 20, width: 800, height: 580 } })
    ).regions;
    expect(partial[0]!.rect.y).toBe(0);
    const content = (
      await createTargetGeometry(currentLayout, makeGroup('b'), { clip: { x: 0, y: 80, width: 800, height: 520 } })
    ).regions;
    expect(content[0]!.rect.y).toBe(0);
    expect(content[0]!.rect.height).toBe(600);
  });
});
