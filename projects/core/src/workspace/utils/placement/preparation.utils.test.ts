// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createFixture, removeFixture } from '@internals/testing';

import { getPanelIds } from '../model/layout.utils.js';
import { planWorkspacePlacement } from './planner.utils.js';
import { evaluatePlacementOffer, getAdmissiblePlacementLayout } from './preparation.utils.js';
import { WorkspacePlacementSession } from './session.utils.js';
import { WorkspaceEvaluation } from '../evaluation.utils.js';

import type { WorkspacePlacementIntent } from '../interaction/command.utils.js';
import type { WorkspaceGroup, WorkspaceLayout } from '../model/layout.utils.js';

import '../../define.js';

const group = (...panels: string[]): WorkspaceGroup => ({ type: 'group', panels, active: panels.at(-1)! });

const layout: WorkspaceLayout = {
  version: 1,
  closed: [],
  root: { type: 'split', axis: 'horizontal', weights: [2, 3], children: [group('a', 'companion'), group('b')] }
};

const measurements = {
  width: 800,
  height: 500,
  gap: 6,
  headerHeight: 30,
  gripWidth: 20,
  actionWidth: 20,
  tabWidth: 60,
  tabMinWidth: 0
};

function createInput(currentLayout = layout, host = document.createElement('div'), minimumHeight = 40) {
  const panels = getPanelIds(currentLayout.root).map(id => {
    const panel = document.createElement('nve-workspace-panel');
    panel.id = id;
    panel.minWidth = 40;
    panel.minHeight = minimumHeight;
    return panel;
  });
  const source = ['a'];
  const evaluation = new WorkspaceEvaluation(host, {
    panels,
    layout: currentLayout,
    source,
    measurements,
    policy: 'stop',
    strip: () => undefined
  });
  return {
    evaluation,
    layout: currentLayout,
    measurements,
    source,
    groupable: true,
    currentRegions: () => evaluation.geometry(evaluation.project(currentLayout)).regions
  };
}

describe('workspace placement admission', () => {
  it.each([
    {
      name: 'extracting a tab',
      source: ['a'],
      intent: { kind: 'split', destination: { target: 'b', position: 'left' } }
    },
    { name: 'joining a tab', source: ['a'], intent: { kind: 'tab', destination: { target: 'b', position: 'tab' } } },
    {
      name: 'joining a whole group',
      source: ['a', 'companion'],
      intent: { kind: 'tab', destination: { target: 'b', position: 'tab' } }
    }
  ] satisfies { name: string; source: string[]; intent: WorkspacePlacementIntent }[])(
    'requires grouping permission for $name',
    ({ source, intent }) => {
      const current = createInput();
      expect(getAdmissiblePlacementLayout({ ...current, source, intent, groupable: false })).toBeUndefined();
      expect(getAdmissiblePlacementLayout({ ...current, source, intent })).toBeDefined();
    }
  );

  it('allows whole-group movement and existing tab membership without grouping permission', () => {
    const current = createInput();
    expect(
      getAdmissiblePlacementLayout({
        ...current,
        groupable: false,
        source: ['a', 'companion'],
        intent: { kind: 'split', destination: { target: 'b', position: 'left' } }
      })
    ).toBeDefined();
    expect(
      getAdmissiblePlacementLayout({
        ...current,
        groupable: false,
        intent: { kind: 'tab', destination: { target: 'companion', position: 'tab', index: 2 } }
      })
    ).toBeDefined();
  });

  it('rejects equivalent supplied candidates and unchanged peer placements', () => {
    expect(
      getAdmissiblePlacementLayout({
        ...createInput(),
        candidate: structuredClone(layout),
        intent: { kind: 'split', destination: { target: 'b', position: 'left' } }
      })
    ).toBeUndefined();
    const peers: WorkspaceLayout = {
      version: 1,
      closed: [],
      root: { type: 'split', axis: 'horizontal', weights: [2, 5, 3], children: [group('a'), group('b'), group('c')] }
    };
    expect(
      getAdmissiblePlacementLayout({
        ...createInput(peers),
        source: ['b'],
        intent: { kind: 'order', destination: { target: 'c', position: 'left', region: 'root.2' } }
      })
    ).toBeUndefined();
  });

  it('rejects candidates that increase minimum overflow', () => {
    expect(
      getAdmissiblePlacementLayout({
        ...createInput(layout, undefined, 300),
        intent: { kind: 'split', destination: { target: 'b', position: 'top' } }
      })
    ).toBeUndefined();
  });

  it('returns a fitting supplied candidate without rewriting either layout', () => {
    const candidate: WorkspaceLayout = { version: 1, closed: [], root: group('a', 'companion', 'b') };
    const original = structuredClone(layout);
    const expected = structuredClone(candidate);
    expect(
      getAdmissiblePlacementLayout({
        ...createInput(),
        candidate,
        intent: { kind: 'tab', destination: { target: 'b', position: 'tab' } }
      })
    ).toBe(candidate);
    expect(layout).toEqual(original);
    expect(candidate).toEqual(expected);
  });
});

describe('workspace placement offers', () => {
  let fixture: HTMLElement;

  afterEach(() => {
    removeFixture(fixture);
    vi.restoreAllMocks();
  });

  async function createPlacementInput(minimumHeight = 40) {
    fixture = await createFixture(html`
      <div id="viewport" style="position:fixed;left:0;top:0;width:800px;height:500px"></div>
    `);
    return createInput(layout, fixture.querySelector<HTMLElement>('#viewport')!, minimumHeight);
  }

  it('leaves unavailable destinations without an offer', async () => {
    const current = await createPlacementInput();
    expect(
      evaluatePlacementOffer({
        ...current,
        intent: { kind: 'split', destination: { target: 'missing', position: 'left' } }
      })
    ).toBeUndefined();
  });

  it('distinguishes a reserved tab destination from a split overlay', async () => {
    const current = await createPlacementInput();
    const tab = evaluatePlacementOffer({
      ...current,
      intent: { kind: 'tab', destination: { target: 'b', position: 'tab' } }
    });
    expect(tab).toMatchObject({ feasible: true, allocation: 'reserved', cue: { kind: 'tab' } });
    const split = evaluatePlacementOffer({
      ...current,
      intent: { kind: 'split', destination: { target: 'b', position: 'left' } }
    });
    expect(split).toMatchObject({ feasible: true, allocation: 'overlay', cue: { kind: 'group' } });
  });

  it('keeps a minimum-infeasible proposal visible without reserving its layout', async () => {
    const current = await createPlacementInput(300);
    const offer = evaluatePlacementOffer({
      ...current,
      intent: { kind: 'split', destination: { target: 'b', position: 'top' } }
    });
    expect(offer).toMatchObject({ feasible: false, allocation: 'overlay', cue: { kind: 'group' } });
    expect(offer!.cue.rect.width).toBeGreaterThan(0);
    expect(offer!.cue.rect.height).toBeGreaterThan(0);
    expect(offer).not.toHaveProperty('layout');
  });

  it('uses an acquired plan without rediscovering a different candidate', async () => {
    const current = await createPlacementInput();
    const intent: WorkspacePlacementIntent = { kind: 'tab', destination: { target: 'b', position: 'tab' } };
    const plan = planWorkspacePlacement({
      layout,
      source: current.source,
      available: current.evaluation.available,
      operation: 'tab',
      destination: intent.destination
    })!;
    const offer = evaluatePlacementOffer({
      ...current,
      intent,
      planner: () => {
        throw new Error('Acquired plans must not be rediscovered');
      },
      context: { acquisition: { plan, rect: { x: 400, y: 0, width: 80, height: 30 }, point: { x: 440, y: 15 } } }
    });
    expect(offer).toMatchObject({ feasible: true, allocation: 'reserved', layout: plan.layout, cue: { kind: 'tab' } });
  });
  it('reinvokes supplied planners and returns independent offer presentation', async () => {
    const current = await createPlacementInput();
    const planner = vi.fn(planWorkspacePlacement);
    const input = {
      ...current,
      planner,
      placementSession: new WorkspacePlacementSession(),
      intent: { kind: 'split' as const, destination: { target: 'b', position: 'left' as const } }
    };
    const first = evaluatePlacementOffer(input)!;
    const expected = structuredClone(first);
    first.cue.rect.x = -1234;
    const next = evaluatePlacementOffer(input);
    expect(planner).toHaveBeenCalledTimes(2);
    expect(next).not.toBe(first);
    expect(next).toEqual(expected);
  });

  it('reuses stable split preparation and rebuilds it for a different destination', async () => {
    const current = await createPlacementInput();
    const placementSession = new WorkspacePlacementSession();
    const input = {
      ...current,
      placementSession,
      intent: { kind: 'split' as const, destination: { target: 'b', position: 'left' as const } }
    };
    const first = evaluatePlacementOffer(input);
    expect(first).toBeDefined();
    expect(evaluatePlacementOffer(input)).toBe(first);

    const changed = {
      ...input,
      intent: { kind: 'split' as const, destination: { target: 'b', position: 'right' as const } }
    };
    const next = evaluatePlacementOffer(changed);
    expect(next).toBeDefined();
    expect(next).not.toBe(first);
    expect(next!.cue.rect.x).not.toBe(first!.cue.rect.x);
    expect(evaluatePlacementOffer(changed)).toBe(next);
  });

  it('rechecks feasibility when panel constraints change between evaluations', async () => {
    const current = await createPlacementInput();
    const host = fixture.querySelector<HTMLElement>('#viewport')!;
    const placementSession = new WorkspacePlacementSession();
    const intent: WorkspacePlacementIntent = { kind: 'split', destination: { target: 'b', position: 'top' } };
    const first = evaluatePlacementOffer({ ...current, placementSession, intent });
    expect(first?.feasible).toBe(true);

    const next = evaluatePlacementOffer({ ...createInput(layout, host, 300), placementSession, intent });
    expect(next).not.toBe(first);
    expect(next?.feasible).toBe(false);
  });

  it('refreshes client-space cues when the native viewport moves between evaluations', async () => {
    const current = await createPlacementInput();
    const host = fixture.querySelector<HTMLElement>('#viewport')!;
    const canvas = document.createElement('div');
    canvas.className = 'canvas';
    canvas.style.cssText = 'width:800px;height:500px';
    host.attachShadow({ mode: 'open' }).append(canvas);
    const placementSession = new WorkspacePlacementSession();
    const intent: WorkspacePlacementIntent = { kind: 'split', destination: { target: 'b', position: 'left' } };
    const first = evaluatePlacementOffer({ ...current, placementSession, intent });
    expect(first).toBeDefined();

    host.style.left = '40px';
    const next = evaluatePlacementOffer({ ...createInput(layout, host), placementSession, intent });
    expect(next).toBeDefined();
    expect(next).not.toBe(first);
    expect(next!.cue.rect.x).toBeCloseTo(first!.cue.rect.x + 40);
  });
});
