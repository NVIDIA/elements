// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';

import { createFixture, elementIsStable, removeFixture } from '@internals/testing';

import type { Dashboard, DashboardLayout, DashboardPanel } from './index.js';

import './define.js';

describe('dashboard value', () => {
  let fixture: HTMLElement | undefined;

  afterEach(() => {
    if (fixture) {
      removeFixture(fixture);
    }

    fixture = undefined;
    vi.restoreAllMocks();
  });

  function layout(flow: 'vertical' | 'horizontal' = 'vertical'): DashboardLayout {
    return {
      version: 1,
      grid: { flow, tracks: 4 },
      items: [
        { id: 'notes', column: 0, row: 0, columnSpan: 2, rowSpan: 2 },
        { id: 'cases', column: 2, row: 0, columnSpan: 2, rowSpan: 2 },
        {
          id: 'baseline',
          column: flow === 'horizontal' ? 6 : 0,
          row: flow === 'vertical' ? 6 : 2,
          columnSpan: 2,
          rowSpan: 2
        }
      ]
    };
  }

  async function createDashboard(
    flow: 'vertical' | 'horizontal' = 'vertical',
    sizing: 'fit' | 'fixed' = 'fit',
    autoSettle = true
  ) {
    fixture = await createFixture(html`
      <nve-dashboard
        aria-label="Test comparison"
        ?autosettle=${autoSettle}
        rearrangeable
        sizing=${sizing}
        .value=${JSON.stringify(layout(flow))}
        style="width:620px;height:320px;--column-size:160px;--row-size:120px;--gap:8px">
        <nve-dashboard-panel id="notes">
          <nve-dashboard-panel-header>Notes</nve-dashboard-panel-header>
          <nve-dashboard-panel-content>
            <input aria-label="Notes" value="Original notes" />
            <select aria-label="Cohort"><option>All cases</option><option>Failed cases</option></select>
          </nve-dashboard-panel-content>
          <nve-dashboard-panel-footer>Draft investigation</nve-dashboard-panel-footer>
        </nve-dashboard-panel>
        <nve-dashboard-panel id="cases">
          <nve-dashboard-panel-header>Candidate cases</nve-dashboard-panel-header>
          <nve-dashboard-panel-content>Candidate results</nve-dashboard-panel-content>
        </nve-dashboard-panel>
        <nve-dashboard-panel id="baseline">
          <nve-dashboard-panel-header>Baseline cases</nve-dashboard-panel-header>
          <nve-dashboard-panel-content>Baseline results</nve-dashboard-panel-content>
        </nve-dashboard-panel>
      </nve-dashboard>
    `);

    const dashboard = fixture.querySelector<Dashboard>('nve-dashboard')!;

    await settle(dashboard);
    await vi.waitFor(() => expect(dashboard.querySelector('#notes')!.getBoundingClientRect().width).toBeGreaterThan(0));

    window.scrollTo(0, 0);

    return dashboard;
  }

  async function rendered(dashboard: Dashboard) {
    await elementIsStable(dashboard);
    await Promise.all(
      [...dashboard.querySelectorAll<HTMLElement & { updateComplete?: Promise<boolean> }>('*')]
        .filter(element => element.updateComplete)
        .map(element => elementIsStable(element))
    );
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
    await elementIsStable(dashboard);
  }

  async function settle(dashboard: Dashboard) {
    await rendered(dashboard);

    const transitions = [...dashboard.querySelectorAll('nve-dashboard-panel')].flatMap(panel =>
      panel
        .getAnimations()
        .filter(
          animation =>
            animation instanceof CSSTransition &&
            ['left', 'top', 'width', 'height'].includes(animation.transitionProperty)
        )
    );
    const chrome = [...dashboard.querySelectorAll('nve-dashboard-panel')].flatMap(panel =>
      [...panel.shadowRoot!.querySelectorAll('.grip, .control-divider, .footer')].flatMap(element =>
        element.getAnimations().filter(animation => animation instanceof CSSTransition)
      )
    );

    await Promise.allSettled([...transitions, ...chrome].map(animation => animation.finished));
    await rendered(dashboard);
  }

  function pointer(type: string, x: number, y: number) {
    return new PointerEvent(type, {
      clientX: x,
      clientY: y,
      pointerId: 7,
      isPrimary: true,
      button: 0,
      buttons: type === 'pointerup' || type === 'pointercancel' ? 0 : 1,
      bubbles: true,
      composed: true,
      cancelable: true
    });
  }

  it('rejects invalid restoration atomically and keeps no-op and rejected placement silent', async () => {
    const dashboard = await createDashboard();
    const value = dashboard.value;
    const input = dashboard.querySelector('input')!;
    const change = vi.fn();

    dashboard.addEventListener('change', change);

    expect(() => {
      dashboard.value = '{invalid';
    }).toThrow();
    expect(dashboard.value).toBe(value);
    expect(dashboard.querySelector('input')).toBe(input);

    dashboard.place('notes', { column: 0, row: 0, columnSpan: 2, rowSpan: 2 });

    expect(dashboard.place('notes', { column: 4, row: 0, columnSpan: 2, rowSpan: 2 })).toBe(false);
    await settle(dashboard);

    expect(dashboard.value).toBe(value);
    expect(change).not.toHaveBeenCalled();
  });

  it('releases hidden panel space and reconciles its return without overriding active placement', async () => {
    const dashboard = await createDashboard();
    const notes = dashboard.querySelector<HTMLElement>('#notes')!;
    const cases = dashboard.querySelector<HTMLElement>('#cases')!;
    const input = notes.querySelector('input')!;

    input.value = 'Retained application state';

    const origin = notes.getBoundingClientRect();
    const change = vi.fn();

    dashboard.addEventListener('change', change);
    notes.hidden = true;
    await settle(dashboard);

    expect(notes.hidden).toBe(true);
    expect(change).toHaveBeenCalledOnce();

    expect(dashboard.place('cases', { column: 0, row: 0, columnSpan: 2, rowSpan: 2 })).toBe(true);
    await settle(dashboard);

    expect(cases.getBoundingClientRect().left).toBeCloseTo(origin.left);
    expect(cases.getBoundingClientRect().top).toBeCloseTo(origin.top);
    expect(change).toHaveBeenCalledTimes(2);

    const activeBounds = cases.getBoundingClientRect();

    notes.hidden = false;
    await settle(dashboard);

    expect(cases.getBoundingClientRect().left).toBeCloseTo(activeBounds.left);
    expect(cases.getBoundingClientRect().top).toBeCloseTo(activeBounds.top);

    const returned = notes.getBoundingClientRect();

    expect(returned.left >= activeBounds.right || returned.top >= activeBounds.bottom).toBe(true);
    expect(notes.querySelector('input')).toBe(input);
    expect(input.value).toBe('Retained application state');
    expect(change).toHaveBeenCalledTimes(3);
  });

  it('observes application property changes to panel constraints and direct manipulation permissions', async () => {
    const dashboard = await createDashboard();
    const notes = dashboard.querySelector<DashboardPanel>('#notes')!;
    const before = notes.getBoundingClientRect().width;

    notes.minColumnSpan = 3;
    notes.moveDisabled = true;
    notes.resizeDisabled = true;
    await settle(dashboard);
    await vi.waitFor(() => {
      expect(notes.getBoundingClientRect().width).toBeGreaterThan(before + 50);
      expect(notes.shadowRoot!.querySelector<HTMLElement>('.move-grip')!.inert).toBe(true);
      expect(notes.shadowRoot!.querySelector<HTMLElement>('.resize-grip')!.inert).toBe(true);
    });
  });

  it('applies a reentrant arrow to canonical restored geometry before the next host update', async () => {
    const dashboard = await createDashboard();
    const initial = dashboard.value;
    const saved = JSON.stringify({
      version: 1,
      grid: { flow: 'vertical', tracks: 4 },
      items: [
        { id: 'notes', column: 0, row: 999, columnSpan: 2, rowSpan: 1 },
        { id: 'cases', column: 2, row: 0, columnSpan: 2, rowSpan: 3 },
        { id: 'baseline', column: 0, row: 1000, columnSpan: 4, rowSpan: 2 }
      ]
    });
    const control = dashboard
      .querySelector('#notes')!
      .shadowRoot!.querySelector<HTMLElement>('[data-dashboard-action="move"]')!;

    const state = () => [
      ...[...dashboard.querySelectorAll<HTMLElement>('nve-dashboard-panel')].map(panel => panel.style.cssText),
      dashboard.shadowRoot!.querySelector<HTMLElement>('nve-ghost')?.style.cssText
    ];

    dashboard.value = saved;
    await settle(dashboard);

    control.focus();
    await userEvent.keyboard('{ArrowDown}');
    await settle(dashboard);

    const expected = state();
    const expectedValue = dashboard.value;

    await userEvent.keyboard('{Escape}');

    dashboard.value = initial;
    await settle(dashboard);

    const change = vi.fn();

    dashboard.addEventListener('change', change);
    dashboard.addEventListener(
      'change',
      () => {
        dashboard.value = saved;
        control.focus();
        control.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, composed: true }));
      },
      { once: true }
    );

    expect(dashboard.place('cases', { column: 0, row: 0, columnSpan: 2, rowSpan: 2 })).toBe(true);
    await settle(dashboard);

    expect(dashboard.value).toBe(expectedValue);
    expect(state()).toEqual(expected);
    expect(change).toHaveBeenCalledTimes(2);

    await userEvent.keyboard('{Escape}');
    await settle(dashboard);

    expect(dashboard.value).toBe(expectedValue);
  });

  it('normalizes current saved records silently while discarding absent IDs and keeping edited input', async () => {
    const dashboard = await createDashboard();
    const input = dashboard.querySelector('input')!;

    input.value = 'Unsaved application finding';

    const saved: DashboardLayout = {
      ...layout(),
      items: [
        { id: 'notes', column: 0, row: 20, columnSpan: 2, rowSpan: 2 },
        { id: 'cases', column: 2, row: 30, columnSpan: 2, rowSpan: 2 },
        { id: 'baseline', column: 0, row: 40, columnSpan: 2, rowSpan: 2 },
        { id: 'absent', column: 0, row: 999998, columnSpan: 4, rowSpan: 2 }
      ]
    };
    const serialized = JSON.stringify(saved);
    const change = vi.fn();

    dashboard.addEventListener('change', change);
    dashboard.value = serialized;
    await settle(dashboard);

    expect(JSON.parse(dashboard.value).items).toEqual([
      { id: 'notes', column: 0, row: 0, columnSpan: 2, rowSpan: 2 },
      { id: 'cases', column: 2, row: 0, columnSpan: 2, rowSpan: 2 },
      { id: 'baseline', column: 0, row: 2, columnSpan: 2, rowSpan: 2 }
    ]);
    expect(JSON.stringify(saved)).toBe(serialized);

    const canonical = dashboard.value;

    dashboard.value = canonical;
    await settle(dashboard);

    expect(dashboard.value).toBe(canonical);
    expect(dashboard.querySelector('input')).toBe(input);
    expect(input.value).toBe('Unsaved application finding');
    expect(change).not.toHaveBeenCalled();
  });

  it('preserves exact authored gaps by default before any policy is enabled', async () => {
    const dashboard = await createDashboard('vertical', 'fit', false);

    expect(dashboard.hasAttribute('autosettle')).toBe(false);
    expect(JSON.parse(dashboard.value)).toEqual(layout());

    const change = vi.fn();

    dashboard.addEventListener('change', change);

    const base = layout();
    const saved: DashboardLayout = {
      ...base,
      items: base.items.map((item, index) => (index === 2 ? { ...item, row: 100000 } : item))
    };

    dashboard.value = JSON.stringify(saved);

    expect(JSON.parse(dashboard.value)).toEqual(saved);

    await settle(dashboard);

    expect(JSON.parse(dashboard.value)).toEqual(saved);
    expect(change).not.toHaveBeenCalled();
  });

  for (const trigger of ['place', 'membership'] as const) {
    it(`keeps an application value rewrite visible after a ${trigger} change callback`, async () => {
      const dashboard = await createDashboard('vertical', 'fit', false);
      const input = dashboard.querySelector('input')!;

      input.value = 'Application-owned draft';

      const base = layout();
      const items = base.items.map(item => ({ ...item, row: item.row + 5 }));
      const saved: DashboardLayout = {
        ...base,
        items:
          trigger === 'membership' ? [...items, { id: 'added', column: 2, row: 20, columnSpan: 2, rowSpan: 2 }] : items
      };
      const change = vi.fn();

      dashboard.addEventListener('change', event => {
        if (event.target !== dashboard) return;

        change();

        if (change.mock.calls.length === 1) {
          dashboard.value = JSON.stringify(saved);
        }
      });

      if (trigger === 'place') {
        expect(dashboard.place('notes', { column: 0, row: 3, columnSpan: 2, rowSpan: 2 })).toBe(true);
      } else {
        const added = document.createElement('nve-dashboard-panel');

        added.id = 'added';
        added.textContent = 'Application-added panel';
        dashboard.append(added);
      }

      await settle(dashboard);

      expect(JSON.parse(dashboard.value)).toEqual(saved);
      expect(dashboard.shadowRoot!.querySelector<HTMLElement>('.canvas')!.hidden).toBe(false);
      expect(change).toHaveBeenCalledOnce();
      expect(dashboard.querySelector('input')).toBe(input);
      expect(input.value).toBe('Application-owned draft');

      const read = dashboard.value;

      await rendered(dashboard);

      expect(dashboard.value).toBe(read);
      expect(change).toHaveBeenCalledOnce();
    });
  }

  it('normalizes an empty application reset from membership change without event feedback', async () => {
    const dashboard = await createDashboard('vertical', 'fit', false);
    const change = vi.fn();

    dashboard.addEventListener('change', event => {
      if (event.target !== dashboard) return;

      change();

      if (change.mock.calls.length === 1) {
        dashboard.value = '';
      }
    });

    const added = document.createElement('nve-dashboard-panel');

    added.id = 'added';
    dashboard.append(added);
    await settle(dashboard);

    expect(change).toHaveBeenCalledOnce();
    expect(dashboard.shadowRoot!.querySelector<HTMLElement>('.canvas')!.hidden).toBe(false);
    expect(
      JSON.parse(dashboard.value)
        .items.map((item: { id: string }) => item.id)
        .sort()
    ).toEqual(['added', 'baseline', 'cases', 'notes']);

    const canonical = dashboard.value;

    await rendered(dashboard);

    expect(dashboard.value).toBe(canonical);
    expect(change).toHaveBeenCalledOnce();
  });

  it('rejects an infeasible same-task policy toggle atomically', async () => {
    const dashboard = await createDashboard('vertical', 'fit', false);
    const panel = dashboard.querySelector<DashboardPanel>('#notes')!;
    const before = dashboard.value;
    const change = vi.fn();

    dashboard.addEventListener('change', change);
    panel.minColumnSpan = dashboard.tracks + 1;

    expect(() => {
      dashboard.autoSettle = true;
    }).toThrow(RangeError);
    expect(dashboard.autoSettle).toBe(false);
    expect(dashboard.value).toBe(before);

    panel.minColumnSpan = 1;
    await settle(dashboard);

    expect(change).not.toHaveBeenCalled();
  });

  for (const enabled of [false, true]) {
    it(`cancels an active pointer before a same-task policy toggle to ${enabled} can release`, async () => {
      const dashboard = await createDashboard('vertical', 'fit', !enabled);
      const panel = dashboard.querySelector<HTMLElement>('#notes')!;
      const control = panel.shadowRoot!.querySelector<HTMLElement>('[data-dashboard-action="move"]')!;
      const box = control.getBoundingClientRect();
      const x = box.left + box.width / 2;
      const y = box.top + box.height / 2;
      const before = dashboard.value;
      const change = vi.fn();

      dashboard.addEventListener('change', change);
      vi.spyOn(control, 'setPointerCapture').mockImplementation(() => {});
      control.dispatchEvent(pointer('pointerdown', x, y));
      dashboard.dispatchEvent(pointer('pointermove', x, y + 384));
      await rendered(dashboard);

      expect(dashboard.shadowRoot!.querySelector('nve-ghost')).not.toBeNull();

      dashboard.autoSettle = enabled;

      const canonical = dashboard.value;

      dashboard.dispatchEvent(pointer('pointerup', x, y + 384));

      expect(dashboard.value).toBe(canonical);

      if (!enabled) {
        expect(canonical).toBe(before);
      } else {
        expect(JSON.parse(canonical).items.find((item: { id: string }) => item.id === 'baseline').row).toBe(2);
      }

      await settle(dashboard);

      expect(dashboard.shadowRoot!.querySelector('nve-ghost')).toBeNull();
      expect(change).not.toHaveBeenCalled();
    });
  }
});
