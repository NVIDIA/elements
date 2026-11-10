// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createFixture, elementIsStable, removeFixture } from '@internals/testing';

import { Dashboard, DashboardPanel, DashboardPanelHeader } from './index.js';

import './define.js';

const value = JSON.stringify({
  version: 1,
  grid: { flow: 'horizontal', tracks: 2 },
  items: [{ id: 'late', column: 0, row: 0, columnSpan: 3, rowSpan: 2 }]
});

describe('dashboard child upgrade ordering', () => {
  let fixture: HTMLElement | undefined;

  afterEach(() => {
    if (fixture) {
      removeFixture(fixture);
    }
  });

  it('preserves declared placement while its supplied panel has not upgraded', async () => {
    fixture = await createFixture(html`<div></div>`);

    const dashboard = document.createElement('nve-dashboard');

    dashboard.style.cssText = 'width:640px;height:360px';

    const inert = document.implementation.createHTMLDocument();
    const panel = inert.createElement('nve-dashboard-panel');

    panel.id = 'late';
    panel.innerHTML = '<nve-dashboard-panel-header>Late panel</nve-dashboard-panel-header><input value="kept">';

    const input = panel.querySelector('input');

    dashboard.append(panel);

    expect('_getSpanConstraints' in panel).toBe(false);

    const changes = vi.fn();

    dashboard.addEventListener('change', changes);
    dashboard.setAttribute('value', value);

    expect(dashboard.value).toBe(value);

    fixture.append(dashboard);
    await elementIsStable(dashboard);

    expect(dashboard.value).toBe(value);
    expect(dashboard.querySelector('input')).toBe(input);
    expect(dashboard.querySelector('nve-dashboard-panel')).toBe(panel);
    expect(changes).not.toHaveBeenCalled();
  });

  it('upgrades a literal value attribute and descendants when appending an inert example template', async () => {
    fixture = await createFixture(html`<div></div>`);

    const template = document.createElement('template');

    template.innerHTML = `<nve-dashboard style="width:640px;height:360px" value='${value}'><nve-dashboard-panel id="late"><nve-dashboard-panel-header>Late panel</nve-dashboard-panel-header><input value="kept"></nve-dashboard-panel></nve-dashboard>`;

    const dashboard = template.content.querySelector('nve-dashboard')!;
    const panel = dashboard.querySelector('nve-dashboard-panel');
    const input = dashboard.querySelector('input');
    const changes = vi.fn();

    dashboard.addEventListener('change', changes);
    fixture.append(template.content);
    await elementIsStable(dashboard);

    expect(dashboard.value).toBe(value);
    expect(dashboard.flow).toBe('horizontal');
    expect(dashboard.tracks).toBe(2);
    expect(dashboard.querySelector('nve-dashboard-panel')).toBe(panel);
    expect(dashboard.querySelector('input')).toBe(input);
    expect(changes).not.toHaveBeenCalled();
  });

  it.skipIf(!('initialize' in CustomElementRegistry.prototype))(
    'reconciles silently when the owning scoped registry defines panels later',
    async () => {
      fixture = await createFixture(html`<div></div>`);

      const registry = new CustomElementRegistry();

      registry.define('nve-dashboard', class extends Dashboard {});

      const root = fixture.attachShadow({ mode: 'open', customElementRegistry: registry });

      root.innerHTML = `<nve-dashboard style="width:640px;height:360px"><nve-dashboard-panel id="late"><nve-dashboard-panel-header>Late panel</nve-dashboard-panel-header></nve-dashboard-panel></nve-dashboard>`;

      const dashboard = root.querySelector<Dashboard>('nve-dashboard')!;
      const panel = dashboard.querySelector('nve-dashboard-panel')!;
      const changes = vi.fn();

      dashboard.addEventListener('change', changes);
      dashboard.setAttribute('value', value);
      await dashboard.updateComplete;

      expect(dashboard.value).toBe(value);

      registry.define('nve-dashboard-panel-header', class extends DashboardPanelHeader {});
      registry.define('nve-dashboard-panel', class extends DashboardPanel {});
      await vi.waitFor(() => expect(panel.style.width).not.toBe(''));
      await elementIsStable(dashboard);

      expect(dashboard.value).toBe(value);
      expect(dashboard.firstElementChild).toBe(panel);
      expect(changes).not.toHaveBeenCalled();
    }
  );

  it.skipIf(!('initialize' in CustomElementRegistry.prototype))(
    'keeps an initially infeasible restore pending until upgraded constraints become feasible',
    async () => {
      fixture = await createFixture(html`<div></div>`);

      const registry = new CustomElementRegistry();

      registry.define('nve-dashboard', class extends Dashboard {});

      const root = fixture.attachShadow({ mode: 'open', customElementRegistry: registry });

      root.innerHTML =
        '<nve-dashboard style="width:640px;height:360px"><nve-dashboard-panel id="late" min-column-span="3"><nve-dashboard-panel-header>Late panel</nve-dashboard-panel-header></nve-dashboard-panel></nve-dashboard>';

      const dashboard = root.querySelector<Dashboard>('nve-dashboard')!;
      const panel = dashboard.querySelector('nve-dashboard-panel')!;
      const pending = JSON.stringify({
        version: 1,
        grid: { flow: 'vertical', tracks: 2 },
        items: [{ id: 'late', column: 0, row: 0, columnSpan: 1, rowSpan: 2 }]
      });
      const changes = vi.fn();

      dashboard.addEventListener('change', changes);
      dashboard.value = pending;
      registry.define('nve-dashboard-panel-header', class extends DashboardPanelHeader {});
      registry.define('nve-dashboard-panel', class extends DashboardPanel {});
      await elementIsStable(dashboard);

      expect(dashboard.value).toBe(pending);
      expect(dashboard.shadowRoot!.querySelector<HTMLElement>('.canvas')!.hidden).toBe(true);
      expect(panel.style.width).toBe('');

      panel.minColumnSpan = 1;
      await elementIsStable(panel);
      await vi.waitFor(() => expect(dashboard.shadowRoot!.querySelector<HTMLElement>('.canvas')!.hidden).toBe(false));

      expect(panel.style.width).not.toBe('');
      expect(dashboard.value).toBe(pending);
      expect(changes).not.toHaveBeenCalled();

      panel.minColumnSpan = 3;

      expect(() => {
        dashboard.value = pending;
      }).toThrow(RangeError);
      expect(dashboard.value).toBe(pending);
    }
  );
});
