// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createFixture, elementIsStable, removeFixture } from '@internals/testing';

import { DashboardCompositionController } from './composition.controller.js';
import { DashboardFullscreenController } from './fullscreen.controller.js';

import type { DashboardPointerPresentation } from './interaction.controller.js';

import type { DashboardLayout, DashboardPanel } from '../index.js';

import '../define.js';

class CompositionTestHost extends LitElement {
  sizing = 'fit' as const;
  container = 'full' as const;
  fullscreenable = false;
  layout: DashboardLayout = {
    version: 1,
    grid: { flow: 'vertical', tracks: 4 },
    items: [
      { id: 'a', column: 2, row: 0, columnSpan: 2, rowSpan: 2 },
      { id: 'b', column: 0, row: 0, columnSpan: 2, rowSpan: 2 }
    ]
  };
  preview?: DashboardLayout;
  active?: DashboardPointerPresentation;
  metrics = { columnSize: 94, rowSize: 72, gap: 8, width: 400, height: 260 };
  readonly changed = vi.fn();
  readonly measure = vi.fn();
  readonly fullscreen = new DashboardFullscreenController(this, {
    hasPanel: () => true,
    cancelInteractions: () => {},
    invalidateCommandAvailability: () => {}
  });
  readonly composition = new DashboardCompositionController(this, {
    getLayout: () => this.layout,
    getCanonicalLayout: () => this.layout,
    getPreview: () => this.preview,
    getPointerPresentation: () => this.active,
    getMetrics: () => this.metrics,
    getLabels: () => ({ move: 'Move panel', resize: 'Resize panel' }),
    isActionAllowed: () => true,
    fullscreen: this.fullscreen,
    measure: this.measure,
    changed: this.changed
  });

  get value() {
    return JSON.stringify(this.layout);
  }

  render() {
    return html`<div class="viewport" style="width:100%;height:260px;overflow:auto;position:relative"><div class="canvas" style="width:400px;height:600px;position:relative"><slot></slot></div></div>`;
  }
}

const tag = 'dashboard-composition-test-host';
customElements.define(tag, CompositionTestHost);

describe('DashboardCompositionController', () => {
  let fixture: HTMLElement | undefined;
  let host: CompositionTestHost;

  async function stable(element: CompositionTestHost) {
    await elementIsStable(element);

    for (const panel of element.querySelectorAll('nve-dashboard-panel')) {
      await elementIsStable(panel);
    }

    await new Promise(requestAnimationFrame);
  }

  beforeEach(async () => {
    fixture = await createFixture(
      html`<dashboard-composition-test-host style="display:block;width:400px"><nve-dashboard-panel id="a" style="--animation-duration:0ms;--animation-easing:ease"><nve-dashboard-panel-header>First<span slot="prefix">Status</span></nve-dashboard-panel-header><input value="Kept draft" /></nve-dashboard-panel><nve-dashboard-panel id="b" style="--animation-duration:0ms;--animation-easing:ease"><nve-dashboard-panel-header>Second</nve-dashboard-panel-header>Content</nve-dashboard-panel></dashboard-composition-test-host>`
    );

    host = fixture.querySelector<CompositionTestHost>(tag)!;

    await stable(host);

    host.composition.present();
    await stable(host);

    host.changed.mockClear();
  });

  afterEach(() => {
    if (fixture) {
      removeFixture(fixture);
    }

    vi.restoreAllMocks();
  });

  it('discovers visible direct panels and applies their supplied geometry', () => {
    const [a, b] = host.composition.panels;

    expect(host.composition.ready).toBe(true);
    expect(a!.style.getPropertyValue('--_dashboard-inline-start')).toBe('204px');
    expect(b!.style.getPropertyValue('--_dashboard-inline-start')).toBe('0px');
    expect(a!.style.width).toBe('196px');
    expect(a!.getAttribute('container')).toBe('full');

    b!.hidden = true;

    expect(host.composition.panels).toEqual([a]);

    const nested = document.createElement('nve-dashboard-panel');

    a!.append(nested);

    expect(host.composition.panels).toEqual([a]);
  });

  it('distinguishes membership changes from title slots and unrelated application mutations', async () => {
    const panel = host.querySelector<DashboardPanel>('#a')!;
    const decoration = panel.querySelector('span')!;

    decoration.removeAttribute('slot');
    await stable(host);

    expect(host.changed).toHaveBeenCalledOnce();
    expect(host.changed).toHaveBeenLastCalledWith(false);

    host.composition.present();

    expect(panel._internals.ariaLabel).toBe('FirstStatus');

    host.changed.mockClear();
    panel.querySelector('input')!.slot = 'application';
    await stable(host);

    expect(host.changed).not.toHaveBeenCalled();

    panel.minColumnSpan = 2;
    await stable(host);

    expect(host.changed).toHaveBeenCalledOnce();
    expect(host.changed).toHaveBeenLastCalledWith(true);
  });

  it('keeps reading order committed while preview geometry changes', () => {
    const a = host.querySelector<DashboardPanel>('#a')!;
    const b = host.querySelector<DashboardPanel>('#b')!;

    expect(a.style.getPropertyValue('--_reading-order')).toBe('1');

    host.preview = {
      ...host.layout,
      items: host.layout.items.map(item => ({ ...item, column: item.id === 'a' ? 0 : 2 }))
    };
    host.composition.present();

    expect(a.style.getPropertyValue('--_dashboard-inline-start')).toBe('0px');
    expect(a.style.getPropertyValue('--_reading-order')).toBe('1');
    expect(b.style.getPropertyValue('--_reading-order')).toBe('0');

    host.layout = host.preview;
    host.preview = undefined;
    host.composition.present();

    expect(a.style.getPropertyValue('--_reading-order')).toBe('0');
    expect(b.style.getPropertyValue('--_reading-order')).toBe('1');
  });

  it('cleans up its temporary geometry duration even when panel presentation fails', () => {
    host.style.width = '320px';
    host.metrics = { ...host.metrics, columnSize: 74, width: 320 };

    const panel = host.querySelector<DashboardPanel>('#a')!;

    vi.spyOn(panel, '_configure').mockImplementationOnce(() => {
      throw new Error('Application presentation failed');
    });

    expect(() => host.composition.present()).toThrow('Application presentation failed');

    for (const element of host.composition.panels) {
      expect(element.style.getPropertyValue('--_geometry-animation-duration')).toBe('');
    }
  });

  it('does not reveal a stale keyboard target after application focus changes', async () => {
    const panel = host.querySelector<DashboardPanel>('#a')!;
    const control = panel.shadowRoot!.querySelector<HTMLElement>('[data-dashboard-action="move"]')!;

    control.focus();

    const scroll = vi.spyOn(host.composition.viewport!, 'scrollBy');
    const reveal = host.composition.revealKeyboardControl(host.layout, { panel, element: control, action: 'move' });
    const input = panel.querySelector('input')!;

    input.focus();
    await reveal;

    expect(scroll).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(input);
  });

  it('stops mutation observation while disconnected and resumes once after reconnect', async () => {
    const title = host.querySelector('nve-dashboard-panel-header')!;

    host.remove();
    title.firstChild!.textContent = 'Disconnected';
    await new Promise(requestAnimationFrame);

    expect(host.changed).not.toHaveBeenCalled();

    fixture!.append(host);
    await stable(host);

    host.changed.mockClear();
    title.firstChild!.textContent = 'Reconnected';
    await stable(host);

    expect(host.changed).toHaveBeenCalledOnce();
    expect(host.changed).toHaveBeenLastCalledWith(false);
  });
});
