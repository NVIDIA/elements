// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createFixture, elementIsStable, removeFixture } from '@internals/testing';

import type { Dashboard, DashboardLayout, DashboardPanel } from './index.js';

import './define.js';

const initial: DashboardLayout = {
  version: 1,
  grid: { flow: 'vertical', tracks: 4 },
  items: [
    { id: 'a', column: 0, row: 0, columnSpan: 4, rowSpan: 2 },
    { id: 'b', column: 0, row: 2, columnSpan: 4, rowSpan: 2 }
  ]
};

const deferred: DashboardLayout = {
  version: 1,
  grid: { flow: 'horizontal', tracks: 4 },
  items: [
    { id: 'a', column: 2, row: 0, columnSpan: 2, rowSpan: 2 },
    { id: 'b', column: 6, row: 2, columnSpan: 2, rowSpan: 2 },
    { id: 'fresh', column: 8, row: 0, columnSpan: 2, rowSpan: 2 }
  ]
};

describe('dashboard live membership', () => {
  let fixture: HTMLElement | undefined;

  afterEach(() => {
    if (fixture) {
      removeFixture(fixture);
    }

    vi.restoreAllMocks();
  });

  async function stable(dashboard: Dashboard) {
    await Promise.resolve();
    await elementIsStable(dashboard);
    await Promise.all([...dashboard.querySelectorAll('nve-dashboard-panel')].map(panel => elementIsStable(panel)));
    await new Promise(requestAnimationFrame);
    await elementIsStable(dashboard);
  }

  async function createDashboard() {
    fixture = await createFixture(html`
      <nve-dashboard rearrangeable fullscreenable .value=${JSON.stringify(initial)} style="width:640px;height:360px;--row-size:64px;--animation-duration:0ms;--gap:8px">
        <nve-dashboard-panel id="a" min-column-span="2"><nve-dashboard-panel-header>First</nve-dashboard-panel-header><input aria-label="First draft" value="Retained draft" /></nve-dashboard-panel>
        <nve-dashboard-panel id="b" min-column-span="2"><nve-dashboard-panel-header>Second</nve-dashboard-panel-header>Second content</nve-dashboard-panel>
      </nve-dashboard>
    `);
    const dashboard = fixture.querySelector<Dashboard>('nve-dashboard')!;

    await stable(dashboard);

    return dashboard;
  }

  function createPanel(id: string) {
    const panel = document.createElement('nve-dashboard-panel');
    const header = document.createElement('nve-dashboard-panel-header');
    const input = document.createElement('input');

    panel.id = id;
    panel.minColumnSpan = 2;
    header.textContent = 'Added panel';
    input.value = 'Application draft';
    input.style.visibility = 'visible';
    panel.append(header, input);

    return panel;
  }

  function findItem(dashboard: Dashboard, id: string) {
    const layout: DashboardLayout = JSON.parse(dashboard.value);
    return layout.items.find(candidate => candidate.id === id);
  }

  function getBounds(panel: HTMLElement) {
    const { x, y, width, height } = panel.getBoundingClientRect();
    return { x, y, width, height };
  }

  it('places a newly inserted panel before the first rendering update', async () => {
    fixture = await createFixture(html`<div></div>`);
    const dashboard = document.createElement('nve-dashboard');
    const panel = createPanel('fresh');
    const placement = { column: 2, row: 4, columnSpan: 2, rowSpan: 2 };
    const change = vi.fn();

    dashboard.rearrangeable = true;
    dashboard.style.cssText = 'width:640px;height:360px;--animation-duration:0ms';
    dashboard.addEventListener('change', change);
    dashboard.append(panel);
    fixture.append(dashboard);

    expect(dashboard.isCommandAvailable('--place', { value: 'fresh', placement })).toBe(true);
    expect(dashboard.place('fresh', placement)).toBe(true);
    expect(findItem(dashboard, 'fresh')).toEqual({ id: 'fresh', column: 2, row: 4, columnSpan: 2, rowSpan: 2 });
    expect(change).toHaveBeenCalledOnce();

    await stable(dashboard);

    expect(change).toHaveBeenCalledOnce();
    expect(panel.getBoundingClientRect().width).toBeGreaterThan(0);
  });

  for (const scenario of [
    { name: 'new panel', target: 'fresh', placement: { column: 2, row: 6, columnSpan: 2, rowSpan: 2 } },
    { name: 'existing panel', target: 'a', placement: { column: 0, row: 8, columnSpan: 4, rowSpan: 2 } }
  ]) {
    it(`places the ${scenario.name} immediately after insertion with one change event`, async () => {
      const dashboard = await createDashboard();
      const change = vi.fn();

      dashboard.addEventListener('change', change);
      dashboard.append(createPanel('fresh'));

      expect(dashboard.isCommandAvailable('--place', { value: scenario.target, placement: scenario.placement })).toBe(
        true
      );
      expect(dashboard.place(scenario.target, scenario.placement)).toBe(true);
      expect(findItem(dashboard, scenario.target)).toEqual({ id: scenario.target, ...scenario.placement });
      expect(change).toHaveBeenCalledOnce();

      await stable(dashboard);

      expect(change).toHaveBeenCalledOnce();
    });
  }

  it('places against current membership immediately after removal and replacement', async () => {
    const dashboard = await createDashboard();
    const change = vi.fn();
    const second = dashboard.querySelector<DashboardPanel>('#b')!;
    const placement = { column: 0, row: 2, columnSpan: 4, rowSpan: 2 };

    dashboard.addEventListener('change', change);
    second.remove();

    expect(dashboard.isCommandAvailable('--place', { value: 'a', placement })).toBe(true);
    expect(dashboard.place('a', placement)).toBe(true);

    const replacement = createPanel('a');
    dashboard.querySelector('#a')!.replaceWith(replacement);

    expect(dashboard.place('a', { column: 0, row: 6, columnSpan: 4, rowSpan: 2 })).toBe(true);
    expect(change).toHaveBeenCalledTimes(2);

    await stable(dashboard);

    expect(findItem(dashboard, 'a')?.row).toBe(6);
    expect(change).toHaveBeenCalledTimes(2);
    expect(replacement.getBoundingClientRect().width).toBeGreaterThan(0);
  });

  it('removes named-slot panels from settling and command membership until they return', async () => {
    const dashboard = await createDashboard();
    const second = dashboard.querySelector<DashboardPanel>('#b')!;
    const third = createPanel('c');

    dashboard.append(third);
    dashboard.value = JSON.stringify({
      ...initial,
      items: [...initial.items, { id: 'c', column: 0, row: 4, columnSpan: 4, rowSpan: 2 }]
    });
    dashboard.autoSettle = true;
    await stable(dashboard);

    second.slot = 'unused';

    expect(
      dashboard.isCommandAvailable('--place', {
        value: 'b',
        placement: { column: 0, row: 8, columnSpan: 4, rowSpan: 2 }
      })
    ).toBe(false);
    expect(dashboard.place('b', { column: 0, row: 8, columnSpan: 4, rowSpan: 2 })).toBe(false);

    await stable(dashboard);

    expect(findItem(dashboard, 'c')?.row).toBe(2);
    expect(findItem(dashboard, 'b')).toBeUndefined();
    expect(second.getBoundingClientRect().width).toBe(0);

    second.slot = '';
    await stable(dashboard);

    expect(findItem(dashboard, 'c')?.row).toBe(2);
    expect(findItem(dashboard, 'b')?.row).toBe(4);
    expect(second.getBoundingClientRect().width).toBeGreaterThan(0);
  });

  it('admits valid peers and returning panels immediately after slot reassignment', async () => {
    const dashboard = await createDashboard();
    const second = dashboard.querySelector<DashboardPanel>('#b')!;
    const change = vi.fn();

    dashboard.addEventListener('change', change);
    second.slot = 'unused';

    expect(dashboard.place('a', { column: 0, row: 2, columnSpan: 4, rowSpan: 2 })).toBe(true);

    second.slot = '';
    const placement = { column: 0, row: 6, columnSpan: 4, rowSpan: 2 };

    expect(dashboard.isCommandAvailable('--place', { value: 'b', placement })).toBe(true);
    expect(dashboard.place('b', placement)).toBe(true);
    await stable(dashboard);

    expect(findItem(dashboard, 'b')?.row).toBe(6);
    expect(change).toHaveBeenCalledTimes(2);
  });

  it('ignores an already named-slot newcomer when assigning first-fit space', async () => {
    const dashboard = await createDashboard();
    const named = createPanel('named');
    named.slot = 'unused';

    dashboard.append(named, createPanel('visible'));
    await stable(dashboard);

    expect(findItem(dashboard, 'named')).toBeUndefined();
    expect(findItem(dashboard, 'visible')).toEqual({ id: 'visible', column: 0, row: 4, columnSpan: 2, rowSpan: 1 });
    expect(named.getBoundingClientRect().width).toBe(0);
  });

  for (const scenario of [
    { name: 'missing live ID', id: '' },
    { name: 'duplicate live ID inserted before the original', id: 'a' }
  ]) {
    it(`defers valid restoration through a ${scenario.name}`, async () => {
      const dashboard = await createDashboard();
      const first = dashboard.querySelector<DashboardPanel>('#a')!;
      const previous = getBounds(first);
      const newcomer = createPanel(scenario.id);
      const input = newcomer.querySelector('input')!;
      const change = vi.fn();

      dashboard.addEventListener('change', change);
      dashboard.prepend(newcomer);
      dashboard.value = JSON.stringify(deferred);
      await stable(dashboard);

      expect(JSON.parse(dashboard.value)).toEqual(deferred);
      expect(getBounds(first)).toEqual(previous);
      expect(newcomer.getBoundingClientRect().width).toBe(0);
      expect(newcomer.hidden).toBe(false);
      expect(newcomer.inert).toBe(false);
      input.focus();
      expect(document.activeElement).not.toBe(input);
      expect(change).not.toHaveBeenCalled();

      newcomer.id = 'fresh';
      await stable(dashboard);

      expect(JSON.parse(dashboard.value)).toEqual(deferred);
      expect(newcomer.getBoundingClientRect().width).toBeGreaterThan(0);
      expect(first.querySelector('input')!.value).toBe('Retained draft');
      expect(input.value).toBe('Application draft');
      expect(change).not.toHaveBeenCalled();
    });
  }

  it('retains the last presentation when repaired IDs still have incompatible constraints', async () => {
    const dashboard = await createDashboard();
    const first = dashboard.querySelector<DashboardPanel>('#a')!;
    const previous = getBounds(first);
    const newcomer = createPanel('');
    const change = vi.fn();
    const requested: DashboardLayout = {
      version: 1,
      grid: { flow: 'vertical', tracks: 1 },
      items: [
        { id: 'a', column: 0, row: 0, columnSpan: 1, rowSpan: 2 },
        { id: 'b', column: 0, row: 2, columnSpan: 1, rowSpan: 2 },
        { id: 'fresh', column: 0, row: 4, columnSpan: 1, rowSpan: 2 }
      ]
    };

    dashboard.addEventListener('change', change);
    dashboard.append(newcomer);
    dashboard.value = JSON.stringify(requested);
    newcomer.id = 'fresh';
    await stable(dashboard);

    expect(JSON.parse(dashboard.value)).toEqual(requested);
    expect(getBounds(first)).toEqual(previous);
    expect(newcomer.getBoundingClientRect().width).toBe(0);
    expect(change).not.toHaveBeenCalled();

    for (const panel of dashboard.querySelectorAll('nve-dashboard-panel')) {
      panel.minColumnSpan = 1;
    }
    await stable(dashboard);

    expect(first.getBoundingClientRect().width).toBe(640);
    expect(newcomer.getBoundingClientRect().width).toBe(640);
    expect(change).not.toHaveBeenCalled();
  });

  it('keeps malformed restoration and valid-catalog constraint errors atomic', async () => {
    const dashboard = await createDashboard();
    const value = dashboard.value;

    expect(() => {
      dashboard.value = JSON.stringify({ ...initial, items: [{ column: 0, row: 0, columnSpan: 2, rowSpan: 2 }] });
    }).toThrow(TypeError);
    expect(dashboard.value).toBe(value);

    expect(() => {
      dashboard.value = JSON.stringify({ ...initial, grid: { flow: 'vertical', tracks: 1 }, items: [] });
    }).toThrow(RangeError);
    expect(dashboard.value).toBe(value);
  });

  it('releases an empty presentation and places a later catalog without old DOM ownership', async () => {
    const dashboard = await createDashboard();
    const prior = [...dashboard.children];

    dashboard.replaceChildren();
    await stable(dashboard);

    expect(JSON.parse(dashboard.value).items).toEqual([]);

    const newcomer = createPanel('fresh');
    const placement = { column: 2, row: 6, columnSpan: 2, rowSpan: 2 };
    dashboard.append(newcomer);

    expect(dashboard.place('fresh', placement)).toBe(true);
    await stable(dashboard);

    expect(prior.every(panel => !panel.isConnected)).toBe(true);
    expect(newcomer.getBoundingClientRect().width).toBeGreaterThan(0);
    expect(findItem(dashboard, 'fresh')).toEqual({ id: 'fresh', ...placement });
  });

  it('removes the saved record and emits one change when a child is removed', async () => {
    const dashboard = await createDashboard();
    const change = vi.fn();

    dashboard.addEventListener('change', change);
    dashboard.querySelector('#b')!.remove();
    await stable(dashboard);

    expect(JSON.parse(dashboard.value).items).toEqual([initial.items[0]]);
    expect(change).toHaveBeenCalledOnce();
  });

  it('assigns fresh placement on re-add while retaining the application node and input', async () => {
    const dashboard = await createDashboard();
    const panel = dashboard.querySelector<DashboardPanel>('#b')!;
    const input = document.createElement('input');

    input.value = 'Application-owned draft';
    panel.append(input);
    dashboard.place('b', { column: 0, row: 8, columnSpan: 4, rowSpan: 2 });
    panel.remove();
    await stable(dashboard);

    expect(findItem(dashboard, 'b')).toBeUndefined();

    dashboard.append(panel);
    await stable(dashboard);

    expect(findItem(dashboard, 'b')).toEqual({ id: 'b', column: 0, row: 2, columnSpan: 2, rowSpan: 1 });
    expect(panel.querySelector('input')).toBe(input);
    expect(input.value).toBe('Application-owned draft');
  });

  it('retains placement through same-batch removal and replacement', async () => {
    const dashboard = await createDashboard();
    const second = dashboard.querySelector<DashboardPanel>('#b')!;
    const change = vi.fn();

    dashboard.addEventListener('change', change);
    second.remove();
    dashboard.append(createPanel('b'));
    await stable(dashboard);

    expect(JSON.parse(dashboard.value)).toEqual(initial);
    expect(change).not.toHaveBeenCalled();
  });

  it('consumes unmatched authored records when a connected empty catalog is valid', async () => {
    fixture = await createFixture(html`<div></div>`);
    const dashboard = document.createElement('nve-dashboard');

    dashboard.value = JSON.stringify(initial);
    expect(JSON.parse(dashboard.value)).toEqual(initial);

    fixture.append(dashboard);
    await stable(dashboard);

    expect(JSON.parse(dashboard.value)).toEqual({ ...initial, items: [] });

    dashboard.append(createPanel('b'));
    await stable(dashboard);

    expect(findItem(dashboard, 'b')).toEqual({ id: 'b', column: 0, row: 0, columnSpan: 2, rowSpan: 1 });
  });

  it('retains detached authored input until reconnection even after an earlier connection', async () => {
    const dashboard = await createDashboard();

    dashboard.remove();
    dashboard.replaceChildren();
    dashboard.value = JSON.stringify(initial);
    await dashboard.updateComplete;

    expect(JSON.parse(dashboard.value)).toEqual(initial);

    dashboard.append(createPanel('a'), createPanel('b'));
    fixture!.append(dashboard);
    await stable(dashboard);

    expect(JSON.parse(dashboard.value)).toEqual(initial);
  });

  it('keeps hidden ownership without allowing constraints or placement to obstruct visible panels', async () => {
    const dashboard = await createDashboard();
    const second = dashboard.querySelector<DashboardPanel>('#b')!;

    second.hidden = true;
    second.minColumnSpan = 8;
    await stable(dashboard);

    expect(findItem(dashboard, 'b')).toEqual(initial.items[1]);
    expect(dashboard.isCommandAvailable('--move-down', { value: 'b' })).toBe(false);
    expect(dashboard.place('a', { column: 0, row: 2, columnSpan: 4, rowSpan: 2 })).toBe(true);
    expect(findItem(dashboard, 'b')).toEqual(initial.items[1]);

    dashboard.autoSettle = true;
    await stable(dashboard);

    expect(findItem(dashboard, 'a')?.row).toBe(0);
    expect(findItem(dashboard, 'b')).toEqual(initial.items[1]);
  });

  it('repairs visible collisions when a retained hidden panel returns', async () => {
    const dashboard = await createDashboard();
    const first = dashboard.querySelector<DashboardPanel>('#a')!;

    first.hidden = true;
    await stable(dashboard);
    dashboard.place('b', { column: 0, row: 0, columnSpan: 4, rowSpan: 2 });
    first.hidden = false;
    await stable(dashboard);

    expect(findItem(dashboard, 'b')?.row).toBe(0);
    expect(findItem(dashboard, 'a')?.row).toBe(2);
  });

  it('defers restoration when a hidden member has an incomplete identity', async () => {
    const dashboard = await createDashboard();
    const hidden = createPanel('');

    hidden.hidden = true;
    dashboard.append(hidden);
    dashboard.value = JSON.stringify(initial);
    await stable(dashboard);

    expect(JSON.parse(dashboard.value)).toEqual(initial);

    hidden.id = 'hidden';
    await stable(dashboard);

    expect(findItem(dashboard, 'hidden')).toEqual({ id: 'hidden', column: 0, row: 0, columnSpan: 1, rowSpan: 1 });
    expect(hidden.hidden).toBe(true);
  });

  function pointer(type: string, x: number, y: number) {
    return new PointerEvent(type, {
      clientX: x,
      clientY: y,
      pointerId: 5,
      isPrimary: true,
      button: 0,
      buttons: type === 'pointerdown' || type === 'pointermove' ? 1 : 0,
      bubbles: true,
      composed: true,
      cancelable: true
    });
  }

  function beginMove(dashboard: Dashboard, panel: DashboardPanel) {
    const grip = panel.shadowRoot!.querySelector<HTMLElement>('[data-dashboard-action="move"]')!;
    const rect = grip.getBoundingClientRect();
    const start = { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };

    vi.spyOn(dashboard, 'setPointerCapture').mockImplementation(() => {});
    grip.dispatchEvent(pointer('pointerdown', start.x, start.y));
    dashboard.dispatchEvent(pointer('pointermove', start.x, start.y + 144));

    return { x: start.x, y: start.y + 144 };
  }

  it('restores committed peer geometry when an incomplete newcomer interrupts a pointer preview', async () => {
    const dashboard = await createDashboard();
    const first = dashboard.querySelector<DashboardPanel>('#a')!;
    const second = dashboard.querySelector<DashboardPanel>('#b')!;
    const previous = getBounds(second);
    const value = dashboard.value;
    const change = vi.fn();

    dashboard.addEventListener('change', change);
    const end = beginMove(dashboard, first);
    await stable(dashboard);

    expect(dashboard.shadowRoot!.querySelector('nve-ghost')).not.toBeNull();
    expect(getBounds(second)).not.toEqual(previous);

    dashboard.append(createPanel(''));
    await stable(dashboard);
    dashboard.dispatchEvent(pointer('pointerup', end.x, end.y));
    await stable(dashboard);

    expect(dashboard.value).toBe(value);
    expect(getBounds(second)).toEqual(previous);
    expect(dashboard.shadowRoot!.querySelector('nve-ghost')).toBeNull();
    expect(change).not.toHaveBeenCalled();
  });

  it('rejects a captured panel replaced by an identically named node before release', async () => {
    const dashboard = await createDashboard();
    const first = dashboard.querySelector<DashboardPanel>('#a')!;
    const value = dashboard.value;
    const change = vi.fn();
    const end = beginMove(dashboard, first);

    dashboard.addEventListener('change', change);
    first.replaceWith(createPanel('a'));
    dashboard.dispatchEvent(pointer('pointerup', end.x, end.y));
    await stable(dashboard);

    expect(dashboard.value).toBe(value);
    expect(dashboard.shadowRoot!.querySelector('nve-ghost')).toBeNull();
    expect(change).not.toHaveBeenCalled();
  });

  it('keeps a gesture active when framework anchors and unrelated controls change', async () => {
    const dashboard = await createDashboard();
    const first = dashboard.querySelector<DashboardPanel>('#a')!;
    const value = dashboard.value;
    const change = vi.fn();
    const end = beginMove(dashboard, first);
    const anchor = document.createComment('framework anchor');
    const button = document.createElement('button');

    dashboard.addEventListener('change', change);
    dashboard.append(anchor, button);
    await stable(dashboard);
    anchor.remove();
    button.remove();
    await stable(dashboard);

    expect(dashboard.shadowRoot!.querySelector('nve-ghost')).not.toBeNull();
    dashboard.dispatchEvent(pointer('pointerup', end.x, end.y));
    await stable(dashboard);

    expect(dashboard.value).not.toBe(value);
    expect(change).toHaveBeenCalledOnce();
  });

  it('withholds a reparented panel in an incomplete host and admits it immediately after repair', async () => {
    const dashboard = await createDashboard();
    const first = dashboard.querySelector<DashboardPanel>('#a')!;
    const input = first.querySelector('input')!;
    const other = document.createElement('nve-dashboard');
    const incomplete = createPanel('');
    const placement = { column: 0, row: 4, columnSpan: 4, rowSpan: 2 };

    other.rearrangeable = true;
    other.tracks = 4;
    other.style.cssText = 'width:640px;height:360px;--animation-duration:0ms';
    other.append(incomplete);
    fixture!.append(other);
    await stable(other);

    other.append(first);
    await stable(other);

    expect(first.getBoundingClientRect().width).toBe(0);
    expect(other.place('a', placement)).toBe(false);

    incomplete.remove();

    expect(other.isCommandAvailable('--place', { value: 'a', placement })).toBe(true);
    expect(other.place('a', placement)).toBe(true);
    await stable(other);

    expect(first.getBoundingClientRect().width).toBe(640);
    expect(first.querySelector('input')).toBe(input);
    expect(input.value).toBe('Retained draft');
  });

  it('notifies observed availability changes while identity remains incomplete', async () => {
    const dashboard = await createDashboard();
    const available = vi.fn();

    dashboard.addEventListener('commandavailabilitychange', available);
    dashboard.append(createPanel(''));
    await stable(dashboard);

    expect(available).toHaveBeenCalled();
    expect(
      dashboard.isCommandAvailable('--place', {
        value: 'a',
        placement: { column: 0, row: 8, columnSpan: 4, rowSpan: 2 }
      })
    ).toBe(false);
  });
});
