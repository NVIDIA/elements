// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createFixture, removeFixture } from '@internals/testing';
import type { Rect } from '@nvidia-elements/core/internal';

import {
  createPresentedGroups,
  createTabStripIdentityResolver,
  findTabHeaderTarget,
  getAllocatedTabWidth,
  getTabReservationHit,
  preserveRecipientSelection,
  projectTabMembership
} from './groups.utils.js';

import type { WorkspaceGroup, WorkspaceNode } from '../model/layout.utils.js';
import type { WorkspacePresentedGroup } from './groups.utils.js';

import type { WorkspacePanel } from '../../panel/panel.js';

import '../../define.js';

const root: WorkspaceNode = {
  type: 'split',
  axis: 'horizontal',
  weights: [1, 1],
  children: [
    { type: 'group', panels: ['a', 'companion'], active: 'a' },
    { type: 'group', panels: ['b', 'closed', 'b2'], active: 'b2' }
  ]
};

describe('workspace group presentation', () => {
  function present(
    members: string[],
    options: { root?: WorkspaceNode; source?: string[]; closed?: string[]; width?: number; active?: string } = {}
  ) {
    const panels = ['a', 'companion', 'b', 'closed', 'b2'].map(id => {
      const panel = document.createElement('nve-workspace-panel');
      panel.id = id;
      return panel;
    });
    const group: WorkspaceGroup = { type: 'group', panels: members, active: options.active ?? members[0]! };
    return createPresentedGroups({
      groups: [{ key: 'root', group, rect: { x: 0, y: 0, width: 210, height: 180 } }],
      panels,
      root: options.root ?? root,
      closed: options.closed ?? [],
      source: options.source ?? [],
      gripWidth: options.width ?? 28
    });
  }

  it('keeps singleton presentation through proposed tab joins', () => {
    const singleton: WorkspaceNode = { type: 'group', panels: ['b'], active: 'b' };
    for (const groups of [
      present(['b'], { root: singleton }),
      present(['b', 'a'], { root: singleton, source: ['a'] })
    ]) {
      expect(groups[0]?.tabbed).toBe(false);
      expect(groups[0]?.gripWidth).toBe(0);
    }
  });

  it('derives tab semantics and grips from visible committed members', () => {
    const hidden = present(['b'], { closed: ['closed', 'b2'] })[0]!;
    expect(hidden.tabbed).toBe(false);
    expect(hidden.gripWidth).toBe(0);
    const visible = present(['b', 'b2'], { closed: ['closed'] })[0]!;
    expect(visible.tabbed).toBe(true);
    expect(visible.gripWidth).toBe(28);
    const zeroGrip = present(['b', 'b2'], { closed: ['closed'], width: 0 })[0]!;
    expect(zeroGrip.tabbed).toBe(true);
    expect(zeroGrip.gripWidth).toBe(0);
    const carried = present(['companion'], { source: ['a'] })[0]!;
    expect(carried.tabbed).toBe(true);
    expect(carried.gripWidth).toBe(28);
  });

  it('keeps committed strip ownership through carried insertion, extraction and dormant members', () => {
    const identity = createTabStripIdentityResolver(root);
    expect(identity(['b', 'b2', 'a'], ['a'])).toBe(identity(['b', 'b2'], []));
    expect(identity(['b'], [])).toBe(identity(['b', 'closed', 'b2'], []));
    expect(identity(['companion'], ['a'])).toBe(identity(['a', 'companion'], []));
    expect(identity(['a'], ['a'])).toBe(identity(['a', 'companion'], []));
  });

  it('uses presented membership when the chosen anchor has no committed owner', () => {
    const identity = createTabStripIdentityResolver(root);
    const fallback = createTabStripIdentityResolver(null);
    expect(identity(['outside', 'b'], [])).toBe(fallback(['outside', 'b'], []));
    expect(identity(['outside'], ['outside'])).toBe(fallback(['outside'], []));
    expect(identity([], [])).toBe(fallback([], []));
    expect(fallback(['a:b', 'c'], [])).not.toBe(fallback(['a', 'b:c'], []));
  });

  it('preserves equal strip keys across root replacements while distinguishing changed group membership', () => {
    const identity = createTabStripIdentityResolver(root);
    const replaced = structuredClone(root);
    if (replaced.type !== 'split' || replaced.children[0]?.type !== 'group') throw new Error('Expected a group');
    replaced.children[0].panels.reverse();
    replaced.children[0].active = 'companion';
    expect(createTabStripIdentityResolver(replaced)(['a'], [])).toBe(identity(['a'], []));
    replaced.children[0].panels.push('new');
    expect(createTabStripIdentityResolver(replaced)(['a'], [])).not.toBe(identity(['a'], []));
  });

  it('preserves the recipient original nonfirst active body while carried content remains absent', () => {
    expect(preserveRecipientSelection(present(['a', 'b', 'b2']), root, ['a'])[0]?.active).toBe('b2');
    expect(preserveRecipientSelection(present(['a', 'companion']), root, ['a'])[0]?.active).toBe('companion');
    expect(preserveRecipientSelection(present(['a', 'companion']), root, ['companion'])[0]?.active).toBe('a');
  });
});

describe('workspace tab allocation', () => {
  const panels = ['a', 'b', 'c'].map(id => {
    const panel = document.createElement('nve-workspace-panel');
    panel.id = id;
    return panel;
  });
  const group: WorkspacePresentedGroup = {
    key: 'root.0',
    panels: panels.slice(0, 2),
    rect: { x: 0, y: 0, width: 300, height: 200 },
    active: 'a',
    gripWidth: 20,
    tabbed: true
  };
  const measurements = {
    width: 300,
    height: 200,
    gap: 6,
    headerHeight: 40,
    gripWidth: 20,
    actionWidth: 32,
    groupActionWidth: 20,
    tabWidth: 20,
    tabMinWidth: 90,
    panels: { a: { suffixWidth: 40, footerHeight: 0 } }
  };

  it('shares the width remaining after the grip, selected suffix, and group controls', () => {
    expect(getAllocatedTabWidth(group, measurements)).toBe(110);
  });

  it('enforces tab minimums without imposing them on passive singleton titles', () => {
    const narrow = { ...group, rect: { ...group.rect, width: 100 } };
    expect(getAllocatedTabWidth(narrow, measurements)).toBe(90);
    expect(getAllocatedTabWidth(narrow, { ...measurements, tabWidth: 120 })).toBe(120);
    expect(getAllocatedTabWidth({ ...narrow, panels: [panels[0]!], tabbed: false }, measurements)).toBe(20);
  });

  it('projects proposed membership without replacing the current group geometry', () => {
    const first = { ...group, panels: [panels[0]!] };
    const second = { ...group, key: 'root.1', panels: [panels[2]!], rect: { ...group.rect, x: 306 } };
    const result = projectTabMembership([first, second], [group]);

    expect(result).toEqual([{ ...first, panels: group.panels }, second]);
    expect(first.panels).toEqual([panels[0]]);
  });
});

describe('workspace computed acquisition headers', () => {
  let fixture: HTMLElement;

  afterEach(() => {
    removeFixture(fixture);
    vi.restoreAllMocks();
  });

  async function createHeaderTargetInput() {
    fixture = await createFixture(html`
      <div>
        <nve-workspace-panel id="a"> </nve-workspace-panel>
        <nve-workspace-panel id="b"> </nve-workspace-panel>
        <nve-workspace-panel id="c"> </nve-workspace-panel>
      </div>
    `);
    const panels = [...fixture.querySelectorAll<WorkspacePanel>('nve-workspace-panel')];
    return {
      groups: [
        { key: 'root', panels, active: 'b', tabbed: true, gripWidth: 20, rect: { x: 0, y: 0, width: 210, height: 180 } }
      ],
      measurements: {
        gap: 6,
        width: 210,
        height: 180,
        headerHeight: 40,
        gripWidth: 20,
        actionWidth: 20,
        tabWidth: 90,
        tabMinWidth: 0
      },
      source: [],
      point: { x: 244, y: 110 },
      bounds: { x: 100, y: 100, width: 210, height: 180 },
      client: (rect: Rect) => ({
        ...rect,
        x: rect.x + 100,
        y: rect.y + 100
      }),
      scroll: () => 95
    };
  }

  it('keeps scrolled recipient identity and tab order independent of animated group rectangles', async () => {
    const input = await createHeaderTargetInput();
    const before = findTabHeaderTarget(input);
    expect(before?.panels).toEqual(['a', 'b', 'c']);
    expect(before?.tabs.find(tab => tab.id === 'c')?.rect.x).toBe(205);
    for (const panel of input.groups[0]!.panels)
      vi.spyOn(panel, 'getBoundingClientRect').mockImplementation(() => {
        throw new Error('animated geometry is not an input');
      });
    expect(findTabHeaderTarget(input)).toEqual(before);
    expect(findTabHeaderTarget({ ...input, point: { x: 99, y: 110 } })).toBeUndefined();
  });

  it('holds only the visible computed carried tab reservation with a supplied scroll offset', async () => {
    const input = { ...(await createHeaderTargetInput()), source: ['c'] };
    expect(getTabReservationHit(input)).toBe('tab');
    expect(getTabReservationHit({ ...input, scroll: () => 0 })).toBeUndefined();
    expect(getTabReservationHit({ ...input, point: { x: 310, y: 110 } })).toBeUndefined();
  });

  it('uses the same zero-grip width for prospective headers and their tab reservation', async () => {
    const input = await createHeaderTargetInput();
    const group = { ...input.groups[0]!, panels: input.groups[0]!.panels.slice(0, 2), gripWidth: 0 };
    const frame = { ...input, groups: [group], source: ['b'], scroll: () => 0, point: { x: 101, y: 110 } };
    const header = findTabHeaderTarget(frame)!;
    expect(header.rect.x).toBe(100);
    expect(header.tabs[0]!.rect.width).toBe(105);
    expect(getTabReservationHit({ ...frame, point: { x: 206, y: 110 } })).toBe('tab');
    expect(getTabReservationHit(frame)).toBeUndefined();
  });

  it('excludes the measured group action from acquisition and carried reservations', async () => {
    const input = await createHeaderTargetInput();
    const frame = { ...input, measurements: { ...input.measurements, groupActionWidth: 40 }, source: ['c'] };
    expect(findTabHeaderTarget(frame)?.rect.width).toBe(150);
    expect(getTabReservationHit({ ...frame, point: { x: 260, y: 110 } })).toBe('tab');
    const action = { ...frame, point: { x: 280, y: 110 } };
    expect(findTabHeaderTarget(action)).toBeUndefined();
    expect(getTabReservationHit(action)).toBeUndefined();
  });

  it('uses the rendered tab width and excludes the selected header suffix from acquisition', async () => {
    const input = await createHeaderTargetInput();
    const group = {
      ...input.groups[0]!,
      panels: input.groups[0]!.panels.slice(0, 2),
      rect: { x: 0, y: 0, width: 300, height: 180 }
    };
    const frame = {
      ...input,
      groups: [group],
      measurements: { ...input.measurements, panels: { b: { suffixWidth: 80, footerHeight: 0 } } },
      bounds: { ...input.bounds, width: 300 },
      source: ['b'],
      scroll: () => 0,
      point: { x: 150, y: 110 }
    };
    expect(findTabHeaderTarget(frame)?.tabs[0]?.rect.width).toBe(100);
    expect(findTabHeaderTarget({ ...frame, point: { x: 350, y: 110 } })).toBeUndefined();
    expect(getTabReservationHit({ ...frame, point: { x: 250, y: 110 } })).toBe('tab');
    expect(getTabReservationHit({ ...frame, point: { x: 350, y: 110 } })).toBeUndefined();
    expect(
      getTabReservationHit({
        ...frame,
        measurements: { ...frame.measurements, tabWidth: 150 },
        point: { x: 350, y: 110 }
      })
    ).toBeUndefined();
  });
});
