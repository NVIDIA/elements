// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import {
  admitsWorkspaceMove,
  getMinimumWorkspaceDimensions,
  getWorkspaceRequirements,
  sameWorkspaceRequirements,
  snapshotWorkspaceRequirements
} from './sizing.utils.js';
import { placePanels } from '../model/operations.utils.js';

import type { WorkspaceRequirements } from './sizing.utils.js';
import type { WorkspaceGroup, WorkspaceLayout, WorkspaceNode } from '../model/layout.utils.js';

const group = (...panels: string[]): WorkspaceGroup => ({ type: 'group', panels, active: panels[0] ?? '' });
const row = (axis: 'horizontal' | 'vertical', ...children: WorkspaceNode[]): WorkspaceNode => ({
  type: 'split',
  axis,
  children,
  weights: children.map(() => 1)
});
const requirements: WorkspaceRequirements = {
  gap: 6,
  chrome: { width: 80, height: 36 },
  panels: new Map(['a', 'b', 'c', 'd'].map(id => [id, { width: 100, height: 110 }]))
};

describe('workspace requirement values', () => {
  it('compares requirement values independently of map insertion order', () => {
    const reversed = { ...requirements, panels: new Map([...requirements.panels].reverse()) };
    expect(sameWorkspaceRequirements(requirements, reversed)).toBe(true);
    expect(sameWorkspaceRequirements(requirements, { ...reversed, gap: 12 })).toBe(false);
    const changedPanel = new Map(reversed.panels);
    changedPanel.set('a', { width: 200, height: 110 });
    expect(sameWorkspaceRequirements(requirements, { ...reversed, panels: changedPanel })).toBe(false);
  });

  it('captures requirement dimensions independently of later changes', () => {
    const panels = new Map([['a', { width: 100, height: 110 }]]);
    const current = { gap: 6, chrome: { width: 80, height: 36 }, panels };
    const snapshot = snapshotWorkspaceRequirements(current);
    expect(sameWorkspaceRequirements(snapshot, current)).toBe(true);
    panels.get('a')!.width = 200;
    current.chrome.height = 50;
    expect(snapshot.panels.get('a')!.width).toBe(100);
    expect(snapshot.chrome.height).toBe(36);
    expect(sameWorkspaceRequirements(snapshot, current)).toBe(false);
  });
});

describe('workspace size admission', () => {
  it('reserves one measured group action alongside the title and application suffix', () => {
    const measured = getWorkspaceRequirements({
      measurements: {
        gap: 6,
        gripWidth: 28,
        tabWidth: 90,
        groupActionWidth: 36,
        headerHeight: 40,
        panels: { a: { suffixWidth: 50, footerHeight: 0 } }
      },
      panels: [{ id: 'a', minWidth: 0, minHeight: 0 }]
    });
    expect(getMinimumWorkspaceDimensions(group('a'), measured)).toEqual({ width: 204, height: 40 });
    expect(getMinimumWorkspaceDimensions(group('unknown'), measured)).toEqual({ width: 154, height: 40 });
  });

  it('reserves one operable header rather than multiplying the tab roster', () => {
    expect(getMinimumWorkspaceDimensions(group('a', 'b', 'c', 'd'), requirements)).toEqual({ width: 100, height: 110 });
    expect(getMinimumWorkspaceDimensions(group('unknown'), requirements)).toEqual(requirements.chrome);
  });

  it.each([0, 6, 12])('combines matching-axis minimum sizes with a %ipx gap', gap => {
    const root = row('horizontal', group('a'), row('vertical', group('b'), group('c')));
    expect(getMinimumWorkspaceDimensions(root, { ...requirements, gap })).toEqual({
      width: 200 + gap,
      height: 220 + gap
    });
  });

  it('permits repeated partial repair against the complete committed layout', () => {
    let current: WorkspaceLayout = {
      version: 1 as const,
      root: row('vertical', group('a'), group('b'), group('c'), group('d')),
      closed: []
    };
    for (const id of ['a', 'b', 'c']) {
      const candidate = placePanels({ layout: current, source: [id], destination: { target: 'd', position: 'tab' } });
      if (!candidate) throw new Error('Expected repair candidate');
      expect(
        admitsWorkspaceMove({
          current: current.root,
          candidate: candidate.root,
          viewport: { width: 640, height: 220 },
          requirements
        })
      ).toBe(true);
      current = candidate;
    }
    expect(getMinimumWorkspaceDimensions(current.root, requirements).height).toBe(110);
  });

  it('permits equal-footprint reorder during overflow without trading excess between axes', () => {
    const current = row('vertical', group('a', 'b'), group('c'), group('d'));
    expect(
      admitsWorkspaceMove({
        current,
        candidate: row('vertical', group('b', 'a'), group('c'), group('d')),
        viewport: { width: 90, height: 220 },
        requirements
      })
    ).toBe(true);
    expect(
      admitsWorkspaceMove({
        current,
        candidate: row('horizontal', group('a'), group('b'), group('c'), group('d')),
        viewport: { width: 90, height: 220 },
        requirements
      })
    ).toBe(false);
  });

  it('rejects new overflow from a bounded layout and preserves both input trees', () => {
    const current = group('a', 'b');
    const candidate = row('vertical', group('a'), group('b'));
    const saved = JSON.stringify({ current, candidate });
    expect(admitsWorkspaceMove({ current, candidate, viewport: { width: 640, height: 220 }, requirements })).toBe(
      false
    );
    expect(JSON.stringify({ current, candidate })).toBe(saved);
  });
});
