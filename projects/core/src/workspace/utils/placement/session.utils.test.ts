// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFixture, removeFixture } from '@internals/testing';
import { WorkspaceEvaluation } from '../evaluation.utils.js';
import { getPanelIds } from '../model/layout.utils.js';
import { projectLayout } from '../model/operations.utils.js';
import { planWorkspacePlacement } from './planner.utils.js';
import { WorkspacePlacementSession } from './session.utils.js';
import type { WorkspaceGroup, WorkspaceLayout } from '../model/layout.utils.js';
import '../../define.js';

function group(...panels: string[]): WorkspaceGroup {
  return { type: 'group', panels, active: panels[0] ?? '' };
}

function planningInput() {
  const layout: WorkspaceLayout = {
    version: 1,
    closed: [],
    root: {
      type: 'split',
      axis: 'horizontal',
      weights: [2, 3, 5],
      children: [group('a'), group('companion'), group('b', 'c')]
    }
  };
  return {
    layout,
    source: ['companion'],
    available: ['a', 'companion', 'b', 'c'],
    operation: 'order' as const,
    destination: { target: 'a', position: 'right' as const }
  };
}

describe('WorkspacePlacementSession planning', () => {
  it('retains equivalent plans within one gesture without sharing plans across sessions', () => {
    const input = planningInput();
    const session = new WorkspacePlacementSession();
    const first = session.plan(input);
    expect(first).toBeDefined();
    expect(session.plan({ ...input, source: [...input.source], available: [...input.available] })).toBe(first);
    expect(new WorkspacePlacementSession().plan(input)).toEqual(first);
    expect(new WorkspacePlacementSession().plan(input)).not.toBe(first);
  });

  it('does not hide repeated calls to a custom projection callback', () => {
    const input = { ...planningInput(), projectLayout: vi.fn(projectLayout) };
    const session = new WorkspacePlacementSession();
    const first = session.plan(input);
    expect(first).toBeDefined();
    const calls = input.projectLayout.mock.calls.length;
    expect(session.plan(input)).toEqual(first);
    expect(input.projectLayout.mock.calls.length).toBeGreaterThan(calls);
  });

  it('reuses owned insertions but invalidates them when available or closed arrays change in place', () => {
    const input = planningInput();
    const session = new WorkspacePlacementSession();
    const plan = session.plan(input);
    if (!plan) throw new Error('Expected placement plan');
    const query = { plan, source: input.source, available: input.available };
    const first = session.getInsertion(query);
    expect(first).toBeDefined();
    expect(session.getInsertion(query)).toBe(first);
    query.available.push('dormant');
    const availableChanged = session.getInsertion(query);
    expect(availableChanged).toBeDefined();
    expect(availableChanged).not.toBe(first);
    expect(session.getInsertion(query)).toBe(availableChanged);
    plan.layout.closed.push('dormant');
    const closedChanged = session.getInsertion(query);
    expect(closedChanged).toBeDefined();
    expect(closedChanged).not.toBe(availableChanged);
    expect(session.getInsertion(query)).toBe(closedChanged);
  });

  it('does not retain mutable insertion results from another session', () => {
    const input = planningInput();
    const plan = new WorkspacePlacementSession().plan(input);
    if (!plan) throw new Error('Expected placement plan');
    const session = new WorkspacePlacementSession();
    const query = { plan, source: input.source, available: input.available };
    const first = session.getInsertion(query);
    if (!first) throw new Error('Expected insertion');
    first.members.push('caller-modified');
    const next = session.getInsertion(query);
    expect(next).not.toBe(first);
    expect(next?.members).not.toContain('caller-modified');
  });
});

describe('WorkspacePlacementSession offers', () => {
  let fixture: HTMLElement;
  let host: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(
      html`<div id="viewport" style="position:absolute;width:800px;height:500px;left:0;top:0"></div>`
    );
    const viewport = fixture.querySelector<HTMLElement>('#viewport');
    if (!viewport) throw new Error('Expected viewport');
    host = viewport;
  });
  afterEach(() => removeFixture(fixture));

  function offerInput() {
    const layout: WorkspaceLayout = {
      version: 1,
      closed: [],
      root: { type: 'split', axis: 'horizontal', weights: [2, 3], children: [group('a', 'companion'), group('b')] }
    };
    const panels = getPanelIds(layout.root).map(id =>
      Object.assign(document.createElement('nve-workspace-panel'), {
        id,
        minWidth: 40,
        minHeight: 40
      })
    );
    const source = ['a'];
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
    const evaluation = new WorkspaceEvaluation(host, {
      panels,
      layout,
      source,
      measurements,
      policy: 'stop',
      strip: () => undefined
    });
    return {
      layout,
      source,
      measurements,
      evaluation,
      groupable: true,
      intent: { kind: 'split' as const, destination: { target: 'b', position: 'left' as const } },
      currentRegions: () => evaluation.geometry(evaluation.project(layout)).regions
    };
  }

  it('reuses stable offers and invalidates a changed measurement identity', () => {
    const session = new WorkspacePlacementSession();
    const input = offerInput();
    const first = session.prepareOffer(input);
    expect(first).toMatchObject({ feasible: true });
    expect(session.prepareOffer(input)).toBe(first);
    const changed = { ...input, measurements: { ...input.measurements } };
    const next = session.prepareOffer(changed);
    expect(next).toEqual(first);
    expect(next).not.toBe(first);
    expect(session.prepareOffer(changed)).toBe(next);
  });

  it('rebuilds an offer when its destination changes', () => {
    const session = new WorkspacePlacementSession();
    const input = offerInput();
    const first = session.prepareOffer(input);
    const changed = {
      ...input,
      intent: { kind: 'split' as const, destination: { target: 'b', position: 'right' as const } }
    };
    const next = session.prepareOffer(changed);
    expect(first).toBeDefined();
    expect(next).toBeDefined();
    expect(next?.cue.rect.x).not.toBe(first?.cue.rect.x);
    expect(session.prepareOffer(changed)).toBe(next);
  });

  it('keeps custom planners observable and clears any previously cached split offer', () => {
    const session = new WorkspacePlacementSession();
    const input = offerInput();
    const first = session.prepareOffer(input);
    expect(first).toBeDefined();
    const planner = vi.fn(planWorkspacePlacement);
    const custom = { ...input, planner };
    expect(session.prepareOffer(custom)).toEqual(first);
    expect(session.prepareOffer(custom)).toEqual(first);
    expect(planner).toHaveBeenCalledTimes(2);
    const rebuilt = session.prepareOffer(input);
    expect(rebuilt).toEqual(first);
    expect(rebuilt).not.toBe(first);
  });
});
