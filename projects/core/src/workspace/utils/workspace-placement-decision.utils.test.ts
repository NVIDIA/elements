// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { decidePlacement } from './workspace-placement-decision.utils.js';
import { allocateWorkspace, type WorkspaceRect } from './workspace-placement.utils.js';
import { detachedLayout } from './workspace-operations.utils.js';
import { computedRegionCatalog } from './workspace-targeting.utils.js';
import type { WorkspaceLayout } from './workspace-layout.utils.js';
import { planWorkspacePlacement } from './workspace-planner.utils.js';
import type { WorkspaceDragPreview } from './workspace-drag-preview.utils.js';

const makeGroup = (id: string) => ({ type: 'group' as const, panels: [id], active: id });
const saved: WorkspaceLayout = {
  version: 1,
  closed: [],
  root: {
    type: 'split',
    axis: 'horizontal',
    weights: [1, 1, 1],
    children: [makeGroup('a'), makeGroup('b'), makeGroup('c')]
  }
};

const bounds = { x: 0, y: 0, width: 900, height: 300 };

const available = ['a', 'b', 'c'];
const allocate = (layout: WorkspaceLayout) =>
  allocateWorkspace({
    gap: 6,
    root: layout.root,
    rect: bounds,
    minimum: () => ({ width: 0, height: 0 }),
    policy: 'stop'
  });

function input(source: string, reserved: boolean) {
  const catalog = allocate(saved);
  const detached = allocate(detachedLayout(saved, [source]));
  const regions = computedRegionCatalog({
    saved,
    catalog: catalog.regions,
    allocation: detached.regions,
    source: [source],
    available,
    bounds
  });
  const orderingRegions = computedRegionCatalog({
    saved,
    catalog: catalog.regions,
    allocation: reserved ? catalog.regions : detached.regions,
    source: [source],
    available,
    bounds
  });
  const sourceSlot = reserved ? catalog.groups.find(group => group.group.panels.includes(source))!.rect : undefined;
  const preview: WorkspaceDragPreview = reserved
    ? {
        source: [source],
        phase: 'detached',
        blocked: false,
        allocation: 'reserved',
        layout: saved,
        intent: {
          kind: 'order',
          destination: { target: source === 'c' ? 'b' : 'c', position: source === 'c' ? 'right' : 'left' }
        },
        cue: { kind: 'group', rect: sourceSlot! }
      }
    : {
        source: [source],
        phase: 'detached',
        blocked: false,
        allocation: 'overlay',
        intent: { kind: 'split', destination: { target: 'a', position: 'bottom' } },
        cue: { kind: 'group', rect: bounds }
      };
  return {
    gap: 6,
    source: [source],
    saved,
    available,
    regions,
    orderingRegions,
    sourceSlot,
    preview,
    bounds,

    header: false,
    point: { x: 0, y: 150 },
    local: preview.intent
  };
}

describe('workspace unified placement decisions', () => {
  it('uses canonical group membership for ORDER eligibility while geometry omits closed members', () => {
    const scene = input('a', false);
    const grouped: WorkspaceLayout = {
      ...saved,
      closed: ['dormant'],
      root: {
        type: 'split',
        axis: 'horizontal',
        weights: [1, 1, 1],
        children: [{ type: 'group', panels: ['dormant', 'a'], active: 'a' }, makeGroup('b'), makeGroup('c')]
      }
    };
    const base = { ...scene, saved: grouped, available: [...available, 'dormant'], point: { x: 3, y: 150 } };
    expect(decidePlacement({ ...base, gap: 6, source: ['dormant', 'a'] }).intent?.kind).toBe('order');
    expect(decidePlacement({ ...base, gap: 6, source: ['a'] }).intent?.kind).toBe('insert');
  });

  it('uses the actual original C reservation at its shared seam and ignores an underlying prospective header', () => {
    const scene = input('c', true);
    const decision = decidePlacement({ ...scene, point: { x: 601, y: 150 } });
    expect(decision.intent?.kind).toBe('order');
    expect(decision.hint).toBeUndefined();
    const owned = decidePlacement({
      ...scene,
      point: { x: 750, y: 20 },
      local: { kind: 'tab', destination: { target: 'b', position: 'tab' } },
      header: true
    });
    expect(owned.intent).toEqual(scene.preview.intent);
  });

  it('uses resized exploration gaps instead of original seams after a split is selected', () => {
    const scene = input('b', false);
    const phantom = decidePlacement({ ...scene, point: { x: 299, y: 150 } });
    expect(phantom.intent?.kind).toBe('split');
    expect(phantom.hint).toBeUndefined();
    const approach = decidePlacement({ ...scene, point: { x: 432, y: 150 } });
    expect(approach.hint?.rect).toEqual({ x: 444, y: 0, width: 12, height: 300 });
    expect(decidePlacement({ ...scene, point: { x: 450, y: 150 } }).intent?.kind).toBe('order');
  });

  it('keeps the selected visible source slot stable, then allows prospective split exit', () => {
    const scene = input('b', true);
    expect(
      decidePlacement({
        ...scene,
        point: { x: 450, y: 150 },
        local: { kind: 'split', destination: { target: 'a', position: 'right' } }
      }).intent
    ).toEqual(scene.preview.intent);
    expect(
      decidePlacement({
        ...scene,
        point: { x: 750, y: 150 },
        local: { kind: 'split', destination: { target: 'c', position: 'left' } }
      }).intent?.kind
    ).toBe('split');
  });
});

describe('workspace reserved group hints', () => {
  function scene() {
    const base = input('b', false);
    const layout: WorkspaceLayout = {
      ...saved,
      root: {
        type: 'split',
        axis: 'horizontal',
        weights: [1, 1, 1],
        children: [makeGroup('b'), makeGroup('a'), makeGroup('c')]
      }
    };
    const preview: WorkspaceDragPreview = {
      phase: 'detached',
      source: ['b'],
      blocked: false,
      allocation: 'reserved',
      layout,
      intent: { kind: 'order', destination: { target: 'a', position: 'left' } },
      cue: { kind: 'group', rect: { x: 430, y: 0, width: 40, height: 300 } }
    };
    return { ...base, preview, sourceSlot: preview.cue.rect, point: { x: 432, y: 150 } };
  }

  it.each([false, true])(
    'hints an eligible enclosing edge from a computed hero reservation, transposed %s',
    transpose => {
      const mainAxis = transpose ? 'vertical' : 'horizontal';
      const crossAxis = transpose ? 'horizontal' : 'vertical';
      const layout: WorkspaceLayout = {
        version: 1,
        closed: [],
        root: {
          type: 'split',
          axis: mainAxis,
          weights: [1, 4],
          children: [
            makeGroup('outline'),
            {
              type: 'split',
              axis: crossAxis,
              weights: [3, 2],
              children: [
                {
                  type: 'split',
                  axis: mainAxis,
                  weights: [3, 2],
                  children: [makeGroup('editor'), makeGroup('preview')]
                },
                { type: 'group', panels: ['notes', 'activity', 'tasks'], active: 'notes' }
              ]
            }
          ]
        }
      };
      const frame = transpose ? { x: 0, y: 0, width: 930, height: 860 } : { x: 0, y: 0, width: 860, height: 930 };
      const source = ['preview'];
      const visible = ['outline', 'editor', 'preview', 'notes', 'activity', 'tasks'];
      const destination = {
        target: 'editor',
        region: 'root.1',
        position: transpose ? ('top' as const) : ('left' as const)
      };
      const plan = planWorkspacePlacement({ layout, source, destination, operation: 'insert', available: visible })!;
      const allocation = (value: WorkspaceLayout) =>
        allocateWorkspace({
          gap: 6,
          root: value.root,
          rect: frame,
          minimum: () => ({ width: 0, height: 0 }),
          policy: 'stop'
        });
      const canonical = allocation(layout);
      const reserved = allocation(plan.layout);
      const catalog = (value: WorkspaceLayout) =>
        computedRegionCatalog({
          saved: layout,
          catalog: canonical.regions,
          allocation: allocation(value).regions,
          source,
          available: visible,
          bounds: frame
        });
      const sourceSlot = reserved.groups.find(item => item.group.panels.includes('preview'))!.rect;
      const preview: WorkspaceDragPreview = {
        phase: 'detached',
        source,
        blocked: false,
        allocation: 'reserved',
        layout: plan.layout,
        intent: { kind: 'insert', destination },
        cue: { kind: 'group', rect: sourceSlot }
      };
      const base = {
        gap: 6,
        saved: layout,
        source,
        available: visible,
        bounds: frame,
        regions: catalog(detachedLayout(layout, source)),
        orderingRegions: catalog(plan.layout),
        sourceSlot,
        local: preview.intent,
        header: false,
        point: transpose ? { x: 20, y: 190 } : { x: 190, y: 20 }
      };
      const unreserved = decidePlacement(base);
      const result = decidePlacement({ ...base, preview });
      expect(unreserved.hint?.owner).toBe('root.1.0');
      expect(result.hint?.owner).toBe('root.1');
      expect(result.hint!.destination.position).toBe(transpose ? 'left' : 'top');
      expect(Math.min(result.hint!.rect.width, result.hint!.rect.height)).toBe(12);
      expect(result.acquisition).toEqual(unreserved.acquisition);
      expect(result.intent).toEqual(unreserved.intent);
    }
  );

  it('hides a fully interior painted cue without changing its acquired placement', () => {
    const base = scene();
    const near = decidePlacement(base);
    expect(near.hint).toBeUndefined();
    expect(near.intent).toEqual(base.preview.intent);
    const hit = decidePlacement({ ...base, point: { x: 450, y: 150 } });
    const unreserved = decidePlacement({ ...input('b', false), point: { x: 450, y: 150 } });
    expect(hit.acquisition).toEqual(unreserved.acquisition);
    expect(hit.intent).toEqual(unreserved.intent);
    expect(hit.hint).toBeUndefined();
  });

  it.each([
    { name: 'normal leading edge', slot: { x: 444, y: 0, width: 30, height: 300 } },
    { name: 'normal trailing edge', slot: { x: 430, y: 0, width: 26, height: 300 } },
    { name: 'crossing cue', slot: { x: 448, y: 0, width: 30, height: 300 } },
    { name: 'partially overlapping cue', slot: { x: 430, y: 0, width: 20, height: 300 } },
    { name: 'tangential overflow', slot: { x: 430, y: 5, width: 40, height: 290 } }
  ])('retains a cue at the $name of occupied space', ({ slot }) => {
    const result = decidePlacement({ ...scene(), sourceSlot: slot });
    expect(result.hint?.rect).toMatchObject({ y: 0, width: 12, height: 300 });
  });

  it('uses exact fractional interior containment without a tolerance', () => {
    expect(
      decidePlacement({ ...scene(), sourceSlot: { x: 443.875, y: 0, width: 12.25, height: 300 } }).hint
    ).toBeUndefined();
    expect(
      decidePlacement({ ...scene(), sourceSlot: { x: 444, y: 0, width: 12.125, height: 300 } }).hint
    ).toBeDefined();
  });

  it('compares clipped paint and occupancy in the same scrolled client coordinate space', () => {
    const base = scene();
    const shift = (rect: WorkspaceRect): WorkspaceRect => ({ ...rect, x: rect.x + 101.25, y: rect.y - 77.5 });
    const result = decidePlacement({
      ...base,
      bounds: { x: 101.25, y: 27.5, width: 900, height: 200 },
      point: { x: base.point.x + 101.25, y: base.point.y - 77.5 },
      sourceSlot: shift(base.sourceSlot),
      regions: base.regions.map(region => ({ ...region, rect: shift(region.rect) })),
      orderingRegions: base.orderingRegions.map(region => ({ ...region, rect: shift(region.rect) }))
    });
    expect(result.hint).toBeUndefined();
    expect(result.intent).toEqual(base.preview.intent);
  });

  it('retains hints for split overlays, joined tab reservations, and blocked previews', () => {
    const base = scene();
    const overlay: WorkspaceDragPreview = {
      ...base.preview,
      allocation: 'overlay',
      intent: { kind: 'split', destination: { target: 'a', position: 'bottom' } }
    };
    const joined: WorkspaceDragPreview = {
      ...base.preview,
      cue: { kind: 'tab', rect: base.sourceSlot },
      intent: { kind: 'tab', destination: { target: 'a', position: 'tab' } }
    };
    expect(decidePlacement({ ...base, preview: overlay }).hint).toBeDefined();
    expect(decidePlacement({ ...base, preview: joined }).hint).toBeDefined();
    expect(decidePlacement({ ...base, preview: { ...base.preview, blocked: true } }).hint).toBeDefined();
  });
});

describe('workspace identified scoped offers', () => {
  it.each([
    { source: 'b', side: 'top' as const, target: 'c', y: 12 },
    { source: 'd', side: 'bottom' as const, target: 'c', y: 468 }
  ])('hints the workspace $side edge while retaining the selected column endcap', ({ source, side, target, y }) => {
    const layout: WorkspaceLayout = {
      version: 1,
      closed: [],
      root: {
        type: 'split',
        axis: 'horizontal',
        weights: [2, 3],
        children: [
          makeGroup('a'),
          {
            type: 'split',
            axis: 'vertical',
            weights: [2, 3, 5],
            children: [makeGroup('b'), makeGroup('c'), makeGroup('d')]
          }
        ]
      }
    };
    const frame = { x: 0, y: 0, width: 900, height: 480 };
    const visible = ['a', 'b', 'c', 'd'];
    const allocation = (value: WorkspaceLayout) =>
      allocateWorkspace({
        gap: 6,
        root: value.root,
        rect: frame,
        minimum: () => ({ width: 0, height: 0 }),
        policy: 'stop'
      });
    const canonical = allocation(layout);
    const catalog = (value: WorkspaceLayout) =>
      computedRegionCatalog({
        saved: layout,
        catalog: canonical.regions,
        allocation: allocation(value).regions,
        source: [source],
        available: visible,
        bounds: frame
      });
    const intent = { kind: 'order' as const, destination: { target, position: side } };
    const sourceSlot = canonical.groups.find(group => group.group.panels.includes(source))!.rect;
    const preview: WorkspaceDragPreview = {
      phase: 'detached',
      source: [source],
      blocked: false,
      allocation: 'reserved',
      layout,
      intent,
      cue: { kind: 'group', rect: sourceSlot }
    };
    const decision = decidePlacement({
      gap: 6,
      saved: layout,
      source: [source],
      available: visible,
      bounds: frame,
      regions: catalog(detachedLayout(layout, [source])),
      orderingRegions: catalog(layout),
      sourceSlot,
      preview,
      local: intent,
      header: side === 'top',
      point: { x: 700, y }
    });
    expect(decision.intent?.kind).toBe('order');
    expect(decision.hint?.owner).toBe('root');
    expect(decision.hint?.destination.position).toBe(side);
    expect(decision.hint?.rect).toEqual({ x: 0, y: side === 'top' ? 0 : 474, width: 900, height: 6 });
  });

  describe.each([false, true])('nested scope decisions, transposed %s', transpose => {
    function scene() {
      const layout: WorkspaceLayout = {
        version: 1,
        closed: [],
        root: {
          type: 'split',
          axis: transpose ? 'vertical' : 'horizontal',
          weights: [1, 1],
          children: [
            { type: 'group', panels: ['a', 'companion'], active: 'a' },
            {
              type: 'split',
              axis: transpose ? 'horizontal' : 'vertical',
              weights: [1, 4],
              children: [makeGroup('b'), makeGroup('c')]
            }
          ]
        }
      };
      const visible = ['a', 'companion', 'b', 'c'];
      const frame = { x: 0, y: 0, width: 900, height: 360 };
      const allocation = (candidate: WorkspaceLayout) =>
        allocateWorkspace({
          gap: 6,
          root: candidate.root,
          rect: frame,
          minimum: () => ({ width: 0, height: 0 }),
          policy: 'stop'
        });
      const canonical = allocation(layout);
      const detached = allocation(detachedLayout(layout, ['b']));
      const regions = computedRegionCatalog({
        saved: layout,
        catalog: canonical.regions,
        allocation: detached.regions,
        source: ['b'],
        available: visible,
        bounds: frame
      });
      const base = {
        saved: layout,
        available: visible,
        source: ['b'],
        regions,
        orderingRegions: regions,
        bounds: frame,
        header: false,

        local: {
          kind: 'split' as const,
          destination: { target: 'c', position: transpose ? ('right' as const) : ('bottom' as const) }
        }
      };
      const localPoint = transpose ? { x: 886, y: 270 } : { x: 690, y: 346 };
      const outerPoint = transpose ? { x: 894, y: 270 } : { x: 690, y: 354 };
      return { allocation, canonical, base, frame, localPoint, outerPoint };
    }

    function reservedPreview(
      placement: ReturnType<typeof decidePlacement>,
      frame: typeof bounds
    ): WorkspaceDragPreview {
      const preview: WorkspaceDragPreview = {
        phase: 'detached',
        source: ['b'],
        blocked: false,
        allocation: 'reserved',
        layout: placement.hint!.plan.layout,
        intent: placement.intent!,
        cue: { kind: 'group', rect: frame }
      };
      return preview;
    }

    it('distinguishes local ordering from whole-arrangement insertion', () => {
      const { base, localPoint, outerPoint, frame } = scene();
      const local = decidePlacement({ ...base, gap: 6, point: localPoint });
      const outer = decidePlacement({ ...base, gap: 6, point: outerPoint });
      expect(local.intent?.kind).toBe('order');
      expect(outer.intent?.kind).toBe('insert');
      expect(local.hint!.scope.key).not.toBe(outer.hint!.scope.key);
      expect(local.hint!.plan.kind).toBe('reorder');
      expect(outer.hint!.plan.kind).toBe('insert');
      expect(local.hint!.scope.members).toEqual(['c']);
      expect(outer.hint!.scope.members).toEqual(['a', 'companion', 'c']);
      expect(local.hint!.scope.index).toBe(1);
      expect(outer.hint!.scope.index).toBe(1);
      const tangent = transpose ? 'height' : 'width';
      expect(outer.hint!.rect[tangent]).toBe(frame[tangent]);
      expect(local.hint!.rect[tangent]).toBeLessThan(frame[tangent]);
    });

    it('keeps the local scope reachable after either scope reserves space', () => {
      const { allocation, canonical, base, frame, localPoint, outerPoint } = scene();
      const local = decidePlacement({ ...base, gap: 6, point: localPoint });
      const outer = decidePlacement({ ...base, gap: 6, point: outerPoint });
      [outer.hint!, local.hint!].forEach(offer => {
        const reserved = allocation(offer.plan.layout);
        const orderingRegions = computedRegionCatalog({
          saved: base.saved,
          catalog: canonical.regions,
          allocation: reserved.regions,
          source: ['b'],
          available: base.available,
          bounds: frame
        });
        const sourceSlot = reserved.groups.find(group => group.group.panels.includes('b'))!.rect;
        for (const offset of [-1, 0, 1]) {
          const point = transpose
            ? { ...localPoint, x: localPoint.x + offset }
            : { ...localPoint, y: localPoint.y + offset };
          const acquired = decidePlacement({ ...base, gap: 6, orderingRegions, sourceSlot, point });
          expect(acquired.intent).toEqual(local.intent);
          expect(acquired.hint?.scope.key).toBe(local.hint!.scope.key);
        }
      });
    });

    it('lets the outer edge override the current local reservation', () => {
      const { base, frame, localPoint, outerPoint } = scene();
      const local = decidePlacement({ ...base, gap: 6, point: localPoint });
      const outer = decidePlacement({ ...base, gap: 6, point: outerPoint });
      const preview = reservedPreview(local, frame);
      const override = decidePlacement({ ...base, gap: 6, preview, sourceSlot: frame, point: outerPoint });
      expect(override.intent?.kind).toBe('insert');
      expect(override.hint!.scope.key).toBe(outer.hint!.scope.key);
    });

    it('suppresses the hint for an already selected outer insertion', () => {
      const { base, frame, localPoint, outerPoint } = scene();
      const local = decidePlacement({ ...base, gap: 6, point: localPoint });
      const outer = decidePlacement({ ...base, gap: 6, point: outerPoint });
      const preview = reservedPreview(local, frame);
      const selected = decidePlacement({
        gap: 6,
        ...base,
        preview: { ...preview, layout: outer.hint!.plan.layout, intent: outer.intent! },
        sourceSlot: frame,
        point: outerPoint
      });
      expect(selected.hint).toBeUndefined();
    });

    it('suppresses the hint for a blocked outer insertion', () => {
      const { base, frame, outerPoint } = scene();
      const outer = decidePlacement({ ...base, gap: 6, point: outerPoint });
      const blocked: WorkspaceDragPreview = {
        phase: 'detached',
        source: ['b'],
        blocked: true,
        allocation: 'overlay',
        intent: outer.intent!,
        cue: { kind: 'group', rect: frame }
      };
      expect(decidePlacement({ ...base, gap: 6, preview: blocked, point: outerPoint }).hint).toBeUndefined();
    });
  });

  it('does not acquire a group insertion from outside an identified painted target', () => {
    const scene = input('b', false);
    const result = decidePlacement({
      ...scene,

      point: { x: 200, y: 150 },
      local: { kind: 'split', destination: { target: 'a', position: 'bottom' } }
    });
    expect(result.intent?.kind).toBe('split');
    expect(result.hint).toBeUndefined();
  });
});
