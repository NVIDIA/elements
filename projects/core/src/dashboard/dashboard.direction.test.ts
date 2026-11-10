// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';

import { createFixture, elementIsStable, removeFixture } from '@internals/testing';

import type { Dashboard, DashboardItem, DashboardLayout, DashboardPanel } from './index.js';

import './define.js';

const items: DashboardItem[] = [
  { id: 'a', column: 0, row: 0, columnSpan: 2, rowSpan: 2 },
  { id: 'b', column: 2, row: 0, columnSpan: 2, rowSpan: 2 },
  { id: 'c', column: 4, row: 0, columnSpan: 2, rowSpan: 2 }
];

describe('dashboard logical grid placement', () => {
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

  async function createDashboard(flow: 'vertical' | 'horizontal' = 'vertical') {
    const value: DashboardLayout = { version: 1, grid: { flow, tracks: 6 }, items };

    fixture = await createFixture(html`<div dir="rtl">
      <nve-dashboard rearrangeable sizing="fixed" .value=${JSON.stringify(value)} style="width:520px;height:320px;--column-size:80px;--row-size:64px;--gap:8px;--animation-duration:0ms">
        ${items.map(item => html`<nve-dashboard-panel id=${item.id} min-column-span="1" max-column-span="4"><nve-dashboard-panel-header>${item.id}</nve-dashboard-panel-header><input aria-label=${item.id} value="Draft" /></nve-dashboard-panel>`)}
      </nve-dashboard>
    </div>`);

    const dashboard = fixture.querySelector<Dashboard>('nve-dashboard')!;

    await stable(dashboard);
    await vi.waitFor(() => expect(panel(dashboard, 'a').style.width).not.toBe(''));

    return dashboard;
  }

  const panel = (dashboard: Dashboard, id: string) => dashboard.querySelector<DashboardPanel>(`#${id}`)!;

  const item = (dashboard: Dashboard, id: string): DashboardItem =>
    JSON.parse(dashboard.value).items.find((record: DashboardItem) => record.id === id);

  const handle = (dashboard: Dashboard, action = 'move') =>
    panel(dashboard, 'a').shadowRoot!.querySelector<HTMLElement>(`.grip > [data-dashboard-action="${action}"]`)!;

  function event(type: string, x: number, y: number) {
    return new PointerEvent(type, {
      clientX: x,
      clientY: y,
      pointerId: 83,
      pointerType: 'mouse',
      isPrimary: true,
      button: 0,
      buttons: type === 'pointerup' ? 0 : 1,
      bubbles: true,
      composed: true,
      cancelable: true
    });
  }

  function press(dashboard: Dashboard, control: HTMLElement) {
    const rect = control.getBoundingClientRect();
    const point = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };

    vi.spyOn(dashboard, 'setPointerCapture').mockImplementation(() => {});
    control.dispatchEvent(event('pointerdown', point.x, point.y));

    return point;
  }

  async function drag(dashboard: Dashboard, control: HTMLElement, delta: { x: number; y?: number }) {
    const start = press(dashboard, control);

    dashboard.dispatchEvent(event('pointermove', start.x + delta.x, start.y + (delta.y ?? 0)));
    await stable(dashboard);

    dashboard.dispatchEvent(event('pointerup', start.x + delta.x, start.y + (delta.y ?? 0)));
    await stable(dashboard);
  }

  it('mirrors existing placements on an inherited direction change without changing values or application content', async () => {
    const dashboard = await createDashboard();
    const before = dashboard.value;
    const input = panel(dashboard, 'a').querySelector('input')!;
    const canvas = dashboard.shadowRoot!.querySelector('.canvas')!;

    expect(panel(dashboard, 'a').getBoundingClientRect().right).toBeCloseTo(canvas.getBoundingClientRect().right);
    expect(panel(dashboard, 'b').getBoundingClientRect().right).toBeLessThan(
      panel(dashboard, 'a').getBoundingClientRect().left
    );

    fixture!.firstElementChild!.setAttribute('dir', 'ltr');

    expect(panel(dashboard, 'a').getBoundingClientRect().left).toBeCloseTo(canvas.getBoundingClientRect().left);
    expect(dashboard.value).toBe(before);
    expect(panel(dashboard, 'a').querySelector('input')).toBe(input);
    expect(input.value).toBe('Draft');
  });

  it('uses physical keyboard arrows and matching invoker movement in RTL', async () => {
    const dashboard = await createDashboard();
    const initial = dashboard.value;

    handle(dashboard).focus();
    await userEvent.keyboard('{ArrowLeft}');
    await stable(dashboard);

    expect(item(dashboard, 'a')).toEqual({ id: 'a', column: 2, row: 0, columnSpan: 2, rowSpan: 2 });

    dashboard.value = initial;
    await stable(dashboard);

    dashboard.dispatchEvent(
      new CommandEvent('command', {
        command: '--move-left',
        source: Object.assign(document.createElement('button'), { value: 'a' })
      })
    );
    await stable(dashboard);

    expect(item(dashboard, 'a')).toEqual({ id: 'a', column: 2, row: 0, columnSpan: 2, rowSpan: 2 });

    handle(dashboard).focus();
    await userEvent.keyboard('{ArrowRight}');
    await stable(dashboard);

    expect(item(dashboard, 'a')).toEqual({ id: 'a', column: 0, row: 0, columnSpan: 2, rowSpan: 2 });
  });

  it('maps physical pointer movement back to logical columns and keeps the destination under the ghost', async () => {
    const dashboard = await createDashboard();
    const destination = panel(dashboard, 'b').getBoundingClientRect();
    const start = press(dashboard, handle(dashboard));

    dashboard.dispatchEvent(event('pointermove', start.x - 176, start.y));
    await stable(dashboard);

    const ghost = dashboard.shadowRoot!.querySelector<HTMLElement>('nve-ghost')!;
    const ghostBounds = ghost.getBoundingClientRect();

    expect(ghostBounds.left).toBeCloseTo(destination.left);
    expect(ghostBounds.right).toBeCloseTo(destination.right);
    expect(ghostBounds.top).toBeCloseTo(destination.top);

    dashboard.dispatchEvent(event('pointerup', start.x - 176, start.y));
    await stable(dashboard);

    expect(item(dashboard, 'a')).toEqual({ id: 'a', column: 2, row: 0, columnSpan: 2, rowSpan: 2 });
    expect(item(dashboard, 'b')).toEqual({ id: 'b', column: 0, row: 0, columnSpan: 2, rowSpan: 2 });
    expect(panel(dashboard, 'a').getBoundingClientRect().left).toBeCloseTo(ghostBounds.left);
  });

  it('grows the inline-end corner to the left while preserving the opposite edge and declared span limits', async () => {
    const dashboard = await createDashboard();
    const right = panel(dashboard, 'a').getBoundingClientRect().right;

    await drag(dashboard, handle(dashboard, 'resize'), { x: -88, y: 72 });

    expect(item(dashboard, 'a')).toEqual({ id: 'a', column: 0, row: 0, columnSpan: 3, rowSpan: 3 });
    expect(panel(dashboard, 'a').getBoundingClientRect().right).toBeCloseTo(right);

    await drag(dashboard, handle(dashboard, 'resize'), { x: -880 });

    expect(item(dashboard, 'a').columnSpan).toBe(4);
    expect(panel(dashboard, 'a').getBoundingClientRect().right).toBeCloseTo(right);
  });

  it('resizes the physical right edge toward inline start while keeping the left edge anchored', async () => {
    const dashboard = await createDashboard();

    dashboard.place('a', { column: 1, row: 3, columnSpan: 2, rowSpan: 2 });
    await stable(dashboard);

    const left = panel(dashboard, 'a').getBoundingClientRect().left;
    const edge = panel(dashboard, 'a').shadowRoot!.querySelector<HTMLElement>('[data-dashboard-edge="right"]')!;

    await drag(dashboard, edge, { x: 88 });

    expect(item(dashboard, 'a')).toEqual({ id: 'a', column: 0, row: 3, columnSpan: 3, rowSpan: 2 });
    expect(panel(dashboard, 'a').getBoundingClientRect().left).toBeCloseTo(left);
  });

  it('reveals growing horizontal columns through native negative RTL scrolling', async () => {
    const dashboard = await createDashboard('horizontal');

    dashboard.place('a', { column: 8, row: 2, columnSpan: 2, rowSpan: 2 });
    await stable(dashboard);

    handle(dashboard).focus();
    await userEvent.keyboard('{ArrowLeft}');
    await stable(dashboard);

    const viewport = dashboard.shadowRoot!.querySelector<HTMLElement>('.viewport')!;

    await vi.waitFor(() => expect(viewport.scrollLeft).toBeLessThan(0));

    const bounds = handle(dashboard).getBoundingClientRect();

    expect(bounds.left).toBeGreaterThanOrEqual(viewport.getBoundingClientRect().left - 1);
    expect(bounds.right).toBeLessThanOrEqual(viewport.getBoundingClientRect().right + 1);
    expect(item(dashboard, 'a').column).toBe(9);
  });

  it('cancels a stale pointer proposal if inherited direction changes before release', async () => {
    const dashboard = await createDashboard();
    const initial = dashboard.value;
    const start = press(dashboard, handle(dashboard));

    dashboard.dispatchEvent(event('pointermove', start.x - 176, start.y));
    await stable(dashboard);

    fixture!.firstElementChild!.setAttribute('dir', 'ltr');
    dashboard.dispatchEvent(event('pointerup', start.x - 176, start.y));
    await stable(dashboard);

    expect(dashboard.value).toBe(initial);
    expect(dashboard.shadowRoot!.querySelector('nve-ghost')).toBeNull();
  });

  it('keeps grid placement independent of a panel content direction and shares anchored resize behavior across pointer, keyboard, and invoker input', async () => {
    const dashboard = await createDashboard();
    const source = panel(dashboard, 'a');

    source.dir = 'ltr';

    expect(dashboard.place('a', { column: 1, row: 3, columnSpan: 2, rowSpan: 2 })).toBe(true);
    await stable(dashboard);

    const initial = dashboard.value;
    const expected = { id: 'a', column: 0, row: 3, columnSpan: 3, rowSpan: 2 };
    const canvas = dashboard.shadowRoot!.querySelector('.canvas')!.getBoundingClientRect();

    expect(source.getBoundingClientRect().right).toBeCloseTo(canvas.right - 88);
    expect(source.querySelector('input')!.matches(':dir(ltr)')).toBe(true);

    const left = source.getBoundingClientRect().left;

    handle(dashboard, 'resize').focus();
    await userEvent.keyboard('{ArrowRight}');
    await stable(dashboard);

    expect(item(dashboard, 'a')).toEqual(expected);
    expect(source.getBoundingClientRect().left).toBeCloseTo(left);

    dashboard.value = initial;
    await stable(dashboard);

    dashboard.dispatchEvent(
      new CommandEvent('command', {
        command: '--increase-width',
        source: Object.assign(document.createElement('button'), { value: 'a' })
      })
    );
    await stable(dashboard);

    expect(item(dashboard, 'a')).toEqual(expected);

    dashboard.value = initial;
    await stable(dashboard);
    await drag(dashboard, handle(dashboard, 'resize'), { x: 88 });

    expect(item(dashboard, 'a')).toEqual(expected);
    expect(source.getBoundingClientRect().left).toBeCloseTo(left);
    expect(dashboard.isCommandAvailable('--increase-width', { value: 'a' })).toBe(false);
  });

  it('uses the grid direction for pointer placement when the panel content direction differs', async () => {
    const dashboard = await createDashboard();

    panel(dashboard, 'a').dir = 'ltr';

    expect(dashboard.place('a', { column: 1, row: 3, columnSpan: 2, rowSpan: 2 })).toBe(true);
    await stable(dashboard);
    await drag(dashboard, handle(dashboard), { x: -88 });

    expect(item(dashboard, 'a')).toEqual({ id: 'a', column: 2, row: 3, columnSpan: 2, rowSpan: 2 });
  });

  it('rejects a pointer resize if a panel direction change moves its resize corner before release', async () => {
    const dashboard = await createDashboard();
    const initial = dashboard.value;
    const start = press(dashboard, handle(dashboard, 'resize'));

    dashboard.dispatchEvent(event('pointermove', start.x - 88, start.y));
    await stable(dashboard);

    panel(dashboard, 'a').dir = 'ltr';
    dashboard.dispatchEvent(event('pointerup', start.x - 88, start.y));
    await stable(dashboard);

    expect(dashboard.value).toBe(initial);
  });
});
