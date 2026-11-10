// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createFixture, elementIsStable, removeFixture } from '@internals/testing';

import type { DashboardPanel } from '../index.js';

import '../define.js';

describe('dashboard panel resize pointer targets', () => {
  let fixture: HTMLElement | undefined;

  afterEach(() => {
    if (fixture) {
      removeFixture(fixture);
    }

    vi.restoreAllMocks();
  });

  async function createPanelFixture(gap = 12) {
    fixture =
      await createFixture(html`<div style="position:relative;width:600px;height:320px;--animation-duration:0ms;--animation-easing:ease">
      <nve-dashboard-panel id="a" style="left:168px;top:0;width:156px;height:192px"><nve-dashboard-panel-header>A<button slot="suffix" id="header-action">Action</button></nve-dashboard-panel-header>Application content</nve-dashboard-panel>
      <nve-dashboard-panel id="b" style="top:0;width:156px;height:192px"><nve-dashboard-panel-header>B</nve-dashboard-panel-header>Content</nve-dashboard-panel>
    </div>`);

    const host = fixture.querySelector('div')!;

    host.style.setProperty('--gap', `${gap}px`);

    const panel = host.querySelector<DashboardPanel>('#a')!;
    const peer = host.querySelector<DashboardPanel>('#b')!;

    peer.style.left = `${324 + gap}px`;

    for (const surface of [panel, peer]) {
      surface._configure({
        placed: true,
        movable: true,
        resizable: true,
        labels: { move: 'Move panel', resize: 'Resize panel' }
      });
      await elementIsStable(surface);
    }

    window.scrollTo(0, 0);

    return { panel };
  }

  function elementAt(point: { x: number; y: number }) {
    let element = document.elementFromPoint(point.x, point.y);

    while (element?.shadowRoot) {
      const next = element.shadowRoot.elementFromPoint(point.x, point.y);

      if (!next || next === element) break;

      element = next;
    }

    return element;
  }

  function hit(point: { x: number; y: number }) {
    const element = elementAt(point);
    let current = element;
    let edge: string | undefined;
    let action: string | undefined;
    let panel: string | undefined;

    while (current) {
      if (current instanceof HTMLElement) {
        edge ??= current.dataset.dashboardEdge;
        action ??= current.dataset.dashboardAction;
      }

      if (current.tagName === 'NVE-DASHBOARD-PANEL') {
        panel = current.id;
      }

      const root = current.getRootNode();

      current = current.parentElement ?? (root instanceof ShadowRoot ? root.host : null);
    }

    return { element, edge, action, panel };
  }

  it('provides the default seven-pixel resize target at the panel edge', async () => {
    const { panel } = await createPanelFixture();
    const bounds = panel.getBoundingClientRect();
    const zone = panel.shadowRoot!.querySelector<HTMLElement>('[data-dashboard-edge="right"]')!;

    expect(zone.getBoundingClientRect().width).toBe(7);
    expect(hit({ x: bounds.right - 3, y: bounds.top + bounds.height / 2 })).toMatchObject({
      edge: 'right',
      panel: 'a'
    });
    expect(hit({ x: bounds.right + 2, y: bounds.top + bounds.height / 2 })).toMatchObject({
      edge: 'right',
      panel: 'a'
    });
    expect(hit({ x: bounds.right - 5, y: bounds.top + bounds.height / 2 }).edge).toBeUndefined();
  });

  it('updates the configurable reach through CSS while retaining panel bounds and application controls', async () => {
    const { panel } = await createPanelFixture();
    const before = panel.getBoundingClientRect().toJSON();
    const update = vi.spyOn(panel, 'requestUpdate');

    panel.style.setProperty('--resize-target-size', '6px');

    const bounds = panel.getBoundingClientRect();
    const zone = panel.shadowRoot!.querySelector<HTMLElement>('[data-dashboard-edge="right"]')!;

    expect(zone.getBoundingClientRect().width).toBe(13);
    expect(hit({ x: bounds.right - 6, y: bounds.top + bounds.height / 2 })).toMatchObject({
      edge: 'right',
      panel: 'a'
    });
    expect(hit({ x: bounds.right + 5, y: bounds.top + bounds.height / 2 })).toMatchObject({
      edge: 'right',
      panel: 'a'
    });

    const resize = panel
      .shadowRoot!.querySelector<HTMLElement>('.grip>[data-dashboard-action="resize"]')!
      .getBoundingClientRect();

    expect(hit({ x: resize.left + resize.width / 2, y: resize.top + resize.height / 2 })).toMatchObject({
      action: 'resize',
      edge: undefined,
      panel: 'a'
    });

    const button = panel.querySelector('#header-action')!;
    const action = button.getBoundingClientRect();

    expect(hit({ x: action.left + action.width / 2, y: action.top + action.height / 2 }).element).toBe(button);
    expect(panel.getBoundingClientRect().toJSON()).toEqual(before);
    expect(update).not.toHaveBeenCalled();
  });

  it('keeps zero-gap neighbors distinct while allowing the documented inward reach', async () => {
    const { panel } = await createPanelFixture(0);
    const bounds = panel.getBoundingClientRect();

    expect(panel.shadowRoot!.querySelector('[data-dashboard-edge="right"]')!.getBoundingClientRect().width).toBe(4);
    expect(hit({ x: bounds.right - 3, y: bounds.top + bounds.height / 2 })).toMatchObject({
      edge: 'right',
      panel: 'a'
    });
    expect(hit({ x: bounds.right + 2, y: bounds.top + bounds.height / 2 })).toMatchObject({ edge: 'left', panel: 'b' });
  });

  it('clamps negative reach to the border without creating a negative or overlapping target', async () => {
    const { panel } = await createPanelFixture();

    panel.style.setProperty('--resize-target-size', '-8px');

    const bounds = panel.getBoundingClientRect();

    expect(panel.shadowRoot!.querySelector('[data-dashboard-edge="right"]')!.getBoundingClientRect().width).toBe(1);
    expect(hit({ x: bounds.right - 3, y: bounds.top + bounds.height / 2 }).edge).toBeUndefined();
  });
});
