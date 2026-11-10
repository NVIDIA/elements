// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';

import { createFixture, elementIsStable, removeFixture } from '@internals/testing';

import type { Dashboard, DashboardGridPlacement, DashboardItem, DashboardLayout, DashboardPanel } from './index.js';

import './define.js';
import '@nvidia-elements/core/button/define.js';

const hero: DashboardItem[] = [
  { id: 'baseline', column: 0, row: 0, columnSpan: 3, rowSpan: 2 },
  { id: 'candidate', column: 3, row: 0, columnSpan: 3, rowSpan: 2 },
  { id: 'changes', column: 0, row: 2, columnSpan: 3, rowSpan: 2 },
  { id: 'evidence', column: 3, row: 2, columnSpan: 3, rowSpan: 2 },
  { id: 'notes', column: 0, row: 4, columnSpan: 6, rowSpan: 2 }
];

describe('dashboard spatial application behavior', () => {
  let fixture: HTMLElement | undefined;

  afterEach(() => {
    if (fixture) {
      removeFixture(fixture);
    }

    vi.restoreAllMocks();
  });

  const value = (dashboard: Dashboard): DashboardLayout => JSON.parse(dashboard.value);

  const panel = (dashboard: Dashboard, id: string) => dashboard.querySelector<DashboardPanel>(`#${id}`)!;

  const handle = (dashboard: Dashboard, id: string, action = 'move') =>
    panel(dashboard, id).shadowRoot!.querySelector<HTMLElement>(`.grip > [data-dashboard-action="${action}"]`)!;

  async function stable(dashboard: Dashboard) {
    await elementIsStable(dashboard);
    await Promise.all(
      [...dashboard.querySelectorAll<DashboardPanel>('nve-dashboard-panel')].map(element => elementIsStable(element))
    );
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    await elementIsStable(dashboard);
  }

  async function createDashboard(
    items = hero,
    options: { flow?: 'vertical' | 'horizontal'; autoSettle?: boolean; tracks?: number } = {}
  ) {
    const flow = options.flow ?? 'vertical';
    const tracks = options.tracks ?? 6;
    const initial: DashboardLayout = {
      version: 1,
      grid: { flow, tracks },
      items: items.map(item =>
        flow === 'horizontal'
          ? { id: item.id, column: item.row, row: item.column, columnSpan: item.rowSpan, rowSpan: item.columnSpan }
          : { ...item }
      )
    };

    fixture =
      await createFixture(html`<nve-dashboard id="spatial-dashboard" rearrangeable sizing="fixed" ?autosettle=${options.autoSettle} .value=${JSON.stringify(initial)} style="width:720px;height:560px;--column-size:72px;--row-size:56px;--gap:8px;--animation-duration:0ms">
      ${items.map(item => html`<nve-dashboard-panel id=${item.id}><nve-dashboard-panel-header>${item.id}<button slot="suffix">Action</button></nve-dashboard-panel-header><input aria-label=${item.id} value="Draft" /></nve-dashboard-panel>`)}</nve-dashboard>`);

    const dashboard = fixture.querySelector<Dashboard>('nve-dashboard')!;

    await stable(dashboard);
    await vi.waitFor(() => expect(panel(dashboard, items[0]!.id).style.width).not.toBe(''));

    return dashboard;
  }

  function sample(type: string, point: { x: number; y: number }) {
    return new PointerEvent(type, {
      ...point,
      clientX: point.x,
      clientY: point.y,
      pointerId: 29,
      pointerType: 'mouse',
      isPrimary: true,
      button: 0,
      buttons: type === 'pointerup' || type === 'pointercancel' ? 0 : 1,
      bubbles: true,
      composed: true,
      cancelable: true
    });
  }

  function press(dashboard: Dashboard, id: string, edge?: 'left' | 'right' | 'top' | 'bottom') {
    const element = panel(dashboard, id),
      control = edge
        ? element.shadowRoot!.querySelector<HTMLElement>(`[data-dashboard-edge="${edge}"]`)!
        : handle(dashboard, id);
    const bounds = control.getBoundingClientRect();
    const start = { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };

    vi.spyOn(control, 'setPointerCapture').mockImplementation(() => {});
    vi.spyOn(dashboard, 'setPointerCapture').mockImplementation(() => {});
    control.dispatchEvent(sample('pointerdown', start));

    return { start, source: value(dashboard).items.find(item => item.id === id)! };
  }

  async function move(
    dashboard: Dashboard,
    gesture: ReturnType<typeof press>,
    rect: Pick<DashboardGridPlacement, 'column' | 'row'>
  ) {
    const point = {
      x: gesture.start.x + (rect.column - gesture.source.column) * 80,
      y: gesture.start.y + (rect.row - gesture.source.row) * 64
    };

    dashboard.dispatchEvent(sample('pointermove', point));
    await stable(dashboard);

    return point;
  }

  function ghost(dashboard: Dashboard) {
    const element = dashboard.shadowRoot!.querySelector<HTMLElement>('nve-ghost')!;

    expect(element).not.toBeNull();

    return {
      column: Number.parseFloat(element.style.getPropertyValue('--_dashboard-inline-start')) / 80,
      row: Number.parseFloat(element.style.top) / 64,
      columnSpan: (Number.parseFloat(element.style.width) + 8) / 80,
      rowSpan: (Number.parseFloat(element.style.height) + 8) / 64
    };
  }

  async function invoke(
    dashboard: Dashboard,
    command: string,
    context: { value: string; placement?: DashboardGridPlacement }
  ) {
    const button = Object.assign(document.createElement('nve-button'), context);

    button.setAttribute('command', command);
    button.setAttribute('commandfor', dashboard.id);
    button.textContent = command;
    fixture!.prepend(button);
    await elementIsStable(button);
    await userEvent.click(button);
    await stable(dashboard);

    button.remove();
  }

  for (const flow of ['vertical', 'horizontal'] as const) {
    const movement =
      flow === 'vertical'
        ? ({
            growthAxis: 'row',
            forwardKey: 'ArrowDown',
            backwardKey: 'ArrowUp',
            forwardCommand: '--move-down',
            backwardCommand: '--move-up'
          } as const)
        : ({
            growthAxis: 'column',
            forwardKey: 'ArrowRight',
            backwardKey: 'ArrowLeft',
            forwardCommand: '--move-right',
            backwardCommand: '--move-left'
          } as const);

    for (const autoSettle of [false, true]) {
      it.each([0, 3])(
        `keeps lower-half body previews local at bounded coordinate %s in ${flow} flow with autoSettle=${autoSettle}`,
        async coordinate => {
          const dashboard = await createDashboard(hero, { flow, autoSettle });
          const initial = dashboard.value;
          const input = panel(dashboard, 'baseline').querySelector('input')!;

          input.value = 'Retained draft';

          const change = vi.fn();

          dashboard.addEventListener('change', change);

          const gesture = press(dashboard, 'baseline');
          const point = await move(
            dashboard,
            gesture,
            flow === 'vertical' ? { column: coordinate, row: 3.5 } : { column: 3.5, row: coordinate }
          );
          const expected =
            flow === 'vertical'
              ? { column: coordinate, row: 2, columnSpan: 3, rowSpan: 2 }
              : { column: 2, row: coordinate, columnSpan: 2, rowSpan: 3 };

          expect(ghost(dashboard)).toEqual(expected);
          expect(dashboard.value).toBe(initial);
          expect(change).not.toHaveBeenCalled();

          dashboard.dispatchEvent(sample('pointerup', point));
          await stable(dashboard);

          expect(value(dashboard).items.find(item => item.id === 'baseline')).toEqual({ id: 'baseline', ...expected });
          expect(change).toHaveBeenCalledOnce();
          expect(panel(dashboard, 'baseline').querySelector('input')).toBe(input);
          expect(input.value).toBe('Retained draft');
        }
      );

      it(`reverses an exchange preview across Notes before committing only the equal panels in ${flow} flow with autoSettle=${autoSettle}`, async () => {
        const dashboard = await createDashboard(
          [
            { id: 'baseline', column: 0, row: 0, columnSpan: 3, rowSpan: 2 },
            { id: 'candidate', column: 3, row: 0, columnSpan: 3, rowSpan: 2 },
            { id: 'changes', column: 0, row: 4, columnSpan: 3, rowSpan: 2 },
            { id: 'evidence', column: 3, row: 4, columnSpan: 3, rowSpan: 2 },
            { id: 'notes', column: 0, row: 2, columnSpan: 6, rowSpan: 2 }
          ],
          { flow, autoSettle }
        );
        const initial = value(dashboard);
        const source = initial.items.find(item => item.id === 'changes')!;
        const target = initial.items.find(item => item.id === 'baseline')!;
        const change = vi.fn();

        dashboard.addEventListener('change', change);

        const gesture = press(dashboard, 'changes');

        await move(dashboard, gesture, target);

        expect(ghost(dashboard)).toEqual({
          column: target.column,
          row: target.row,
          columnSpan: target.columnSpan,
          rowSpan: target.rowSpan
        });
        expect(value(dashboard)).toEqual(initial);

        await move(dashboard, gesture, source);

        expect(ghost(dashboard)).toEqual({
          column: source.column,
          row: source.row,
          columnSpan: source.columnSpan,
          rowSpan: source.rowSpan
        });
        expect(value(dashboard)).toEqual(initial);
        expect(change).not.toHaveBeenCalled();

        const point = await move(dashboard, gesture, target);

        dashboard.dispatchEvent(sample('pointerup', point));
        await stable(dashboard);

        const committed = value(dashboard);

        expect(committed.items.find(item => item.id === 'changes')).toEqual({
          ...source,
          column: target.column,
          row: target.row
        });
        expect(committed.items.find(item => item.id === 'baseline')).toEqual({
          ...target,
          column: source.column,
          row: source.row
        });
        expect(committed.items.filter(item => item.id !== 'changes' && item.id !== 'baseline')).toEqual(
          initial.items.filter(item => item.id !== 'changes' && item.id !== 'baseline')
        );
        expect(change).toHaveBeenCalledOnce();
      });

      it(`applies arrows immediately and matches Invokers without moving Notes in ${flow} flow with autoSettle=${autoSettle}`, async () => {
        const dashboard = await createDashboard(hero, { flow, autoSettle });
        const initial = dashboard.value;
        const change = vi.fn();

        dashboard.addEventListener('change', change);

        const control = handle(dashboard, 'baseline');
        const { growthAxis, forwardKey, backwardKey, forwardCommand, backwardCommand } = movement;

        control.focus();
        await userEvent.keyboard(`{${forwardKey}}`);
        await stable(dashboard);

        const afterExchange = value(dashboard);

        expect(afterExchange.items.find(item => item.id === 'baseline')?.[growthAxis]).toBe(2);
        expect(afterExchange.items.find(item => item.id === 'notes')?.[growthAxis]).toBe(4);
        expect(change).toHaveBeenCalledOnce();

        await userEvent.keyboard(`{${forwardKey}}`);
        await stable(dashboard);

        const afterForward = value(dashboard);

        expect(afterForward.items.find(item => item.id === 'baseline')?.[growthAxis]).toBe(6);
        expect(afterForward.items.find(item => item.id === 'notes')?.[growthAxis]).toBe(4);
        expect(change).toHaveBeenCalledTimes(2);

        await userEvent.keyboard(`{${backwardKey}}`);
        await stable(dashboard);

        const afterReverse = value(dashboard);

        expect(afterReverse.items.find(item => item.id === 'baseline')?.[growthAxis]).toBe(2);
        expect(afterReverse.items.find(item => item.id === 'notes')?.[growthAxis]).toBe(4);
        expect(change).toHaveBeenCalledTimes(3);

        control.blur();
        await stable(dashboard);

        expect(value(dashboard)).toEqual(afterReverse);

        dashboard.value = initial;
        await stable(dashboard);

        change.mockClear();

        await invoke(dashboard, forwardCommand, { value: 'baseline' });

        expect(value(dashboard)).toEqual(afterExchange);
        expect(change).toHaveBeenCalledOnce();

        await invoke(dashboard, forwardCommand, { value: 'baseline' });

        expect(value(dashboard)).toEqual(afterForward);
        expect(change).toHaveBeenCalledTimes(2);

        await invoke(dashboard, backwardCommand, { value: 'baseline' });

        expect(value(dashboard)).toEqual(afterReverse);
        expect(change).toHaveBeenCalledTimes(3);
      });
    }
  }

  for (const flow of ['vertical', 'horizontal'] as const) {
    it(`uses Home and immediate bounded-axis Shift arrows as the same start operation in ${flow} flow`, async () => {
      const items = [
        { id: 'source', column: 0, row: 0, columnSpan: 3, rowSpan: 2 },
        { id: 'peer', column: 3, row: 0, columnSpan: 3, rowSpan: 2 }
      ];
      const dashboard = await createDashboard(items, { flow, autoSettle: true });
      const change = vi.fn();

      dashboard.addEventListener('change', change);
      handle(dashboard, 'source').focus();

      const boundedAxis = flow === 'vertical' ? 'column' : 'row';
      const growth = flow === 'vertical' ? 'row' : 'column';
      const key = flow === 'vertical' ? 'ArrowRight' : 'ArrowDown';

      for (let coordinate = 1; coordinate <= 3; coordinate++) {
        await userEvent.keyboard(`{Shift>}{${key}}{/Shift}`);
        await stable(dashboard);

        const source = value(dashboard).items.find(item => item.id === 'source')!;
        const peer = value(dashboard).items.find(item => item.id === 'peer')!;

        expect(source[boundedAxis]).toBe(coordinate);
        expect(source[growth]).toBe(0);
        expect(peer[boundedAxis]).toBe(3);
        expect(peer[growth]).toBe(2);
        expect(change).toHaveBeenCalledTimes(coordinate);
      }

      const transpose = (item: DashboardItem) =>
        flow === 'vertical'
          ? item
          : { id: item.id, column: item.row, row: item.column, columnSpan: item.rowSpan, rowSpan: item.columnSpan };

      dashboard.value = JSON.stringify({
        version: 1,
        grid: { flow, tracks: 6 },
        items: [
          { id: 'source', column: 3, row: 2, columnSpan: 3, rowSpan: 2 },
          { id: 'peer', column: 3, row: 0, columnSpan: 3, rowSpan: 2 }
        ].map(transpose)
      });
      await stable(dashboard);

      change.mockClear();

      expect(dashboard.isCommandAvailable('--move-to-start', { value: 'source' })).toBe(true);

      const before = dashboard.value;

      handle(dashboard, 'source').focus();
      await userEvent.keyboard(`{Shift>}{${key}}{/Shift}`);
      await stable(dashboard);

      expect(dashboard.value).toBe(before);
      expect(change).not.toHaveBeenCalled();

      await userEvent.keyboard('{Home}');
      await stable(dashboard);

      expect(value(dashboard).items[0]?.[growth]).toBe(0);
      expect(change).toHaveBeenCalledOnce();

      const committed = dashboard.value;

      panel(dashboard, 'source').querySelector('input')!.focus();
      await userEvent.keyboard(`{Shift>}{${key}}{/Shift}`);
      await stable(dashboard);

      expect(dashboard.value).toBe(committed);
      expect(change).toHaveBeenCalledOnce();
    });
  }

  it.each(['vertical', 'horizontal'] as const)(
    'shows only the accepted transient start tint without reserving viewport space in %s flow',
    async flow => {
      const dashboard = await createDashboard(hero, { flow });
      const initial = dashboard.value;
      const viewport = dashboard.shadowRoot!.querySelector<HTMLElement>('.viewport')!;
      const before = [viewport.clientWidth, viewport.clientHeight];

      expect(dashboard.shadowRoot!.querySelector('.start-cue')).toBeNull();

      const gesture = press(dashboard, 'changes');
      const bounds = viewport.getBoundingClientRect();
      const point =
        flow === 'vertical' ? { x: gesture.start.x, y: bounds.top + 4 } : { x: bounds.left + 4, y: gesture.start.y };

      dashboard.dispatchEvent(sample('pointermove', point));
      await stable(dashboard);

      const cue = dashboard.shadowRoot!.querySelector<HTMLElement>('.start-cue')!;

      expect(cue).not.toBeNull();

      const style = getComputedStyle(cue);
      const painted = cue.getBoundingClientRect();

      expect(style.position).toBe('absolute');
      expect(style.pointerEvents).toBe('none');
      expect(style.boxShadow).toBe('none');
      expect(style.backgroundColor).toMatch(/0\.16\)$/);
      expect(flow === 'vertical' ? painted.height : painted.width).toBe(8);
      expect(dashboard.shadowRoot!.querySelectorAll('nve-ghost')).toHaveLength(1);
      expect([viewport.clientWidth, viewport.clientHeight]).toEqual(before);

      dashboard.dispatchEvent(sample('pointercancel', point));
      await stable(dashboard);

      expect(dashboard.shadowRoot!.querySelector('.start-cue')).toBeNull();
      expect(dashboard.value).toBe(initial);
      expect([viewport.clientWidth, viewport.clientHeight]).toEqual(before);
    }
  );

  it('fills the vacant top-right slot after a boundary move without displacing Candidate', async () => {
    const dashboard = await createDashboard();
    const change = vi.fn();

    dashboard.addEventListener('change', change);

    const first = press(dashboard, 'changes');
    const viewport = dashboard.shadowRoot!.querySelector<HTMLElement>('.viewport')!.getBoundingClientRect();
    const top = { x: first.start.x, y: viewport.top + 4 };

    dashboard.dispatchEvent(sample('pointermove', top));
    await stable(dashboard);

    dashboard.dispatchEvent(sample('pointerup', top));
    await stable(dashboard);

    const afterChanges = value(dashboard);

    expect(afterChanges.items.map(item => item.row)).toEqual([2, 2, 0, 4, 6]);

    const second = press(dashboard, 'evidence');
    const end = await move(dashboard, second, { column: 3, row: 0 });

    expect(ghost(dashboard)).toEqual({ column: 3, row: 0, columnSpan: 3, rowSpan: 2 });

    dashboard.dispatchEvent(sample('pointerup', end));
    await stable(dashboard);

    const expected = {
      ...afterChanges,
      items: afterChanges.items.map(item => (item.id === 'evidence' ? { ...item, row: 0 } : item))
    };

    expect(value(dashboard)).toEqual(expected);
    expect(change).toHaveBeenCalledTimes(2);

    dashboard.value = JSON.stringify(afterChanges);
    await stable(dashboard);
    await invoke(dashboard, '--move-to-start', { value: 'evidence' });

    expect(value(dashboard)).toEqual(expected);
  });

  it('retracts all temporary displacement on a continuous return and restores the baseline on cancel', async () => {
    const items = [
      { id: 'source', column: 0, row: 0, columnSpan: 4, rowSpan: 3 },
      { id: 'upper', column: 0, row: 3, columnSpan: 3, rowSpan: 2 },
      { id: 'lower', column: 1, row: 5, columnSpan: 2, rowSpan: 1 },
      { id: 'filler', column: 0, row: 5, columnSpan: 1, rowSpan: 1 }
    ];
    const dashboard = await createDashboard(items, { tracks: 4 });
    const initial = dashboard.value;
    const change = vi.fn();

    dashboard.addEventListener('change', change);

    const peers = () =>
      [...dashboard.querySelectorAll<HTMLElement>('nve-dashboard-panel')].map(element => [
        element.style.getPropertyValue('--_dashboard-inline-start'),
        element.style.top,
        element.style.width,
        element.style.height
      ]);

    const originalPeers = peers();
    const gesture = press(dashboard, 'lower');

    await move(dashboard, gesture, { column: 1, row: 3 });

    const end = await move(dashboard, gesture, { column: 1, row: 5 });

    expect(peers()).toEqual(originalPeers);

    dashboard.dispatchEvent(sample('pointerup', end));
    await stable(dashboard);

    expect(dashboard.value).toBe(initial);
    expect(change).not.toHaveBeenCalled();

    const next = press(dashboard, 'lower');

    await move(dashboard, next, { column: 1, row: 0 });

    dashboard.dispatchEvent(sample('pointercancel', next.start));
    await stable(dashboard);

    expect(dashboard.value).toBe(initial);
    expect(peers()).toEqual(originalPeers);
    expect(change).not.toHaveBeenCalled();
  });

  it('gates real movement and resize Invokers with the parent capability and independent panel restrictions', async () => {
    const dashboard = await createDashboard(hero);
    const initial = dashboard.value;
    const source = panel(dashboard, 'baseline');
    const change = vi.fn();

    dashboard.addEventListener('change', change);
    dashboard.rearrangeable = false;
    await stable(dashboard);
    await invoke(dashboard, '--move-down', { value: source.id });
    await invoke(dashboard, '--increase-height', { value: source.id });

    expect(dashboard.value).toBe(initial);
    expect(change).not.toHaveBeenCalled();

    dashboard.rearrangeable = true;
    source.resizeDisabled = true;
    await stable(dashboard);
    await invoke(dashboard, '--increase-height', { value: source.id });

    expect(change).not.toHaveBeenCalled();

    await invoke(dashboard, '--move-down', { value: source.id });

    expect(change).toHaveBeenCalledOnce();

    dashboard.value = initial;
    source.resizeDisabled = false;
    source.moveDisabled = true;
    await stable(dashboard);

    change.mockClear();
    await invoke(dashboard, '--move-down', { value: source.id });

    expect(change).not.toHaveBeenCalled();

    await invoke(dashboard, '--increase-height', { value: source.id });

    expect(change).toHaveBeenCalledOnce();
    expect(value(dashboard).version).toBe(1);
  });

  it('matches anchored edge, method and real Invoker resizing with only resize permission and settling enabled', async () => {
    const items = [
      { id: 'source', column: 2, row: 2, columnSpan: 2, rowSpan: 2 },
      { id: 'peer', column: 0, row: 0, columnSpan: 4, rowSpan: 2 }
    ];
    const dashboard = await createDashboard(items, { autoSettle: true });
    const initial = dashboard.value;
    const rect = { column: 1, row: 2, columnSpan: 3, rowSpan: 2 };
    const change = vi.fn();

    panel(dashboard, 'source').moveDisabled = true;
    await stable(dashboard);

    dashboard.addEventListener('change', change);

    expect(dashboard.isCommandAvailable('--place', { value: 'source', placement: rect })).toBe(true);

    const gesture = press(dashboard, 'source', 'left');
    const end = await move(dashboard, gesture, { column: 1, row: 2 });
    const preview = ghost(dashboard);

    dashboard.dispatchEvent(sample('pointerup', end));
    await stable(dashboard);

    const expected = value(dashboard);

    expect(expected.items[0]).toEqual({ id: 'source', ...rect });
    expect(preview).toEqual(rect);
    expect(change).toHaveBeenCalledOnce();

    dashboard.value = initial;
    await stable(dashboard);

    change.mockClear();

    expect(dashboard.place('source', rect)).toBe(true);
    await stable(dashboard);

    expect(value(dashboard)).toEqual(expected);
    expect(change).toHaveBeenCalledOnce();

    dashboard.value = initial;
    await stable(dashboard);

    change.mockClear();
    await invoke(dashboard, '--place', { value: 'source', placement: rect });

    expect(value(dashboard)).toEqual(expected);
    expect(change).toHaveBeenCalledOnce();

    expect(dashboard.place('source', rect)).toBe(false);
    expect(dashboard.isCommandAvailable('--place', { value: 'source', placement: rect })).toBe(false);
    expect(change).toHaveBeenCalledOnce();

    expect(dashboard.place('source', { column: 0, row: 2, columnSpan: 3, rowSpan: 2 })).toBe(false);

    panel(dashboard, 'source').resizeDisabled = true;
    await stable(dashboard);

    expect(dashboard.place('source', { column: 0, row: 2, columnSpan: 4, rowSpan: 2 })).toBe(false);
  });

  it.each(['vertical', 'horizontal'] as const)(
    'does not turn an invalid start placement into Home in %s flow',
    async flow => {
      const dashboard = await createDashboard(
        [
          { id: 'source', column: 1, row: 2, columnSpan: 1, rowSpan: 1 },
          { id: 'peer', column: 0, row: 0, columnSpan: 1, rowSpan: 1 }
        ],
        { tracks: 4, flow }
      );
      const initial = dashboard.value;
      const change = vi.fn();
      const placement =
        flow === 'vertical'
          ? { column: -1, row: 0, columnSpan: 1, rowSpan: 1 }
          : { column: 0, row: -1, columnSpan: 1, rowSpan: 1 };

      dashboard.addEventListener('change', change);

      expect(dashboard.isCommandAvailable('--move-to-start', { value: 'source' })).toBe(true);
      expect(dashboard.isCommandAvailable('--move-to-start', { value: 'source', placement })).toBe(false);

      await invoke(dashboard, '--move-to-start', { value: 'source', placement });

      expect(dashboard.value).toBe(initial);
      expect(change).not.toHaveBeenCalled();

      await invoke(dashboard, '--move-to-start', { value: 'source' });

      expect(value(dashboard).items[0]?.[flow === 'vertical' ? 'row' : 'column']).toBe(0);
      expect(change).toHaveBeenCalledOnce();
    }
  );

  it('keeps arrow-key movement in physical directions under RTL', async () => {
    const dashboard = await createDashboard([
      { id: 'source', column: 0, row: 0, columnSpan: 3, rowSpan: 2 },
      { id: 'peer', column: 3, row: 0, columnSpan: 3, rowSpan: 2 }
    ]);

    dashboard.dir = 'rtl';
    await stable(dashboard);

    handle(dashboard, 'source').focus();
    await userEvent.keyboard('{ArrowLeft}');
    await stable(dashboard);

    expect(value(dashboard).items[0]?.column).toBe(3);
  });

  it('keeps directional command availability independent of movement grip rendering', async () => {
    const dashboard = await createDashboard([
      { id: 'source', column: 0, row: 0, columnSpan: 3, rowSpan: 2 },
      { id: 'peer', column: 3, row: 0, columnSpan: 3, rowSpan: 2 }
    ]);

    expect(dashboard.isCommandAvailable('--move-right', { value: 'source' })).toBe(true);

    handle(dashboard, 'source').style.display = 'none';

    expect(dashboard.isCommandAvailable('--move-right', { value: 'source' })).toBe(true);
  });
});
