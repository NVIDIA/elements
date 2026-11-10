// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createFixture, elementIsStable, removeFixture } from '@internals/testing';

import type { Dashboard, DashboardLayout, DashboardPanel } from './index.js';

import './define.js';

describe('dashboard native border spacing', () => {
  let fixture: HTMLElement | undefined;
  const sheets = [...document.adoptedStyleSheets];
  const observerErrors: string[] = [];

  const recordError = (event: ErrorEvent) => {
    if (event.message.includes('ResizeObserver')) {
      observerErrors.push(event.message);
    }
  };

  beforeEach(() => {
    observerErrors.length = 0;
    window.addEventListener('error', recordError);
  });

  afterEach(() => {
    document.adoptedStyleSheets = sheets;

    if (fixture) {
      removeFixture(fixture);
    }

    vi.restoreAllMocks();
    window.removeEventListener('error', recordError);

    expect(observerErrors).toEqual([]);
  });

  async function createDashboard(
    flow: DashboardLayout['grid']['flow'] = 'vertical',
    sizing: 'fit' | 'fixed' = 'fit',
    dir = 'ltr'
  ) {
    fixture =
      await createFixture(html`<nve-dashboard id="spacing-dashboard" container="full" rearrangeable guides="visible" sizing=${sizing} dir=${dir} style="width:600px;height:400px;--column-size:80px;--row-size:64px;--gap:0px;--animation-duration:0ms">
      <nve-dashboard-panel id="a"><nve-dashboard-panel-header>A</nve-dashboard-panel-header><nve-dashboard-panel-content><input aria-label="Draft" value="Retained draft" /></nve-dashboard-panel-content></nve-dashboard-panel>
      <nve-dashboard-panel id="b"><nve-dashboard-panel-header>B</nve-dashboard-panel-header>Content</nve-dashboard-panel>
      <nve-dashboard-panel id="c"><nve-dashboard-panel-header>C</nve-dashboard-panel-header>Content</nve-dashboard-panel>
    </nve-dashboard>`);

    const dashboard = fixture.querySelector<Dashboard>('nve-dashboard')!;
    const cells = [
      { id: 'a', column: 0, row: 0, columnSpan: 2, rowSpan: 2 },
      { id: 'b', column: 2, row: 0, columnSpan: 2, rowSpan: 2 },
      { id: 'c', column: 0, row: 2, columnSpan: 4, rowSpan: 2 }
    ];

    dashboard.value = JSON.stringify({
      version: 1,
      grid: { flow, tracks: 4 },
      items: cells.map(item =>
        flow === 'vertical'
          ? item
          : { id: item.id, column: item.row, row: item.column, columnSpan: item.rowSpan, rowSpan: item.columnSpan }
      )
    });
    await elementIsStable(dashboard);
    await waitOverlap(dashboard, 1);

    return dashboard;
  }

  function panels(dashboard: Dashboard) {
    return [...dashboard.querySelectorAll<DashboardPanel>('nve-dashboard-panel')];
  }

  function panelBounds(dashboard: Dashboard): readonly [DOMRect, DOMRect, DOMRect] {
    const [a, b, c] = panels(dashboard).map(panel => panel.getBoundingClientRect());
    if (!a || !b || !c) {
      throw new Error('Missing spacing fixture panels');
    }

    return [a, b, c];
  }

  function overlap(dashboard: Dashboard) {
    const [a, b] = panelBounds(dashboard);
    return dashboard.flow === 'vertical' ? a.right - b.left : a.bottom - b.top;
  }

  async function waitOverlap(dashboard: Dashboard, width: number) {
    await vi.waitFor(() => expect(overlap(dashboard)).toBeCloseTo(width, 2));
    await elementIsStable(dashboard);
  }

  async function frames() {
    for (let index = 0; index < 4; index++) {
      await new Promise(requestAnimationFrame);
    }
  }

  function sheet(width: number) {
    const style = new CSSStyleSheet();

    style.replaceSync(
      `#spacing-dashboard > nve-dashboard-panel { --border:${width}px solid rgb(80,100,140) !important; }`
    );
    document.adoptedStyleSheets = [...sheets, style];

    return style;
  }

  for (const flow of ['vertical', 'horizontal'] as const) {
    for (const sizing of ['fit', 'fixed'] as const) {
      it(`keeps one-cell sizes, full spans and CSS guide pitch coherent in ${flow} ${sizing}`, async () => {
        const dashboard = await createDashboard(flow, sizing);
        const [a, b, c] = panelBounds(dashboard);
        const canvas = dashboard.shadowRoot!.querySelector<HTMLElement>('.canvas')!;
        const probe = document.createElement('div');

        probe.style.cssText = 'position:absolute;visibility:hidden;width:var(--_pitch-x);height:var(--_pitch-y)';
        canvas.append(probe);

        const guide = probe.getBoundingClientRect();

        probe.remove();

        if (flow === 'vertical') {
          expect(guide.width).toBeCloseTo((b.left - a.left) / 2, 2);
          expect(guide.height).toBeCloseTo((c.top - a.top) / 2, 2);
          expect(c.width).toBeCloseTo(canvas.getBoundingClientRect().width, 2);

          if (sizing === 'fixed') {
            expect(a.width).toBe(159);
          }
        } else {
          expect(guide.height).toBeCloseTo((b.top - a.top) / 2, 2);
          expect(guide.width).toBeCloseTo((c.left - a.left) / 2, 2);
          expect(c.height).toBeCloseTo(canvas.getBoundingClientRect().height, 2);

          if (sizing === 'fixed') {
            expect(a.height).toBe(127);
          }
        }

        expect(canvas.style.backgroundImage).toBe('');
      });
    }
  }

  it('mirrors zero-gap seams while preserving logical saved coordinates in RTL', async () => {
    const dashboard = await createDashboard('horizontal', 'fixed', 'rtl');
    const [a, b, c] = panelBounds(dashboard);
    const canvas = dashboard.shadowRoot!.querySelector<HTMLElement>('.canvas')!;

    expect(a.bottom - b.top).toBeCloseTo(1, 2);
    expect(a.right).toBeCloseTo(canvas.getBoundingClientRect().right, 2);
    expect(c.left).toBeLessThan(a.left);
    expect(JSON.parse(dashboard.value).items).toEqual([
      { id: 'a', column: 0, row: 0, columnSpan: 2, rowSpan: 2 },
      { id: 'b', column: 0, row: 2, columnSpan: 2, rowSpan: 2 },
      { id: 'c', column: 2, row: 0, columnSpan: 2, rowSpan: 4 }
    ]);
  });

  it('tracks native CSS border widths including stylesheet-only changes and positive gap transitions', async () => {
    const dashboard = await createDashboard();
    const value = dashboard.value;
    const input = dashboard.querySelector('input')!;

    for (const width of [3, 2]) {
      panels(dashboard).forEach(panel => panel.style.setProperty('--border', `${width}px solid gray`));
      await waitOverlap(dashboard, width);
    }

    const style = sheet(3);

    await waitOverlap(dashboard, 3);

    style.replaceSync('#spacing-dashboard > nve-dashboard-panel { --border:1px solid gray !important; }');
    await waitOverlap(dashboard, 1);

    dashboard.style.setProperty('--gap', '0.5px');
    await waitOverlap(dashboard, -0.5);

    style.replaceSync('#spacing-dashboard > nve-dashboard-panel { --border:2px solid gray !important; }');
    dashboard.style.setProperty('--gap', '0px');
    await waitOverlap(dashboard, 2);

    dashboard.style.setProperty('--gap', '0.001px');
    await waitOverlap(dashboard, 0);

    const [a, b] = panelBounds(dashboard);
    const canvas = dashboard.shadowRoot!.querySelector<HTMLElement>('.canvas')!;
    const guide = document.createElement('div');

    guide.style.cssText = 'position:absolute;visibility:hidden;width:var(--_pitch-x)';
    canvas.append(guide);

    expect(guide.getBoundingClientRect().width).toBeCloseTo((b.left - a.left) / 2, 2);

    guide.remove();
    dashboard.style.setProperty('--gap', '0px');
    await waitOverlap(dashboard, 2);

    expect(dashboard.value).toBe(value);
    expect(dashboard.querySelector('input')).toBe(input);
    expect(input.value).toBe('Retained draft');
  });

  it('reconciles hidden, removed and replaced border measurement targets without changing content identity', async () => {
    const dashboard = await createDashboard();
    const input = dashboard.querySelector('input')!;
    const extra = document.createElement('nve-dashboard-panel');

    extra.id = 'extra';
    extra.innerHTML = '<nve-dashboard-panel-header>Extra</nve-dashboard-panel-header>';
    extra.style.setProperty('--border', '3px solid gray');
    dashboard.append(extra);
    await waitOverlap(dashboard, 0);

    extra.hidden = true;
    await waitOverlap(dashboard, 1);

    extra.hidden = false;
    await waitOverlap(dashboard, 0);

    extra.remove();
    await waitOverlap(dashboard, 1);

    const original = dashboard.querySelector('#b')!;
    const replacement = original.cloneNode(true) as DashboardPanel;

    replacement.style.setProperty('--border', '2px solid gray');
    original.replaceWith(replacement);
    await waitOverlap(dashboard, 0);

    replacement.style.removeProperty('--border');
    await waitOverlap(dashboard, 1);

    expect(dashboard.querySelector('input')).toBe(input);
  });

  it('reconnects after detached CSS and value changes and settles without recurring updates', async () => {
    const dashboard = await createDashboard();
    const parent = dashboard.parentNode!;
    const value = dashboard.value;

    dashboard.remove();
    sheet(3);

    const restored: DashboardLayout = JSON.parse(value);

    dashboard.value = JSON.stringify({
      ...restored,
      items: restored.items.map(item => (item.id === 'a' ? { ...item, row: 4 } : item))
    });
    dashboard.requestUpdate();
    parent.appendChild(dashboard);
    await waitOverlap(dashboard, 3);
    await frames();

    const update = vi.spyOn(dashboard, 'requestUpdate');

    await frames();

    expect(update).not.toHaveBeenCalled();

    const canvas = dashboard.shadowRoot!.querySelector<HTMLElement>('.canvas')!;

    expect(dashboard.querySelector('#a')!.getBoundingClientRect().top - canvas.getBoundingClientRect().top).toBe(244);
    expect(dashboard.shadowRoot!.querySelector<HTMLElement>('.canvas')!.hidden).toBe(false);
  });
});
