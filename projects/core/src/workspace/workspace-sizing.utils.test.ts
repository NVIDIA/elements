// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { admitsWorkspaceMove, minimumWorkspace, type WorkspaceRequirements } from './workspace-sizing.utils.js';
import type { WorkspaceLayout, WorkspaceNode, WorkspacePane } from './workspace-layout.utils.js';
import { placePanels } from './workspace-operations.utils.js';

const pane = (...panels: string[]): WorkspacePane => ({ type: 'pane', panels, active: panels[0] ?? '' });
const row = (axis: 'horizontal' | 'vertical', ...children: WorkspaceNode[]): WorkspaceNode => ({
  type: 'split',
  axis,
  children,
  weights: children.map(() => 1)
});
const requirements: WorkspaceRequirements = {
  chrome: { width: 80, height: 36 },
  panels: new Map(['a', 'b', 'c', 'd'].map(id => [id, { width: 100, height: 110 }]))
};

describe('workspace size admission', () => {
  it('reserves one operable header rather than multiplying the tab roster', () => {
    expect(minimumWorkspace(pane('a', 'b', 'c', 'd'), requirements)).toEqual({ width: 100, height: 110 });
    expect(minimumWorkspace(pane('unknown'), requirements)).toEqual(requirements.chrome);
  });

  it('combines nested requirements only on the matching split axis', () => {
    expect(minimumWorkspace(row('horizontal', pane('a'), row('vertical', pane('b'), pane('c'))), requirements)).toEqual(
      { width: 206, height: 226 }
    );
  });

  it('permits repeated partial repair against the complete committed layout', () => {
    let current: WorkspaceLayout = {
      version: 1 as const,
      root: row('vertical', pane('a'), pane('b'), pane('c'), pane('d')),
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
    expect(minimumWorkspace(current.root, requirements).height).toBe(110);
  });

  it('permits equal-footprint reorder during overflow without trading excess between axes', () => {
    const current = row('vertical', pane('a', 'b'), pane('c'), pane('d'));
    expect(
      admitsWorkspaceMove({
        current,
        candidate: row('vertical', pane('b', 'a'), pane('c'), pane('d')),
        viewport: { width: 90, height: 220 },
        requirements
      })
    ).toBe(true);
    expect(
      admitsWorkspaceMove({
        current,
        candidate: row('horizontal', pane('a'), pane('b'), pane('c'), pane('d')),
        viewport: { width: 90, height: 220 },
        requirements
      })
    ).toBe(false);
  });

  it('rejects new overflow from a bounded layout and preserves both input trees', () => {
    const current = pane('a', 'b');
    const candidate = row('vertical', pane('a'), pane('b'));
    const saved = JSON.stringify({ current, candidate });
    expect(admitsWorkspaceMove({ current, candidate, viewport: { width: 640, height: 220 }, requirements })).toBe(
      false
    );
    expect(JSON.stringify({ current, candidate })).toBe(saved);
  });
});
