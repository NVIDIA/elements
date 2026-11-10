// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from 'vitest';

import type { Dimensions, Point, Rect } from '@nvidia-elements/core/internal';

import { allocateWorkspace } from '../geometry/allocation.utils.js';
import { getMinimumWorkspaceDimensions } from '../geometry/sizing.utils.js';
import { getBoundaryPlacementOffers } from '../interaction/boundary.utils.js';
import { createInsertionOffers, getCurrentInsertionSeam } from '../interaction/insertion-offers.utils.js';
import { decidePlacement, decidePointerPlacement } from '../interaction/placement-decision.utils.js';
import { getPanelIds } from '../model/layout.utils.js';
import { createDetachedLayout, projectLayout } from '../model/operations.utils.js';
import { parseWorkspaceValue } from '../model/value.utils.js';
import { getGroupInsertion } from './group-insertion.utils.js';
import { planWorkspacePlacement } from './planner.utils.js';
import { evaluatePlacementOffer } from './preparation.utils.js';
import { WorkspaceEvaluation } from '../evaluation.utils.js';

import type {
  WorkspaceDragPreview,
  WorkspaceDropIntent,
  WorkspaceOfferContext
} from '../interaction/drag-preview.utils.js';
import type { WorkspaceLayout, WorkspaceNode } from '../model/layout.utils.js';

import '../../define.js';

describe('workspace insertion seam acquisition', () => {
  afterEach(() => vi.restoreAllMocks());

  const group = (...panels: string[]): WorkspaceNode => ({ type: 'group', panels, active: panels[0]! });
  const root = (): WorkspaceNode => ({
    type: 'split',
    axis: 'horizontal',
    weights: [0.4, 0.6],
    children: [
      group('a', 'companion'),
      { type: 'split', axis: 'vertical', weights: [0.5, 0.5], children: [group('b'), group('c')] }
    ]
  });
  const bounds = { x: 0, y: 0, width: 600, height: 300 };

  function createCatalog(
    currentLayout: WorkspaceLayout,
    options: { source: string[]; gap?: number; bounds?: Rect; minimum?: Dimensions }
  ) {
    const { source, gap = 6, bounds: frame = bounds, minimum = { width: 0, height: 0 } } = options;
    const host = document.createElement('div');
    vi.spyOn(host, 'getBoundingClientRect').mockReturnValue(new DOMRect(frame.x, frame.y, frame.width, frame.height));
    const panels = getPanelIds(currentLayout.root).map(id => {
      const panel = document.createElement('nve-workspace-panel');
      panel.id = id;
      panel.minWidth = minimum.width;
      panel.minHeight = minimum.height;
      return panel;
    });
    const evaluation = new WorkspaceEvaluation(host, {
      panels,
      layout: currentLayout,
      source,
      measurements: { ...frame, gap, headerHeight: 0, gripWidth: 0, actionWidth: 0, tabWidth: 0, tabMinWidth: 0 },
      policy: 'stop',
      strip: () => null
    });
    return (layout: WorkspaceLayout) => evaluation.targetCatalog(source, evaluation.geometry(layout)).regions;
  }

  function createInsertionInput(source: string[], gap = 6) {
    const currentLayout: WorkspaceLayout = { version: 1, root: root(), closed: [] };
    const available = ['a', 'companion', 'b', 'c'];
    const catalog = createCatalog(currentLayout, { source, gap });
    const regions = catalog(createDetachedLayout(currentLayout, source));
    return { gap, currentLayout, source, available, regions, root: currentLayout.root, existing: [] };
  }

  it.each(['horizontal', 'vertical'] as const)(
    'offers the interior of a %s receiving arrangement to an incoming group',
    axis => {
      const currentLayout: WorkspaceLayout = {
        version: 1,
        closed: [],
        root: {
          type: 'split',
          axis: axis === 'horizontal' ? 'vertical' : 'horizontal',
          weights: [2, 3],
          children: [
            group('a', 'companion'),
            { type: 'split', axis, weights: [1, 4], children: [group('b'), group('c')] }
          ]
        }
      };
      const source = ['a', 'companion'];
      const available = ['a', 'companion', 'b', 'c'];
      const catalog = createCatalog(currentLayout, { source });
      const regions = catalog(createDetachedLayout(currentLayout, source));
      const hints = createInsertionOffers({
        gap: 6,
        currentLayout,
        source,
        available,
        regions,
        root: currentLayout.root,
        existing: []
      });
      const hint = hints.find(offer => offer.insertion.previous?.includes('b') && offer.insertion.next?.includes('c'));
      expect(hint?.kind).toBe('insert');
      expect(hint?.insertion.axis).toBe(axis);
      const previous = regions.find(region => region.node.type === 'group' && region.node.panels.includes('b'))!.rect;
      const next = regions.find(region => region.node.type === 'group' && region.node.panels.includes('c'))!.rect;
      const normal = axis === 'horizontal' ? 'x' : 'y';
      const extent = axis === 'horizontal' ? 'width' : 'height';
      expect(hint!.rect[normal] + 6).toBeCloseTo((previous[normal] + previous[extent] + next[normal]) / 2);
      const point = { x: hint!.rect.x + hint!.rect.width / 2, y: hint!.rect.y + hint!.rect.height / 2 };
      const decision = decidePlacement({
        gap: 6,
        currentLayout,
        source,
        available,
        regions,
        bounds,
        point,
        header: true,
        headers: [{ ...next, height: 40 }]
      });
      expect(decision.intent?.kind).toBe('insert');
      expect(decision.acquisition?.plan.layout).toEqual(hint!.plan.layout);
    }
  );

  it('acquires the current B/C seam after extracting a companion below the whole arrangement', () => {
    const currentLayout: WorkspaceLayout = {
      version: 1,
      closed: [],
      root: {
        type: 'split',
        axis: 'horizontal',
        weights: [2, 3],
        children: [
          group('a', 'companion'),
          { type: 'split', axis: 'vertical', weights: [1, 1, 1], children: [group('b'), group('c'), group('d')] }
        ]
      }
    };
    const available = ['a', 'companion', 'b', 'c', 'd'];
    const source = ['companion'];
    const frame = { x: 0, y: 0, width: 900, height: 600 };
    const allocate = (layout: WorkspaceLayout) =>
      allocateWorkspace({
        gap: 6,
        root: layout.root,
        rect: frame,
        minimum: () => ({ width: 64, height: 48 }),
        policy: 'stop'
      });
    const destination = { target: 'a', region: 'root', position: 'bottom' as const };
    const plan = planWorkspacePlacement({
      layout: currentLayout,
      source,
      destination,
      operation: 'insert',
      available
    })!;
    const reserved = allocate(plan.layout);
    const catalog = createCatalog(currentLayout, { source, bounds: frame, minimum: { width: 64, height: 48 } });
    const sourceReservation = reserved.groups.find(item => item.group.panels.includes('companion'))!.rect;
    const preview: WorkspaceDragPreview = {
      phase: 'detached',
      source,
      blocked: false,
      allocation: 'reserved',
      layout: plan.layout,
      intent: { kind: 'insert', destination },
      cue: { kind: 'group', rect: sourceReservation }
    };
    const first = reserved.groups.find(item => item.group.panels.includes('b'))!.rect;
    const next = reserved.groups.find(item => item.group.panels.includes('c'))!.rect;
    const seam = (first.y + first.height + next.y) / 2;
    const result = decidePlacement({
      gap: 6,
      currentLayout,
      source,
      available,
      bounds: frame,
      preview,
      sourceReservation,
      regions: catalog(createDetachedLayout(currentLayout, source)),
      orderingRegions: catalog(plan.layout),
      header: false,
      local: preview.intent,
      point: { x: next.x + next.width / 2, y: seam }
    });
    expect(result.hint!.rect.y + result.hint!.rect.height / 2).toBe(seam);
    const acquired = getGroupInsertion({ plan: result.acquisition!.plan, source, available });
    expect(acquired?.previous).toEqual(['b']);
    expect(acquired?.next).toEqual(['c']);
  });

  it('resolves promoted group-left to the current A/C gutter while preserving its acquisition lane', () => {
    const input = createInsertionInput(['b']);
    const recipient = input.regions.find(r => r.node.type === 'group' && r.node.panels.includes('c'))!.rect;
    const previous = input.regions.find(r => r.node.type === 'group' && r.node.panels.includes('a'))!.rect;
    const hint = createInsertionOffers(input).find(o => o.destination.position === 'left' && o.owner === 'root.1')!;
    expect(hint.owner).toBe('root.1');
    expect(hint.insertion.index).toBe(1);
    expect(hint.insertion.previous).toEqual(['a', 'companion']);
    expect(hint.insertion.next).toEqual(['c']);
    const result = getBoundaryPlacementOffers({
      offers: [hint],
      bounds: bounds,
      point: { x: recipient.x + 20, y: 150 },
      current: undefined,
      headers: [],
      geometry: {
        gap: 6,
        regions: input.regions,
        source: input.source
      }
    });
    const painted = result.offers[0]!;
    expect(painted.rect.x + painted.rect.width / 2).toBeCloseTo((previous.x + previous.width + recipient.x) / 2);
    expect(painted.hitRect).toEqual(hint.rect);
    const distant = input.regions.map(r =>
      r.node.type === 'group' && r.node.panels.includes('c') ? { ...r, rect: { ...r.rect, x: r.rect.x + 100 } } : r
    );
    expect(getCurrentInsertionSeam(hint, { regions: distant, source: input.source, gap: 6 })).toBeUndefined();
  });
});

describe('workspace placement stability', () => {
  afterEach(() => vi.restoreAllMocks());
  type DetachedPreview = Extract<WorkspaceDragPreview, { phase: 'detached' }>;
  type SpatialIntent = Extract<WorkspaceDropIntent, { kind: 'split' | 'order' | 'insert' }>;

  function createScenario(options: { transpose?: boolean; width?: number; gap?: number; rootWeights?: number[] }) {
    const { transpose = false, width = 680.5, gap = 6, rootWeights = [1, 4] } = options;
    const main = transpose ? 'vertical' : 'horizontal';
    const cross = transpose ? 'horizontal' : 'vertical';
    const group = (...panels: string[]) => ({ type: 'group', panels, active: panels[0] });
    const currentLayout = parseWorkspaceValue(
      JSON.stringify({
        version: 1,
        closed: [],
        root: {
          type: 'split',
          axis: main,
          weights: rootWeights,
          children: [
            group('outline'),
            {
              type: 'split',
              axis: cross,
              weights: [3, 2],
              children: [
                { type: 'split', axis: main, weights: [3, 2], children: [group('editor'), group('preview')] },
                group('notes', 'activity', 'tasks')
              ]
            }
          ]
        }
      })
    );
    if (!currentLayout) throw new Error('Expected a workspace layout');
    const source = ['preview'];
    const available = ['outline', 'editor', 'preview', 'notes', 'activity', 'tasks'];
    const bounds = transpose
      ? { x: 24.25, y: 30.5, width: 600.25, height: width }
      : { x: 24.25, y: 30.5, width, height: 600.25 };
    const requirements = {
      gap,
      panels: new Map(available.map(id => [id, { width: 64, height: id === 'editor' ? 80 : 48 }])),
      chrome: { width: 64, height: 48 }
    };
    const allocate = (layout: WorkspaceLayout) =>
      allocateWorkspace({
        gap,
        root: projectLayout(layout, available).root,
        rect: bounds,
        minimum: node => getMinimumWorkspaceDimensions(node, requirements),
        policy: 'stop'
      });
    const detached = allocate(createDetachedLayout(currentLayout, source));
    const host = document.createElement('div');
    const canvas = document.createElement('div');
    canvas.className = 'canvas';
    host.attachShadow({ mode: 'open' }).append(canvas);
    vi.spyOn(host, 'getBoundingClientRect').mockReturnValue(
      new DOMRect(bounds.x, bounds.y, bounds.width, bounds.height)
    );
    vi.spyOn(canvas, 'getBoundingClientRect').mockReturnValue(
      new DOMRect(bounds.x, bounds.y, bounds.width, bounds.height)
    );
    const panels = available.map(id => {
      const panel = document.createElement('nve-workspace-panel');
      panel.id = id;
      panel.minWidth = 64;
      panel.minHeight = id === 'editor' ? 80 : 48;
      return panel;
    });
    const measurements = {
      ...bounds,
      gap,
      headerHeight: 48,
      gripWidth: 0,
      actionWidth: 0,
      tabWidth: 64,
      tabMinWidth: 0
    };

    function createPreview(
      intent: SpatialIntent,
      previous?: DetachedPreview,
      acquisition?: WorkspaceOfferContext['acquisition']
    ): DetachedPreview {
      const evaluation = createEvaluation(previous);
      const result = evaluatePlacementOffer({
        evaluation,
        layout: currentLayout,
        measurements,
        source,
        intent,
        groupable: true,
        context: { selected: previous, acquisition },
        currentRegions: () => evaluation.presentationGeometry().regions
      });
      if (!result) throw new Error('Expected a placement offer');
      return { ...result, phase: 'detached', source, intent, blocked: !result.feasible };
    }

    function createEvaluation(previous?: DetachedPreview) {
      return new WorkspaceEvaluation(
        host,
        {
          panels,
          layout: currentLayout,
          source,
          measurements,
          policy: 'stop',
          strip: () => null
        },
        {
          getCurrentLayout: () => currentLayout,
          getCurrentMeasurements: () => measurements,
          getCurrentPreview: () => previous,
          getFullscreenTarget: () => undefined,
          getResizePreview: () => undefined
        }
      );
    }

    function step(preview: DetachedPreview, point: Point) {
      const evaluation = createEvaluation(preview);
      const decision = decidePointerPlacement({
        placement: evaluation.getPlacementCatalog(source, point),
        canonicalRoot: currentLayout.root,
        currentLayout,
        source,
        available,
        gap,
        point,
        heldIntent: preview.intent,
        groupable: true,
        projectLayout: evaluation.projectLayout
      });
      if (!decision.intent || decision.intent.kind === 'invalid' || decision.intent.kind === 'tab') return preview;
      return createPreview(
        decision.intent,
        preview,
        decision.acquisition ? { ...decision.acquisition, point } : undefined
      );
    }

    const recipient = detached.groups.find(item => item.group.panels.includes('editor'))!.rect;
    const notes = detached.groups.find(item => item.group.panels.includes('notes'))!.rect;
    const point = (offset: number) =>
      transpose
        ? { x: offset < 12 ? (recipient.x + recipient.width + notes.x) / 2 : bounds.x + 80, y: recipient.y + offset }
        : { x: recipient.x + offset, y: bounds.y + 80 };
    const seed = createPreview({
      kind: 'split',
      destination: { target: 'editor', position: transpose ? 'top' : 'left' }
    });
    return { seed, step, point };
  }

  it.each([false, true])(
    'preserves outer and inner lane ownership across successor reservations, transposed %s',
    transpose => {
      const { seed, step, point } = createScenario({ transpose });
      let preview = seed;
      for (const [offset, kind] of [
        [2, 'insert'],
        [14, 'order'],
        [2, 'insert']
      ] as const) {
        let expectedIntent: WorkspaceDropIntent | undefined;
        for (let iteration = 0; iteration < 4; iteration++) {
          preview = step(preview, point(offset));
          expectedIntent ??= preview.intent;
          expect(preview.intent).toEqual(expectedIntent);
          expect(preview.intent.kind).toBe(kind);
          expect(preview.allocation).toBe('reserved');
          expect(preview.blocked).toBe(false);
        }
      }
    }
  );

  it('keeps both lanes reachable when a narrow zero-gap reservation moves their shared edge', () => {
    const { seed, step, point } = createScenario({ width: 256, gap: 0, rootWeights: [45, 19] });
    let preview = seed;
    for (const [offset, kind] of [
      [2, 'insert'],
      [14, 'order'],
      [2, 'insert']
    ] as const) {
      let expectedIntent: WorkspaceDropIntent | undefined;
      for (let iteration = 0; iteration < 4; iteration++) {
        preview = step(preview, point(offset));
        expectedIntent ??= preview.intent;
        expect(preview.intent).toEqual(expectedIntent);
        expect(preview.intent.kind).toBe(kind);
        expect(preview.allocation).toBe('reserved');
        expect(preview.blocked).toBe(false);
      }
    }
  });
});
