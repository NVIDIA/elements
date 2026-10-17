// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';
import { initialReservation } from './workspace-origin.utils.js';
import type { WorkspaceLayout } from './workspace-layout.utils.js';

const pane = (...panels: string[]) => ({ type: 'pane' as const, panels, active: panels.at(-1)! });
const layout: WorkspaceLayout = {
  version: 1,
  closed: [],
  root: { type: 'split', axis: 'horizontal', weights: [1, 1, 1], children: [pane('a'), pane('b'), pane('c')] }
};

const cue = { kind: 'pane' as const, rect: { x: 604, y: 0, width: 296, height: 300 } };

describe('workspace genuine origin reservations', () => {
  it('uses the unchanged trailing peer ORDER rather than an overlapping invalid pane indicator', () => {
    const evaluate = vi.fn(() => ({ cue, feasible: true, allocation: 'reserved' as const, layout }));
    const result = initialReservation({ layout, source: ['c'], available: ['a', 'b', 'c'], cue, evaluate });
    expect(result.intent).toEqual({ kind: 'order', destination: { target: 'b', position: 'right' } });
    expect(result.offer.layout).toBe(layout);
    expect(evaluate).toHaveBeenCalledOnce();
  });

  it('reserves only the original tab when an active source leaves an open companion', () => {
    const saved: WorkspaceLayout = { version: 1, closed: [], root: pane('a', 'companion') };
    const tab = { ...cue, kind: 'tab' as const };
    const evaluate = vi.fn(() => ({ cue: tab, feasible: true, allocation: 'reserved' as const, layout: saved }));
    const result = initialReservation({
      layout: saved,
      source: ['companion'],
      available: ['a', 'companion'],
      cue: tab,
      evaluate
    });
    expect(result.intent).toEqual({ kind: 'tab', destination: { target: 'a', position: 'tab', index: 1 } });
    expect(result.offer.cue.kind).toBe('tab');
    expect(saved.root?.type === 'pane' && saved.root.active).toBe('companion');
  });

  it('retains a sole pane without inventing a cross-panel destination', () => {
    const saved: WorkspaceLayout = { version: 1, closed: [], root: pane('a') };
    const evaluate = vi.fn();
    const result = initialReservation({ layout: saved, source: ['a'], available: ['a'], cue, evaluate });
    expect(result.intent.kind).toBe('invalid');
    expect(result.offer.allocation).toBe('reserved');
    expect(result.offer.layout).toBe(saved);
    expect(evaluate).not.toHaveBeenCalled();
  });

  it('keeps dormant canonical members when the visible containing group is carried whole', () => {
    const saved: WorkspaceLayout = {
      version: 1,
      closed: ['dormant'],
      root: { type: 'split', axis: 'horizontal', weights: [2, 3], children: [pane('dormant', 'a'), pane('b')] }
    };
    const result = initialReservation({
      layout: saved,
      source: ['dormant', 'a'],
      available: ['a', 'b', 'dormant'],
      cue,
      evaluate: () => undefined
    });
    expect(result.intent.kind).toBe('order');
    expect(result.offer.layout).toBe(saved);
    const partial = initialReservation({
      layout: saved,
      source: ['a'],
      available: ['a', 'b', 'dormant'],
      cue,
      evaluate: () => undefined
    });
    expect(partial.intent.kind).toBe('invalid');
    expect(partial.offer.cue).toBe(cue);
    expect(partial.offer.allocation).toBe('reserved');
    expect(partial.offer.layout).toBe(saved);
  });
});
