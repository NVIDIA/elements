// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { selectedPlacementPlan } from './workspace-acquisition-sizing.utils.js';
import type {
  WorkspaceDragPreview,
  WorkspaceDropIntent,
  WorkspaceOfferContext
} from './workspace-drag-preview.utils.js';
import { parseLayout, type WorkspaceLayout } from './workspace-layout.utils.js';
import { detachedLayout, projectLayout } from './workspace-operations.utils.js';
import { decidePlacement } from './workspace-placement-decision.utils.js';
import { allocateWorkspace } from './workspace-placement.utils.js';
import { planWorkspacePlacement } from './workspace-planner.utils.js';
import { sizePreferredSplit } from './workspace-split-sizing.utils.js';
import { admitsWorkspaceMove, minimumWorkspace } from './workspace-sizing.utils.js';
import { computedRegionCatalog, contentDirection } from './workspace-targeting.utils.js';

type DetachedPreview = Extract<WorkspaceDragPreview, { phase: 'detached' }>;
type SpatialIntent = Extract<WorkspaceDropIntent, { kind: 'split' | 'order' | 'insert' }>;

function scene(options: { transpose?: boolean; width?: number; gap?: number; rootWeights?: number[] }) {
  const { transpose = false, width = 680.5, gap = 6, rootWeights = [1, 4] } = options;
  const main = transpose ? 'vertical' : 'horizontal';
  const cross = transpose ? 'horizontal' : 'vertical';
  const group = (...panels: string[]) => ({ type: 'group', panels, active: panels[0] });
  const saved = parseLayout(
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
  const source = ['preview'];
  const available = ['outline', 'editor', 'preview', 'notes', 'activity', 'tasks'];
  const bounds = { x: 24.25, y: 30.5, width: transpose ? 600.25 : width, height: transpose ? width : 600.25 };
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
      minimum: node => minimumWorkspace(node, requirements),
      policy: 'stop'
    });
  const canonical = allocate(saved);
  const detached = allocate(detachedLayout(saved, source));
  const catalog = (geometry: ReturnType<typeof allocate>) =>
    computedRegionCatalog({
      saved,
      catalog: canonical.regions,
      allocation: geometry.regions,
      source,
      available,
      bounds
    });
  const regions = catalog(detached);

  function offer(
    intent: SpatialIntent,
    previous?: DetachedPreview,
    acquisition?: WorkspaceOfferContext['acquisition']
  ): DetachedPreview {
    let plan = acquisition
      ? acquisition.plan
      : planWorkspacePlacement({
          layout: saved,
          source,
          destination: intent.destination,
          operation: intent.kind,
          available
        });
    if (!plan) throw new Error('Expected a placement plan');
    if (plan.kind === 'split')
      plan = sizePreferredSplit({
        plan,
        source,
        available,
        preference: { allocation: detached.regions, requirements }
      });
    const current = previous?.allocation === 'reserved' ? allocate(previous.layout) : detached;
    const fitted = selectedPlacementPlan({
      plan,
      source,
      available,
      previous,
      intent,
      acquisition,
      current: current.regions,
      rect: bounds,
      origin: { ...bounds, x: 0, y: 0 },
      requirements
    });
    const selected = fitted ?? plan;
    const geometry = allocate(selected.layout);
    const feasible =
      !!fitted &&
      admitsWorkspaceMove({
        current: projectLayout(saved, available).root,
        candidate: projectLayout(selected.layout, available).root,
        viewport: bounds,
        requirements
      });
    return {
      phase: 'detached',
      source,
      blocked: !feasible,
      intent,
      allocation: feasible && selected.kind !== 'split' ? 'reserved' : 'overlay',
      layout: selected.layout,
      cue: { kind: 'group', rect: geometry.groups.find(item => item.group.panels.includes('preview'))!.rect }
    };
  }

  function contentIntent(point: { x: number; y: number }): SpatialIntent | undefined {
    const target = regions.find(item => item.node.type === 'group' && contains(item.rect, point));
    if (target?.node.type !== 'group') return undefined;
    return {
      kind: 'split',
      destination: {
        target: target.node.panels.find(id => !source.includes(id))!,
        position: contentDirection(point.x, point.y, { rect: target.rect, headerHeight: 48 })
      }
    };
  }

  function step(preview: DetachedPreview, point: { x: number; y: number }) {
    const geometry = preview.allocation === 'reserved' ? allocate(preview.layout) : detached;
    const sourceSlot = geometry.groups.find(item => item.group.panels.every(id => source.includes(id)))?.rect;
    const headers = geometry.groups
      .filter(item => !item.group.panels.every(id => source.includes(id)))
      .map(item => ({ ...item.rect, height: 48 }));
    const local = sourceSlot && contains(sourceSlot, point) ? preview.intent : contentIntent(point);
    const decision = decidePlacement({
      gap,
      saved,
      source,
      available,
      regions,
      orderingRegions: catalog(geometry),
      sourceSlot,
      headers,
      preview,
      bounds,
      header: false,
      point,
      local
    });
    if (!decision.intent || decision.intent.kind === 'invalid' || decision.intent.kind === 'tab') return preview;
    return offer(decision.intent, preview, decision.acquisition ? { ...decision.acquisition, point } : undefined);
  }

  const recipient = detached.groups.find(item => item.group.panels.includes('editor'))!.rect;
  const notes = detached.groups.find(item => item.group.panels.includes('notes'))!.rect;
  const point = (offset: number) =>
    transpose
      ? { x: offset < 12 ? (recipient.x + recipient.width + notes.x) / 2 : bounds.x + 80, y: recipient.y + offset }
      : { x: recipient.x + offset, y: bounds.y + 80 };
  const seed = offer({ kind: 'split', destination: { target: 'editor', position: transpose ? 'top' : 'left' } });
  return { seed, step, point };
}

function contains(rect: { x: number; y: number; width: number; height: number }, point: { x: number; y: number }) {
  return point.x >= rect.x && point.x < rect.x + rect.width && point.y >= rect.y && point.y < rect.y + rect.height;
}

describe('workspace placement stability', () => {
  it.each([false, true])(
    'preserves outer and inner lane ownership across successor reservations, transposed %s',
    transpose => {
      const { seed, step, point } = scene({ transpose });
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
    const { seed, step, point } = scene({ width: 256, gap: 0, rootWeights: [45, 19] });
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
