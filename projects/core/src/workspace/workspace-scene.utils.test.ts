// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import type { WorkspaceLayout } from './workspace-layout.utils.js';
import { WorkspaceScene } from './workspace-scene.utils.js';
import './define.js';

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

const chrome = { gap: 6, width: 300, height: 100, headerHeight: 30, gripWidth: 20, tabWidth: 60, actionWidth: 20 };

function panels() {
  return ['a', 'b'].map(id => {
    const panel = document.createElement('nve-workspace-panel');
    panel.id = id;
    return panel;
  });
}

describe('workspace evaluation scenes', () => {
  it('keeps the retained source extent separate from a candidate’s own minimum extent', () => {
    const supplied = panels();
    supplied[0]!.minHeight = 200;
    supplied[1]!.minHeight = 100;
    const scene = new WorkspaceScene(document.createElement('div'), {
      panels: supplied,
      layout,
      source: ['a'],
      chrome,
      policy: 'stop',
      strip: () => undefined
    });
    const candidate: WorkspaceLayout = { ...layout, root: { type: 'group', panels: ['b'], active: 'b' } };
    const reserved = scene.geometry(candidate, scene.project(layout));
    const independent = scene.geometry(candidate);
    expect(reserved.height).toBe(306);
    expect(independent.height).toBe(100);
    expect(scene.detached(['a']).height).toBe(306);
    expect(independent.groups[0]!.panels).toEqual([supplied[1]]);
  });

  it.each([0, 12])('uses a %ipx gap for allocated regions and boundary geometry', gap => {
    const scene = new WorkspaceScene(document.createElement('div'), {
      panels: panels(),
      layout,
      source: [],
      chrome: { ...chrome, gap, height: 300 },
      policy: 'stop',
      strip: () => undefined
    });
    const geometry = scene.geometry(layout);
    const [first, second] = geometry.groups;
    expect(first!.rect.height).toBe((300 - gap) / 2);
    expect(second!.rect.y - first!.rect.y - first!.rect.height).toBe(gap);
    expect(geometry.boundaries[0]!.rect.height).toBe(gap);
  });

  it('reads changed constraints and supplied panels in the next evaluation', () => {
    const supplied = panels();
    const host = document.createElement('div');
    const initial = new WorkspaceScene(host, {
      panels: supplied,
      layout,
      source: [],
      chrome,
      policy: 'stop',
      strip: () => undefined
    });
    const before = initial.geometry(initial.project(layout));
    supplied[0]!.minWidth = 500;
    const next = new WorkspaceScene(host, {
      panels: [supplied[0]!],
      layout,
      source: [],
      chrome,
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
