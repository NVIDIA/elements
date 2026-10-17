// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import type { Workspace } from './workspace.js';
import type { WorkspacePanel } from './panel/panel.js';
import { parseLayout } from './utils/workspace-layout.utils.js';
import { renderPreview } from './utils/workspace-preview.utils.js';
import '@nvidia-elements/core/ghost/define.js';
import './define.js';

describe('workspace private presentation', () => {
  let fixture: HTMLElement;

  afterEach(() => {
    removeFixture(fixture);
    vi.restoreAllMocks();
  });

  async function setup() {
    fixture = await createFixture(html`
      <nve-workspace closable groupable rearrangeable style="height:220px;width:600px">
        <nve-workspace-panel id="a">
          <nve-workspace-panel-header><strong>Rich Alpha</strong></nve-workspace-panel-header>
          <input value="retained" />
        </nve-workspace-panel>
        <nve-workspace-panel id="b" hidden>
          <nve-workspace-panel-header>Beta</nve-workspace-panel-header>Application-hidden content</nve-workspace-panel
        >
      </nve-workspace>
    `);
    const workspace = fixture.querySelector<Workspace>('nve-workspace')!;
    await elementIsStable(workspace);
    return workspace;
  }

  it.each([
    { side: 'left', x: 0, y: 0, width: 100, height: 120, radii: ['8px', '0px', '0px', '20px'] },
    { side: 'right', x: 100, y: 0, width: 100, height: 120, radii: ['0px', '12px', '16px', '0px'] },
    { side: 'top', x: 0, y: 0, width: 200, height: 60, radii: ['8px', '12px', '0px', '0px'] },
    { side: 'bottom', x: 0, y: 60, width: 200, height: 60, radii: ['0px', '0px', '16px', '20px'] }
  ] as const)(
    'keeps the $side split cut square while its inherited group corners stay rounded',
    async ({ side, radii, ...cue }) => {
      const recipient = { x: 0, y: 0, width: 200, height: 120 };
      const presentation = renderPreview({
        preview: {
          phase: 'detached',
          allocation: 'overlay',
          intent: { kind: 'split', destination: { target: 'a', position: side } },
          blocked: false,
          source: ['b'],
          cue: { kind: 'group', rect: { ...cue, x: cue.x + 80, y: cue.y + 60 } }
        },
        contexts: [{ key: 'recipient', rect: recipient }],
        regions: [{ key: 'root', node: { type: 'group', panels: ['a'], active: 'a' }, rect: recipient }],
        x: 80,
        y: 60,
        bounds: { x: 80, y: 60, width: 200, height: 120 },
        title: 'B'
      });
      fixture = await createFixture(
        html`<div style="--_workspace-border-radius:8px 12px 16px 20px">${presentation}</div>`
      );
      const ghost = fixture.querySelector<HTMLElement>('nve-ghost')!;
      await elementIsStable(ghost);
      const corners = (element: Element) => {
        const style = getComputedStyle(element);
        return [
          style.borderTopLeftRadius,
          style.borderTopRightRadius,
          style.borderBottomRightRadius,
          style.borderBottomLeftRadius
        ];
      };
      expect(corners(ghost)).toEqual(radii);
      expect(corners(ghost.shadowRoot!.querySelector('[internal-host]')!)).toEqual(radii);
      expect(corners(fixture.querySelector('.context-boundary')!)).toEqual(['8px', '12px', '16px', '20px']);
    }
  );

  it('suppresses closed flat-tree content without changing native hidden or light-DOM ownership', async () => {
    const workspace = await setup();
    const panel = workspace.querySelector<WorkspacePanel>('#a')!;
    const input = panel.querySelector('input')!;
    const setter = vi.spyOn(panel, 'hidden', 'set');
    const slot = panel.assignedSlot;
    workspace.shadowRoot!.querySelector<HTMLElement>('[data-close="a"]')!.click();
    await elementIsStable(workspace);
    panel.hidden = false;
    panel.style.display = 'block';
    expect(setter).toHaveBeenCalledOnce();
    expect(panel.matches(':state(workspace-presented)')).toBe(false);
    expect(getComputedStyle(panel).display).toBe('none');
    expect(panel.parentElement).toBe(workspace);
    expect(panel.assignedSlot).toBe(slot);
    expect(panel.querySelector('input')).toBe(input);
    expect(panel.hasAttribute('hidden')).toBe(false);
    const snapshot = parseLayout(workspace.value);
    workspace.value = JSON.stringify({ ...snapshot, closed: [] });
    await elementIsStable(workspace);
    expect(setter).toHaveBeenCalledOnce();
    expect(panel.matches(':state(workspace-presented)')).toBe(true);
    expect(getComputedStyle(panel).display).toBe('block');
    expect(panel.querySelector('input')).toBe(input);
  });

  it('retains application-native hidden without importing it into the canonical closed state', async () => {
    const workspace = await setup();
    const panel = workspace.querySelector<WorkspacePanel>('#b')!;
    const setter = vi.spyOn(panel, 'hidden', 'set');
    expect(panel.hidden).toBe(true);
    expect(panel.matches(':state(workspace-presented)')).toBe(true);
    expect(getComputedStyle(panel).display).toBe('none');
    const saved = workspace.value;
    workspace.shadowRoot!.querySelector<HTMLElement>('[data-close="b"]')!.click();
    await elementIsStable(workspace);
    workspace.value = saved;
    await elementIsStable(workspace);
    expect(setter).not.toHaveBeenCalled();
    expect(panel.hidden).toBe(true);
    expect(parseLayout(workspace.value).closed).toEqual([]);
    expect(getComputedStyle(panel).display).toBe('none');
  });

  it('updates localized close controls and live authored labels without changing the saved arrangement', async () => {
    const workspace = await setup();
    const saved = workspace.value;
    expect(workspace.i18n).toMatchObject({ close: 'close', move: 'move', exitFullscreen: 'exit full screen' });
    expect(workspace.shadowRoot!.querySelector('[data-drag-group]')!.getAttribute('aria-label')).toBe('move');
    workspace.i18n = { close: 'Fermer' };
    workspace.querySelector('nve-workspace-panel-header')!.textContent = 'Live Alpha';
    await vi.waitFor(() =>
      expect(workspace.shadowRoot!.querySelector('[data-panel="a"]')!.getAttribute('aria-label')).toBe('Live Alpha')
    );
    expect(workspace.shadowRoot!.querySelector('[data-close="a"]')!.getAttribute('aria-label')).toBe(
      'Fermer Live Alpha'
    );
    expect(workspace.value).toBe(saved);
  });

  it('renders tab selection only while a group has multiple open panels', async () => {
    const workspace = await setup();
    const tabs = workspace.shadowRoot!.querySelector('nve-tabs')!;
    expect(getComputedStyle(tabs, '::after').display).not.toBe('none');
    workspace.shadowRoot!.querySelector<HTMLElement>('[data-close="b"]')!.click();
    await elementIsStable(workspace);
    expect(workspace.shadowRoot!.querySelector('nve-tabs.tab-track')).toBeNull();
    const snapshot = parseLayout(workspace.value);
    workspace.value = JSON.stringify({ ...snapshot, closed: [] });
    await elementIsStable(workspace);
    const restored = workspace.shadowRoot!.querySelector('nve-tabs.tab-track')!;
    expect(getComputedStyle(restored, '::after').display).not.toBe('none');
  });

  it('clips singleton header overflow without reading or binding a scrolling strip', async () => {
    const workspace = await setup();
    workspace.style.width = '180px';
    const strip = workspace.shadowRoot!.querySelector<HTMLElement>('.tablist')!;
    await vi.waitFor(() => expect(strip.scrollWidth).toBeGreaterThan(strip.clientWidth));
    expect(getComputedStyle(strip).overflowX).toBe('auto');
    const saved = workspace.value;
    workspace.shadowRoot!.querySelector<HTMLElement>('[data-close="b"]')!.click();
    await elementIsStable(workspace);
    const singleton = workspace.shadowRoot!.querySelector<HTMLElement>('.tablist')!;
    const entry = singleton.querySelector<HTMLElement>('.tab-entry')!;
    entry.style.width = '300px';
    expect(getComputedStyle(singleton).overflowX).toBe('clip');
    const width = vi.spyOn(singleton, 'scrollWidth', 'get');
    const offset = vi.spyOn(singleton, 'scrollLeft', 'get');
    workspace.requestUpdate();
    await elementIsStable(workspace);
    expect(width).not.toHaveBeenCalled();
    expect(offset).not.toHaveBeenCalled();
    const label = workspace.querySelector('nve-workspace-panel-header')!.shadowRoot!.querySelector('.label-track')!;
    expect(label.getAnimations()).toHaveLength(0);
    workspace.value = saved;
    await elementIsStable(workspace);
    const restored = workspace.shadowRoot!.querySelector<HTMLElement>('.tablist')!;
    expect(getComputedStyle(restored).overflowX).toBe('auto');
    expect(restored.scrollWidth).toBeGreaterThan(restored.clientWidth);
  });

  it('isolates overshooting preview geometry from viewport scroll extents and allocation', async () => {
    const workspace = await setup();
    const viewport = workspace.shadowRoot!.querySelector<HTMLElement>('.viewport')!;
    const canvas = workspace.shadowRoot!.querySelector<HTMLElement>('.canvas')!;
    const extents = () => [viewport.clientWidth, viewport.clientHeight, viewport.scrollWidth, viewport.scrollHeight];
    const before = extents();
    const allocation = [canvas.style.width, canvas.style.height];
    const saved = workspace.value;
    const ghost = document.createElement('nve-ghost');
    ghost.className = 'destination';
    ghost.style.cssText = 'transform:translate(550px,200px);width:600px;height:220px;transition:none';
    workspace.shadowRoot!.querySelector('.preview-layer')!.append(ghost);
    expect(ghost.getBoundingClientRect().right).toBeGreaterThan(viewport.getBoundingClientRect().right);
    expect(ghost.getBoundingClientRect().bottom).toBeGreaterThan(viewport.getBoundingClientRect().bottom);
    expect(extents()).toEqual(before);
    workspace.requestUpdate();
    await elementIsStable(workspace);
    expect(extents()).toEqual(before);
    expect([canvas.style.width, canvas.style.height]).toEqual(allocation);
    expect(workspace.value).toBe(saved);
  });

  it('sizes resize handles from the measured gap independently of container framing', async () => {
    const workspace = await setup();
    workspace.resizable = true;
    workspace.value = JSON.stringify({
      version: 1,
      closed: [],
      root: {
        type: 'split',
        axis: 'horizontal',
        weights: [1, 1],
        children: ['a', 'b'].map(id => ({ type: 'group', panels: [id], active: id }))
      }
    });
    await elementIsStable(workspace);
    const handle = workspace.shadowRoot!.querySelector<HTMLElement>('nve-resize-handle')!;
    const gutter = handle.parentElement!;
    expect(handle.getBoundingClientRect().width).toBe(gutter.getBoundingClientRect().width);
    const saved = workspace.value;
    for (const container of ['flat', 'full'] as const) {
      workspace.container = container;
      await elementIsStable(workspace);
      expect(handle.getBoundingClientRect().width).toBe(6);
    }
    workspace.style.setProperty('--gap', 'calc(8px + 4px)');
    await vi.waitFor(() => expect(gutter.getBoundingClientRect().width).toBe(12));
    expect(handle.getBoundingClientRect().width).toBe(12);
    workspace.style.setProperty('--gap', '0px');
    await vi.waitFor(() => expect(gutter.getBoundingClientRect().width).toBe(0));
    expect(handle.getBoundingClientRect().width).toBe(1);
    const line = handle.getBoundingClientRect();
    expect(line.x + line.width / 2).toBe(gutter.getBoundingClientRect().x);
    expect(
      parseFloat(getComputedStyle(handle.shadowRoot!.querySelector('[internal-host]')!, '::before').width)
    ).toBeGreaterThan(1);
    expect(workspace.value).toBe(saved);
  });

  it.each(['horizontal', 'vertical'])('caps the painted divider within a wide %s split gutter', async axis => {
    const workspace = await setup();
    workspace.resizable = true;
    workspace.style.setProperty('--gap', '24px');
    workspace.value = JSON.stringify({
      version: 1,
      closed: [],
      root: {
        type: 'split',
        axis,
        weights: [1, 1],
        children: ['a', 'b'].map(id => ({ type: 'group', panels: [id], active: id }))
      }
    });
    await elementIsStable(workspace);
    const handle = workspace.shadowRoot!.querySelector<HTMLElement>('nve-resize-handle')!;
    await vi.waitFor(() =>
      expect(axis === 'horizontal' ? handle.getBoundingClientRect().width : handle.getBoundingClientRect().height).toBe(
        24
      )
    );
    const target = handle.getBoundingClientRect();
    const line = handle.shadowRoot!.querySelector('[part="_line"]')!.getBoundingClientRect();
    if (axis === 'horizontal') {
      expect(target.width).toBe(24);
      expect(line.width).toBe(2);
      expect(line.x + line.width / 2).toBe(target.x + target.width / 2);
    } else {
      expect(target.height).toBe(24);
      expect(line.height).toBe(2);
      expect(line.y + line.height / 2).toBe(target.y + target.height / 2);
    }
    workspace.style.setProperty('--resize-line-width', '4px');
    const configured = handle.shadowRoot!.querySelector('[part="_line"]')!.getBoundingClientRect();
    expect(axis === 'horizontal' ? configured.width : configured.height).toBe(4);
    expect(axis === 'horizontal' ? handle.offsetWidth : handle.offsetHeight).toBe(24);
  });
});
