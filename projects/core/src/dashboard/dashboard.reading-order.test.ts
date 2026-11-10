// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';

import { createFixture, elementIsStable, removeFixture } from '@internals/testing';

import type { Dashboard, DashboardItem, DashboardLayout, DashboardPanel } from './index.js';

import './define.js';

const items: DashboardItem[] = [
  { id: 'a', column: 2, row: 0, columnSpan: 2, rowSpan: 2 },
  { id: 'b', column: 0, row: 2, columnSpan: 2, rowSpan: 2 },
  { id: 'c', column: 0, row: 0, columnSpan: 2, rowSpan: 2 }
];

describe('dashboard native spatial reading order', () => {
  let fixture: HTMLElement | undefined;

  afterEach(() => {
    if (fixture) {
      removeFixture(fixture);
    }

    vi.restoreAllMocks();
  });

  async function stable(dashboard: Dashboard) {
    await elementIsStable(dashboard);
    await Promise.all(
      [...dashboard.querySelectorAll<DashboardPanel>('nve-dashboard-panel')].map(panel => elementIsStable(panel))
    );
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    await elementIsStable(dashboard);
  }

  async function createDashboard(
    options: { flow?: 'vertical' | 'horizontal'; direction?: 'ltr' | 'rtl'; items?: DashboardItem[] } = {}
  ) {
    const records = options.items ?? items;
    const value: DashboardLayout = {
      version: 1,
      grid: { flow: options.flow ?? 'vertical', tracks: 6 },
      items: records
    };

    fixture = await createFixture(html`<div id="reading-parent" dir=${options.direction ?? 'ltr'}>
      <button id="before">Before dashboard</button>
      <nve-dashboard rearrangeable sizing="fixed" .value=${JSON.stringify(value)} style="width:560px;height:360px;--column-size:72px;--row-size:56px;--gap:8px;--animation-duration:0ms">
        ${records.map(
          record => html`<nve-dashboard-panel id=${record.id}>
          <nve-dashboard-panel-header>${record.id}<button id=${`${record.id}-header`} slot="suffix">Header</button></nve-dashboard-panel-header>
          <nve-dashboard-panel-content><input id=${`${record.id}-input`} aria-label=${`${record.id} draft`} value="Retained draft" /><a id=${`${record.id}-link`} href="#details">Details</a></nve-dashboard-panel-content>
          <nve-dashboard-panel-footer><button id=${`${record.id}-footer`}>Footer</button></nve-dashboard-panel-footer>
        </nve-dashboard-panel>`
        )}</nve-dashboard>
      <button id="after">After dashboard</button>
    </div>`);

    const dashboard = fixture.querySelector<Dashboard>('nve-dashboard')!;

    await stable(dashboard);
    await vi.waitFor(() =>
      expect(dashboard.querySelector<HTMLElement>('nve-dashboard-panel')!.style.width).not.toBe('')
    );

    return dashboard;
  }

  function activeLabel() {
    let element = document.activeElement;

    while (element?.shadowRoot?.activeElement) {
      element = element.shadowRoot.activeElement;
    }

    if (!element) return 'none';
    if (element.id) return element.id;

    return ownedLabel(element);
  }

  function ownedLabel(element: Element) {
    let current: Element | null = element;
    let action = '';
    let body = false;

    while (current) {
      if (current instanceof HTMLElement && current.dataset.dashboardAction) {
        action = current.dataset.dashboardAction;
      }

      if (current.classList.contains('body')) {
        body = true;
      }

      if (current.tagName === 'NVE-DASHBOARD-PANEL') return `${current.id}-${action || (body ? 'body' : 'unknown')}`;

      const root = current.getRootNode();

      current = current.parentElement ?? (root instanceof ShadowRoot ? root.host : null);
    }

    return element.tagName;
  }

  function expected(order: string[]) {
    return order.flatMap(id =>
      ['move', 'header', 'body', 'input', 'link', 'footer', 'resize'].map(part => `${id}-${part}`)
    );
  }

  async function traverse(reverse = false) {
    fixture!.querySelector<HTMLElement>(reverse ? '#after' : '#before')!.focus();

    const result: string[] = [];

    for (let index = 0; index < 30; index++) {
      await userEvent.keyboard(reverse ? '{Shift>}{Tab}{/Shift}' : '{Tab}');

      const label = activeLabel();

      result.push(label);

      if (label === (reverse ? 'before' : 'after')) break;
    }

    return result;
  }

  function appTabIndices(dashboard: Dashboard) {
    return [...dashboard.querySelectorAll('button,input,a')].map(element => [
      element,
      element.getAttribute('tabindex')
    ]);
  }

  for (const test of [
    { flow: 'vertical', direction: 'ltr', order: ['c', 'a', 'b'] },
    { flow: 'vertical', direction: 'rtl', order: ['c', 'a', 'b'] },
    { flow: 'horizontal', direction: 'ltr', order: ['c', 'b', 'a'] },
    { flow: 'horizontal', direction: 'rtl', order: ['c', 'b', 'a'] }
  ] as const) {
    it(`tabs through whole panel groups in ${test.flow} ${test.direction} without changing application order or tabindex`, async () => {
      const dashboard = await createDashboard(test);
      const nodes = [...dashboard.children];
      const tabs = appTabIndices(dashboard);

      expect(await traverse()).toEqual([...expected([...test.order]), 'after']);
      expect(await traverse(true)).toEqual([...expected([...test.order]).reverse(), 'before']);
      expect([...dashboard.children]).toEqual(nodes);
      expect(appTabIndices(dashboard)).toEqual(tabs);
      expect(dashboard.querySelector('[tabindex]:not([tabindex="0"]):not([tabindex="-1"])')).toBeNull();
    });
  }

  it('orders unequal-width RTL panels by their logical starting column', async () => {
    await createDashboard({
      flow: 'horizontal',
      direction: 'rtl',
      items: [
        { id: 'a', column: 3, row: 0, columnSpan: 1, rowSpan: 2 },
        { id: 'b', column: 1, row: 2, columnSpan: 4, rowSpan: 2 },
        { id: 'c', column: 0, row: 4, columnSpan: 2, rowSpan: 2 }
      ]
    });

    expect(await traverse()).toEqual([...expected(['c', 'b', 'a']), 'after']);
  });

  it('responds to inherited direction changes while retaining the active application input and selection on commit', async () => {
    const dashboard = await createDashboard();
    const nodes = [...dashboard.children];
    const input = dashboard.querySelector<HTMLInputElement>('#a-input')!;

    input.focus();
    input.setSelectionRange(2, 7);

    expect(dashboard.place('a', { column: 2, row: 3, columnSpan: 2, rowSpan: 2 })).toBe(true);
    await stable(dashboard);

    expect(document.activeElement).toBe(input);
    expect([input.selectionStart, input.selectionEnd]).toEqual([2, 7]);

    await userEvent.keyboard('{Tab}');

    expect(activeLabel()).toBe('a-link');
    expect(await traverse()).toEqual([...expected(['c', 'b', 'a']), 'after']);

    fixture!.querySelector<HTMLElement>('#reading-parent')!.dir = 'rtl';

    expect(await traverse()).toEqual([...expected(['c', 'b', 'a']), 'after']);

    dashboard.value = JSON.stringify({ version: 1, grid: { flow: 'vertical', tracks: 6 }, items });
    await stable(dashboard);

    expect(await traverse()).toEqual([...expected(['c', 'a', 'b']), 'after']);
    expect([...dashboard.children]).toEqual(nodes);
    expect(dashboard.querySelector('#a-input')).toBe(input);
    expect(input.value).toBe('Retained draft');
  });

  it('keeps preview traversal committed and updates ranks only after release, restore and membership changes', async () => {
    const dashboard = await createDashboard();
    const initial = dashboard.value;
    const source = dashboard.querySelector<DashboardPanel>('#a')!;
    const control = source.shadowRoot!.querySelector<HTMLElement>('[data-dashboard-action="move"]')!;

    const ranks = () =>
      [...dashboard.querySelectorAll('nve-dashboard-panel')].map(panel =>
        getComputedStyle(panel).getPropertyValue('reading-order')
      );

    const before = ranks();
    const box = control.getBoundingClientRect();
    const start = { x: box.left + box.width / 2, y: box.top + box.height / 2 };

    vi.spyOn(control, 'setPointerCapture').mockImplementation(() => {});
    vi.spyOn(dashboard, 'setPointerCapture').mockImplementation(() => {});

    const sample = (type: string, y: number) =>
      new PointerEvent(type, {
        pointerId: 33,
        pointerType: 'mouse',
        isPrimary: true,
        button: 0,
        buttons: type === 'pointerup' ? 0 : 1,
        clientX: start.x,
        clientY: y,
        bubbles: true,
        composed: true,
        cancelable: true
      });

    control.dispatchEvent(sample('pointerdown', start.y));
    dashboard.dispatchEvent(sample('pointermove', start.y + 192));
    await stable(dashboard);

    expect(dashboard.shadowRoot!.querySelector('nve-ghost')).not.toBeNull();
    expect(dashboard.value).toBe(initial);
    expect(ranks()).toEqual(before);

    dashboard.dispatchEvent(sample('pointerup', start.y + 192));
    await stable(dashboard);

    expect(await traverse()).toEqual([...expected(['c', 'b', 'a']), 'after']);

    dashboard.value = initial;
    await stable(dashboard);

    expect(await traverse()).toEqual([...expected(['c', 'a', 'b']), 'after']);

    const removed = dashboard.querySelector('#c')!;

    removed.remove();
    await stable(dashboard);

    expect(await traverse()).toEqual([...expected(['a', 'b']), 'after']);

    dashboard.append(removed);
    await stable(dashboard);

    expect(await traverse()).toEqual([...expected(['c', 'a', 'b']), 'after']);
    expect([...dashboard.children].map(panel => panel.id)).toEqual(['a', 'b', 'c']);
  });
});
