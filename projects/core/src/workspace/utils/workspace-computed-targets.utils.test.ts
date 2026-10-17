// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from 'vitest';
import { html } from 'lit';
import { createFixture, removeFixture } from '@internals/testing';
import type { WorkspacePanel } from '../panel/panel.js';
import { computedTabHeader, computedTabReservation } from './workspace-computed-targets.utils.js';
import '../define.js';

describe('workspace computed acquisition headers', () => {
  let fixture: HTMLElement;

  afterEach(() => {
    removeFixture(fixture);
    vi.restoreAllMocks();
  });

  async function setup() {
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
      chrome: {
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
      client: (rect: { x: number; y: number; width: number; height: number }) => ({
        ...rect,
        x: rect.x + 100,
        y: rect.y + 100
      }),
      scroll: () => 95
    };
  }

  it('keeps scrolled recipient identity and tab order independent of animated group rectangles', async () => {
    const input = await setup();
    const before = computedTabHeader(input);
    expect(before?.panels).toEqual(['a', 'b', 'c']);
    expect(before?.tabs.find(tab => tab.id === 'c')?.rect.x).toBe(205);
    for (const panel of input.groups[0]!.panels)
      vi.spyOn(panel, 'getBoundingClientRect').mockImplementation(() => {
        throw new Error('animated geometry is not an input');
      });
    expect(computedTabHeader(input)).toEqual(before);
    expect(computedTabHeader({ ...input, point: { x: 99, y: 110 } })).toBeUndefined();
  });

  it('holds only the visible computed carried tab slot after native scrolling', async () => {
    const input = { ...(await setup()), source: ['c'] };
    expect(computedTabReservation(input)).toBe('tab');
    expect(computedTabReservation({ ...input, scroll: () => 0 })).toBeUndefined();
    expect(computedTabReservation({ ...input, point: { x: 310, y: 110 } })).toBeUndefined();
  });

  it('uses the same zero-grip width for prospective headers and their reserved tab slot', async () => {
    const input = await setup();
    const group = { ...input.groups[0]!, panels: input.groups[0]!.panels.slice(0, 2), gripWidth: 0 };
    const frame = { ...input, groups: [group], source: ['b'], scroll: () => 0, point: { x: 101, y: 110 } };
    const header = computedTabHeader(frame)!;
    expect(header.rect.x).toBe(100);
    expect(header.tabs[0]!.rect.width).toBe(105);
    expect(computedTabReservation({ ...frame, point: { x: 206, y: 110 } })).toBe('tab');
    expect(computedTabReservation(frame)).toBeUndefined();
  });

  it('uses the rendered tab width and excludes the selected header suffix from acquisition', async () => {
    const input = await setup();
    const group = {
      ...input.groups[0]!,
      panels: input.groups[0]!.panels.slice(0, 2),
      rect: { x: 0, y: 0, width: 300, height: 180 }
    };
    const frame = {
      ...input,
      groups: [group],
      chrome: { ...input.chrome, panels: { b: { suffixWidth: 80, footerHeight: 0 } } },
      bounds: { ...input.bounds, width: 300 },
      source: ['b'],
      scroll: () => 0,
      point: { x: 150, y: 110 }
    };
    expect(computedTabHeader(frame)?.tabs[0]?.rect.width).toBe(100);
    expect(computedTabHeader({ ...frame, point: { x: 350, y: 110 } })).toBeUndefined();
    expect(computedTabReservation({ ...frame, point: { x: 250, y: 110 } })).toBe('tab');
    expect(computedTabReservation({ ...frame, point: { x: 350, y: 110 } })).toBeUndefined();
    expect(
      computedTabReservation({
        ...frame,
        chrome: { ...frame.chrome, tabWidth: 150 },
        point: { x: 350, y: 110 }
      })
    ).toBeUndefined();
  });
});
