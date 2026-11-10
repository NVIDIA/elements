// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';

import { createFixture, elementIsStable, removeFixture } from '@internals/testing';

import type { GridRow } from '@nvidia-elements/core/grid';

import type { Dashboard, DashboardLayout, DashboardPanel } from './index.js';

import './define.js';
import '@nvidia-elements/core/grid/define.js';

describe('dashboard composition', () => {
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

  function viewport(dashboard: Dashboard) {
    return dashboard.shadowRoot!.querySelector<HTMLElement>('.viewport')!;
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

  it('keeps body input, selection, and scrolling outside arrangement handling', async () => {
    const dashboard = await createDashboard();
    const input = dashboard.querySelector('input')!;
    const value = dashboard.value;
    const authoredChange = vi.fn();
    const arrangementChange = vi.fn();
    const bodyEnter = vi.fn();

    input.addEventListener('keyup', event => {
      if (event.key === 'Enter') {
        bodyEnter(event.defaultPrevented);
      }
    });
    dashboard.addEventListener('change', event => {
      if (event.target === dashboard) {
        arrangementChange(event);
      } else {
        authoredChange(event.target);
      }
    });
    input.focus();
    await userEvent.keyboard('New notes{ArrowLeft}{Enter}');

    input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    input.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    input.dispatchEvent(new WheelEvent('wheel', { deltaY: 80, bubbles: true, composed: true, cancelable: true }));
    await settle(dashboard);

    expect(authoredChange).toHaveBeenCalledWith(input);
    expect(arrangementChange).not.toHaveBeenCalled();
    expect(dashboard.value).toBe(value);
    expect(input.value).toContain('New notes');
    expect(bodyEnter).toHaveBeenCalledWith(false);
    expect(getComputedStyle(dashboard).touchAction).toBe('auto');
  });

  it('retains the pointer grab offset through non-composed scrolling of a slotted shadow ancestor', async () => {
    const dashboard = await createDashboard();
    const wrapper = document.createElement('div');
    const shadow = wrapper.attachShadow({ mode: 'open' });
    const scroller = document.createElement('div');

    scroller.style.cssText = 'height:260px;overflow:auto';
    scroller.innerHTML = '<div style="height:80px"></div><slot></slot><div style="height:200px"></div>';
    shadow.append(scroller);
    fixture!.before(wrapper);
    wrapper.append(fixture!);

    try {
      await settle(dashboard);

      const panel = dashboard.querySelector<HTMLElement>('#notes')!;
      const control = panel.shadowRoot!.querySelector<HTMLElement>('[data-dashboard-action="move"]')!;
      const box = control.getBoundingClientRect();
      const x = box.left + box.width / 2;
      const y = box.top + box.height / 2;

      vi.spyOn(control, 'setPointerCapture').mockImplementation(() => {});
      control.dispatchEvent(pointer('pointerdown', x, y));
      dashboard.dispatchEvent(pointer('pointermove', x + 13, y + 13));
      await rendered(dashboard);

      const carried = panel.getBoundingClientRect();

      scroller.scrollTop = 40;
      await vi.waitFor(() => expect(scroller.scrollTop).toBe(40));
      await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
      await rendered(dashboard);

      expect(panel.getBoundingClientRect().top).toBeCloseTo(carried.top);
      expect(panel.getBoundingClientRect().left).toBeCloseTo(carried.left);

      dashboard.dispatchEvent(pointer('pointercancel', x + 13, y + 13));
      await settle(dashboard);
    } finally {
      wrapper.before(fixture!);
      wrapper.remove();
    }
  });

  it('reveals the focused footer action when a fixed-size panel is wider than the viewport', async () => {
    const dashboard = await createDashboard('vertical', 'fixed');

    dashboard.style.width = '420px';

    expect(dashboard.place('notes', { column: 0, row: 0, columnSpan: 4, rowSpan: 2 })).toBe(true);

    const panel = dashboard.querySelector('#notes')!;
    const footer = panel.querySelector('nve-dashboard-panel-footer')!;
    const action = document.createElement('button');

    action.type = 'button';
    action.textContent = 'Save investigation';
    action.style.marginInlineStart = 'auto';
    footer.replaceChildren(action);
    await settle(dashboard);

    action.focus();
    await settle(dashboard);

    const visible = viewport(dashboard).getBoundingClientRect();
    const bounds = action.getBoundingClientRect();

    expect(bounds.left).toBeGreaterThanOrEqual(visible.left - 1);
    expect(bounds.right).toBeLessThanOrEqual(visible.right + 1);
  });

  it('reveals the focused movement control as keyboard placement moves beyond the viewport', async () => {
    const dashboard = await createDashboard();
    const panel = dashboard.querySelector('#notes')!;
    const control = panel.shadowRoot!.querySelector<HTMLElement>('[data-dashboard-action="move"]')!;
    const value = dashboard.value;

    control.focus();
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}');
    await settle(dashboard);

    const visible = viewport(dashboard).getBoundingClientRect();
    const bounds = control.getBoundingClientRect();

    expect(bounds.top).toBeGreaterThanOrEqual(visible.top - 1);
    expect(bounds.bottom).toBeLessThanOrEqual(visible.bottom + 1);
    expect(dashboard.value).not.toBe(value);

    await userEvent.keyboard('{Escape}');
    await settle(dashboard);

    expect(dashboard.value).not.toBe(value);
  });

  it('respects application focus chosen by the committed change handler', async () => {
    const dashboard = await createDashboard();
    const panel = dashboard.querySelector('#notes')!;
    const input = panel.querySelector('input')!;
    const control = panel.shadowRoot!.querySelector<HTMLElement>('[data-dashboard-action="move"]')!;

    dashboard.addEventListener('change', event => {
      if (event.target === dashboard) {
        input.focus();
      }
    });
    control.focus();
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await settle(dashboard);

    expect(document.activeElement).toBe(input);
  });

  it('keeps an immediately committed arrow unchanged when application content receives focus', async () => {
    const dashboard = await createDashboard();
    const panel = dashboard.querySelector('#notes')!;
    const input = panel.querySelector('input')!;
    const control = panel.shadowRoot!.querySelector<HTMLElement>('[data-dashboard-action="move"]')!;
    const value = dashboard.value;
    const origin = panel.getBoundingClientRect().top;
    const change = vi.fn();

    dashboard.addEventListener('change', change);
    control.focus();
    await userEvent.keyboard('{ArrowDown}');
    await settle(dashboard);

    expect(panel.getBoundingClientRect().top).toBeGreaterThan(origin);

    await userEvent.click(input);
    await settle(dashboard);

    expect(document.activeElement).toBe(input);
    expect(panel.getBoundingClientRect().top).toBeGreaterThan(origin);
    expect(dashboard.shadowRoot!.querySelector('nve-ghost')).toBeNull();
    expect(dashboard.value).not.toBe(value);
    expect(change).toHaveBeenCalledOnce();
  });

  describe('immediate keyboard changes', () => {
    for (const leave of ['Tab', 'outside click'] as const) {
      it(`keeps an arrow commit unchanged on ${leave} without redirecting focus`, async () => {
        const dashboard = await createDashboard();
        const panel = dashboard.querySelector('#notes')!;
        const control = panel.shadowRoot!.querySelector<HTMLElement>('[data-dashboard-action="move"]')!;
        const outside = document.createElement('button');

        outside.textContent = 'Application action';
        fixture!.append(outside);

        const change = vi.fn();

        dashboard.addEventListener('change', change);
        control.focus();
        await userEvent.keyboard('{ArrowDown}');
        await settle(dashboard);

        if (leave === 'Tab') {
          await userEvent.keyboard('{Tab}');
        } else {
          await userEvent.click(outside);
        }

        await settle(dashboard);

        if (leave === 'Tab') {
          expect(document.activeElement).toBe(panel);
          expect(panel.shadowRoot!.activeElement).toBe(panel.shadowRoot!.querySelector('.body'));
        } else {
          expect(document.activeElement).toBe(outside);
        }

        expect(JSON.parse(dashboard.value).items.find((item: { id: string }) => item.id === 'notes').row).toBe(2);
        expect(change).toHaveBeenCalledOnce();
        expect(dashboard.shadowRoot!.querySelector('nve-ghost')).toBeNull();

        if (leave === 'Tab') {
          await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
          await settle(dashboard);

          expect(panel.shadowRoot!.activeElement).toBe(control);
          expect(change).toHaveBeenCalledOnce();
          expect(dashboard.shadowRoot!.querySelector('nve-ghost')).toBeNull();
        }
      });
    }

    it('keeps an arrow commit when application capture replaces its panel before focusout completes', async () => {
      const dashboard = await createDashboard();
      const panel = dashboard.querySelector('#notes')!;
      const control = panel.shadowRoot!.querySelector<HTMLElement>('[data-dashboard-action="move"]')!;
      const outside = document.createElement('button');

      outside.textContent = 'Application action';
      fixture!.append(outside);

      const change = vi.fn();

      dashboard.addEventListener('change', change);
      control.focus();
      await userEvent.keyboard('{ArrowDown}');
      await settle(dashboard);

      const committed = dashboard.value;

      expect(change).toHaveBeenCalledOnce();

      dashboard.addEventListener('focusout', () => panel.replaceWith(panel.cloneNode(true)), {
        capture: true,
        once: true
      });
      outside.focus();
      await settle(dashboard);

      expect(dashboard.querySelector('#notes')).not.toBe(panel);
      expect(document.activeElement).toBe(outside);
      expect(dashboard.value).toBe(committed);
      expect(change).toHaveBeenCalledOnce();
      expect(dashboard.shadowRoot!.querySelector('nve-ghost')).toBeNull();
    });

    it('handles a reentrant application arrow once without replaying the outer key', async () => {
      const dashboard = await createDashboard();
      const notes = dashboard.querySelector('#notes')!;
      const cases = dashboard.querySelector('#cases')!;
      const previous = cases.shadowRoot!.querySelector<HTMLElement>('[data-dashboard-action="move"]')!;
      const inner = notes.shadowRoot!.querySelector<HTMLElement>('[data-dashboard-action="resize"]')!;
      const change = vi.fn();

      dashboard.addEventListener('change', change);
      dashboard.addEventListener(
        'change',
        () => {
          inner.focus();
          inner.dispatchEvent(
            new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, composed: true, cancelable: true })
          );
        },
        { once: true }
      );
      previous.focus();
      await userEvent.keyboard('{ArrowLeft}');
      await settle(dashboard);

      expect(change).toHaveBeenCalledTimes(2);
      expect(notes.shadowRoot!.activeElement).toBe(inner);
      expect(JSON.parse(dashboard.value).items.find((item: { id: string }) => item.id === 'notes')).toMatchObject({
        columnSpan: 2,
        rowSpan: 3
      });

      await userEvent.keyboard('{Enter}{Escape}');
      await settle(dashboard);

      expect(change).toHaveBeenCalledTimes(2);
      expect(dashboard.shadowRoot!.querySelector('nve-ghost')).toBeNull();
    });

    for (const key of ['Enter', 'Escape'] as const) {
      it(`keeps ${key} followed by blur from publishing a second keyboard result`, async () => {
        const dashboard = await createDashboard();
        const panel = dashboard.querySelector('#notes')!;
        const control = panel.shadowRoot!.querySelector<HTMLElement>('[data-dashboard-action="move"]')!;
        const value = dashboard.value;
        const change = vi.fn();

        dashboard.addEventListener('change', change);
        control.focus();
        await userEvent.keyboard(`{ArrowDown}{${key}}`);

        panel.querySelector('input')!.focus();
        await settle(dashboard);

        expect(change).toHaveBeenCalledOnce();
        expect(dashboard.value).not.toBe(value);
        expect(document.activeElement).toBe(panel.querySelector('input'));
      });
    }

    it('keeps a blocked keyboard arrow silent when focus leaves', async () => {
      const dashboard = await createDashboard();
      const panel = dashboard.querySelector('#notes')!;
      const value = dashboard.value;
      const change = vi.fn();

      dashboard.addEventListener('change', change);
      panel.shadowRoot!.querySelector<HTMLElement>('[data-dashboard-action="move"]')!.focus();
      await userEvent.keyboard('{ArrowLeft}');

      panel.querySelector('input')!.focus();
      await settle(dashboard);

      expect(dashboard.value).toBe(value);
      expect(change).not.toHaveBeenCalled();
    });

    for (const { mutation, changeCount } of [
      { mutation: 'remove', changeCount: 2 },
      { mutation: 'replace', changeCount: 1 },
      { mutation: 'disable', changeCount: 1 },
      { mutation: 'restore', changeCount: 1 }
    ] as const) {
      it(`respects application ${mutation} after an arrow commit before a pointer gesture`, async () => {
        const dashboard = await createDashboard();
        const notes = dashboard.querySelector('#notes')!;
        const cases = dashboard.querySelector<DashboardPanel>('#cases')!;
        const first = notes.shadowRoot!.querySelector<HTMLElement>('[data-dashboard-action="move"]')!;
        const next = cases.shadowRoot!.querySelector<HTMLElement>('[data-dashboard-action="move"]')!;
        const capture = vi.spyOn(dashboard, 'setPointerCapture').mockImplementation(() => {});
        const change = vi.fn();
        const restored = JSON.stringify({
          ...layout(),
          grid: { flow: 'vertical', tracks: 6 },
          items: layout().items.map(item => {
            if (item.id === 'notes') return { ...item, row: 3 };
            if (item.id === 'cases') return { ...item, column: 4 };

            return item;
          })
        });

        dashboard.addEventListener('change', event => {
          if (event.target !== dashboard) return;

          change();

          if (mutation === 'remove') {
            cases.remove();
          } else if (mutation === 'replace') {
            cases.replaceWith(cases.cloneNode(true));
          } else if (mutation === 'disable') {
            cases.moveDisabled = true;
          } else {
            dashboard.style.width = '480px';
            dashboard.style.setProperty('--gap', '20px');
            dashboard.value = restored;
          }
        });
        first.focus();
        await userEvent.keyboard('{ArrowDown}');
        await settle(dashboard);

        const box = next.getBoundingClientRect();
        const x = box.left + box.width / 2;
        const y = box.top + box.height / 2;

        next.dispatchEvent(pointer('pointerdown', x, y));
        await rendered(dashboard);

        expect(change).toHaveBeenCalledTimes(changeCount);
        expect(capture).toHaveBeenCalledTimes(mutation === 'restore' ? 1 : 0);

        if (mutation === 'remove') {
          expect(
            JSON.parse(dashboard.value).items.map((item: DashboardLayout['items'][number]) => item.id)
          ).not.toContain('cases');
        }

        if (mutation === 'restore') {
          dashboard.dispatchEvent(pointer('pointermove', x + 13, y + 13));
          await rendered(dashboard);

          const ghost = dashboard.shadowRoot!.querySelector<HTMLElement>('nve-ghost')!;

          expect(ghost).not.toBeNull();
          expect(Number.parseFloat(ghost.style.getPropertyValue('--_dashboard-inline-start'))).toBeCloseTo(
            ((viewport(dashboard).clientWidth + 20) / 6) * 4
          );
        }

        dashboard.dispatchEvent(pointer('pointercancel', x, y));
        await settle(dashboard);

        expect(change).toHaveBeenCalledTimes(changeCount);

        if (mutation === 'restore') {
          expect(JSON.parse(dashboard.value).items).toEqual([
            { id: 'notes', column: 0, row: 0, columnSpan: 2, rowSpan: 2 },
            { id: 'cases', column: 4, row: 0, columnSpan: 2, rowSpan: 2 },
            { id: 'baseline', column: 0, row: 2, columnSpan: 2, rowSpan: 2 }
          ]);
        }

        expect(dashboard.shadowRoot!.querySelector('nve-ghost')).toBeNull();
      });
    }

    for (const action of ['move', 'resize'] as const) {
      it(`starts another panel's ${action} pointer gesture without repeating the prior arrow commit`, async () => {
        const dashboard = await createDashboard();
        const notes = dashboard.querySelector('#notes')!;
        const cases = dashboard.querySelector('#cases')!;
        const first = notes.shadowRoot!.querySelector<HTMLElement>('[data-dashboard-action="move"]')!;
        const next = cases.shadowRoot!.querySelector<HTMLElement>(`[data-dashboard-action="${action}"]`)!;
        const change = vi.fn();

        dashboard.addEventListener('change', change);
        first.focus();
        await userEvent.keyboard('{ArrowDown}');
        await settle(dashboard);

        vi.spyOn(next, 'setPointerCapture').mockImplementation(() => {});

        const box = next.getBoundingClientRect();
        const x = box.left + box.width / 2;
        const y = box.top + box.height / 2;

        next.dispatchEvent(pointer('pointerdown', x, y));
        await rendered(dashboard);

        expect(JSON.parse(dashboard.value).items.find((item: { id: string }) => item.id === 'notes').row).toBe(2);
        expect(change).toHaveBeenCalledOnce();

        dashboard.dispatchEvent(pointer('pointercancel', x, y));
        await settle(dashboard);

        expect(change).toHaveBeenCalledOnce();
        expect(dashboard.shadowRoot!.querySelector('nve-ghost')).toBeNull();
      });
    }
  });

  it('respects application focus chosen immediately after external restoration', async () => {
    const dashboard = await createDashboard();
    const panel = dashboard.querySelector('#notes')!;
    const input = panel.querySelector('input')!;
    const control = panel.shadowRoot!.querySelector<HTMLElement>('[data-dashboard-action="move"]')!;
    const value = dashboard.value;

    control.focus();
    await userEvent.keyboard('{ArrowDown}');

    dashboard.value = value;
    input.focus();
    await settle(dashboard);

    expect(document.activeElement).toBe(input);
    expect(dashboard.value).toBe(value);
  });

  it('cancels a pointer preview before silently restoring a new external value', async () => {
    const dashboard = await createDashboard();
    const panel = dashboard.querySelector('#notes')!;
    const control = panel.shadowRoot!.querySelector<HTMLElement>('[data-dashboard-action="move"]')!;
    const box = control.getBoundingClientRect();
    const x = box.left + 18;
    const y = box.top + 24;
    const change = vi.fn();

    dashboard.addEventListener('change', change);
    control.dispatchEvent(pointer('pointerdown', x, y));
    dashboard.dispatchEvent(pointer('pointermove', x + 314, y));
    await rendered(dashboard);

    expect(dashboard.shadowRoot!.querySelector('nve-ghost')).not.toBeNull();

    const restored = JSON.stringify({
      ...layout(),
      items: [
        { id: 'notes', column: 0, row: 3, columnSpan: 2, rowSpan: 2 },
        { id: 'cases', column: 2, row: 0, columnSpan: 2, rowSpan: 2 },
        { id: 'baseline', column: 0, row: 6, columnSpan: 2, rowSpan: 2 }
      ]
    });
    const canonical = JSON.stringify({
      ...layout(),
      items: layout().items.map(item => (item.id === 'baseline' ? { ...item, row: 2 } : item))
    });

    dashboard.value = restored;
    await settle(dashboard);

    expect(dashboard.value).toBe(canonical);
    expect(dashboard.shadowRoot!.querySelector('nve-ghost')).toBeNull();
    expect(change).not.toHaveBeenCalled();

    dashboard.dispatchEvent(pointer('pointerup', x + 314, y));
    await userEvent.keyboard('{Enter}');

    expect(dashboard.value).toBe(canonical);
    expect(change).not.toHaveBeenCalled();
  });

  it('allows live application body updates during a pointer preview without changing content ownership', async () => {
    const dashboard = await createDashboard();
    const panel = dashboard.querySelector('#notes')!;
    const control = panel.shadowRoot!.querySelector<HTMLElement>('[data-dashboard-action="move"]')!;
    const box = control.getBoundingClientRect();
    const x = box.left + 18;
    const y = box.top + 24;
    const value = dashboard.value;
    const change = vi.fn();

    dashboard.addEventListener('change', change);
    control.dispatchEvent(pointer('pointerdown', x, y));
    dashboard.dispatchEvent(pointer('pointermove', x + 314, y));

    const liveContent = document.createElement('span');

    liveContent.textContent = 'New test result';
    panel.append(liveContent);
    await rendered(dashboard);

    expect(dashboard.shadowRoot!.querySelector('nve-ghost')).not.toBeNull();
    expect(dashboard.value).toBe(value);

    dashboard.dispatchEvent(pointer('pointerup', x + 314, y));
    await settle(dashboard);

    expect(dashboard.value).not.toBe(value);
    expect(panel.contains(liveContent)).toBe(true);
    expect(change).toHaveBeenCalledOnce();
  });

  it('preserves inherited application RTL direction and reveals focused horizontal panels', async () => {
    const dashboard = await createDashboard('horizontal');

    dashboard.dir = 'rtl';
    await settle(dashboard);

    const notes = dashboard.querySelector<HTMLElement>('#notes')!;

    expect(getComputedStyle(notes).direction).toBe('rtl');
    expect(getComputedStyle(notes.querySelector('input')!).direction).toBe('rtl');

    const baseline = dashboard.querySelector('#baseline')!;
    const control = baseline.shadowRoot!.querySelector<HTMLElement>('[data-dashboard-action="move"]')!;
    const value = dashboard.value;

    control.focus();
    await settle(dashboard);

    const bounds = viewport(dashboard).getBoundingClientRect();
    const panelBounds = baseline.getBoundingClientRect();

    expect(panelBounds.left).toBeGreaterThanOrEqual(bounds.left - 1);
    expect(panelBounds.right).toBeLessThanOrEqual(bounds.right + 1);
    expect(dashboard.value).toBe(value);
  });

  for (const flow of ['vertical', 'horizontal'] as const) {
    it(`cancels a ${flow} pointer preview and restores every displaced panel`, async () => {
      const dashboard = await createDashboard(flow);
      const notes = dashboard.querySelector<HTMLElement>('#notes')!;
      const cases = dashboard.querySelector<HTMLElement>('#cases')!;
      const control = notes.shadowRoot!.querySelector<HTMLElement>('[data-dashboard-action="move"]')!;

      vi.spyOn(control, 'setPointerCapture').mockImplementation(() => {});

      const source = notes.getBoundingClientRect();
      const target = cases.getBoundingClientRect();
      const value = dashboard.value;
      const change = vi.fn();

      dashboard.addEventListener('change', change);

      const x = source.left + 20;
      const y = source.top + 20;

      control.dispatchEvent(pointer('pointerdown', x, y));
      dashboard.dispatchEvent(pointer('pointermove', x + target.left - source.left, y));
      await settle(dashboard);

      expect(dashboard.value).toBe(value);
      expect(cases.getBoundingClientRect().left).toBeCloseTo(source.left);
      expect(cases.getBoundingClientRect().top).toBeCloseTo(source.top);

      dashboard.dispatchEvent(pointer('pointercancel', x, y));
      await settle(dashboard);

      expect(notes.getBoundingClientRect().left).toBeCloseTo(source.left);
      expect(notes.getBoundingClientRect().top).toBeCloseTo(source.top);
      expect(cases.getBoundingClientRect().left).toBeCloseTo(target.left);
      expect(cases.getBoundingClientRect().top).toBeCloseTo(target.top);
      expect(dashboard.value).toBe(value);
      expect(change).not.toHaveBeenCalled();
    });
  }

  for (const action of ['move', 'resize'] as const) {
    it(`cancels ${action} when its capability is disabled synchronously before pointer release`, async () => {
      const dashboard = await createDashboard();
      const panel = dashboard.querySelector<HTMLElement>('#notes')!;
      const control = panel.shadowRoot!.querySelector<HTMLElement>(`[data-dashboard-action="${action}"]`)!;

      vi.spyOn(control, 'setPointerCapture').mockImplementation(() => {});

      const bounds = control.getBoundingClientRect();
      const value = dashboard.value;
      const change = vi.fn();

      dashboard.addEventListener('change', change);

      const x = bounds.left + bounds.width / 2;
      const y = bounds.top + bounds.height / 2;

      control.dispatchEvent(pointer('pointerdown', x, y));
      dashboard.dispatchEvent(pointer('pointermove', x, y + 128));
      await settle(dashboard);

      dashboard.rearrangeable = false;
      dashboard.dispatchEvent(pointer('pointerup', x, y + 128));
      await settle(dashboard);

      expect(dashboard.value).toBe(value);
      expect(change).not.toHaveBeenCalled();
    });
  }

  for (const interruption of ['neighbor constraint', 'panel membership'] as const) {
    it(`cancels a displayed pointer preview when ${interruption} changes before release`, async () => {
      const dashboard = await createDashboard();
      const panel = dashboard.querySelector<HTMLElement>('#notes')!;
      const control = panel.shadowRoot!.querySelector<HTMLElement>('[data-dashboard-action="move"]')!;

      vi.spyOn(control, 'setPointerCapture').mockImplementation(() => {});

      const source = panel.getBoundingClientRect();
      const bounds = control.getBoundingClientRect();
      const value = dashboard.value;
      const change = vi.fn();

      dashboard.addEventListener('change', change);

      const x = bounds.left + bounds.width / 2;
      const y = bounds.top + bounds.height / 2;

      control.dispatchEvent(pointer('pointerdown', x, y));
      dashboard.dispatchEvent(pointer('pointermove', x, y + 128));
      await settle(dashboard);

      expect(panel.getBoundingClientRect().top).toBeGreaterThan(source.top);

      if (interruption === 'neighbor constraint') {
        dashboard.querySelector<DashboardPanel>('#cases')!.minRowSpan = 3;
      } else {
        const added = document.createElement('nve-dashboard-panel');

        added.id = 'added';

        const header = document.createElement('nve-dashboard-panel-header');

        header.textContent = 'Added report';
        added.append(header);
        dashboard.append(added);
      }

      dashboard.dispatchEvent(pointer('pointerup', x, y + 128));

      expect(dashboard.value).toBe(value);
      expect(change).not.toHaveBeenCalled();

      await settle(dashboard);

      expect(panel.getBoundingClientRect().top).toBeCloseTo(source.top);
      expect(change).toHaveBeenCalledOnce();
    });
  }

  it('keeps application controls and a composed grid mounted through placement and restoration', async () => {
    const dashboard = await createDashboard();
    const cases = dashboard.querySelector('#cases')!;

    cases.replaceChildren();

    const grid = document.createElement('nve-grid');

    grid.setAttribute('aria-label', 'Application results');
    grid.setAttribute('container', 'flat');
    grid.style.setProperty('--scroll-height', '96px');
    grid.innerHTML =
      '<nve-grid-header><nve-grid-column width="200px">Case</nve-grid-column><nve-grid-column width="200px">Result</nve-grid-column><nve-grid-column width="200px">Duration</nve-grid-column></nve-grid-header>' +
      Array.from(
        { length: 4 },
        (_, index) =>
          '<nve-grid-row><nve-grid-cell>Case ' +
          String(index) +
          '</nve-grid-cell><nve-grid-cell>Passed</nve-grid-cell><nve-grid-cell>One second</nve-grid-cell></nve-grid-row>'
      ).join('');
    cases.append(grid);

    const independent = document.createElement('div');

    independent.style.cssText = 'width:140px;height:60px;overflow:auto';
    independent.innerHTML = '<div style="width:400px;height:180px">Application scroll area</div>';
    dashboard.querySelector('#baseline')!.append(independent);
    await settle(dashboard);

    const scroll = grid.shadowRoot!.querySelector<HTMLElement>('[part="_scrollbox"]')!;

    await vi.waitFor(() => expect(scroll.scrollWidth).toBeGreaterThan(scroll.clientWidth));

    scroll.scrollLeft = 75;
    scroll.scrollTop = 40;
    independent.scrollLeft = 35;
    independent.scrollTop = 20;

    const row = grid.querySelector<GridRow>('nve-grid-row')!;

    row.selected = true;

    const input = dashboard.querySelector('input')!;
    const select = dashboard.querySelector('select')!;

    input.value = 'Unsaved investigation notes';
    input.focus();
    input.setSelectionRange(2, 9);
    select.selectedIndex = 1;

    const panels = [...dashboard.children];
    const value = dashboard.value;
    const changed = vi.fn();

    dashboard.addEventListener('change', event => {
      if (event.target === dashboard) {
        changed();
      }
    });

    expect(dashboard.place('notes', { column: 2, row: 2, columnSpan: 2, rowSpan: 2 })).toBe(true);
    await settle(dashboard);

    dashboard.value = value;
    await settle(dashboard);

    expect(changed).toHaveBeenCalledOnce();
    expect([...dashboard.children]).toEqual(panels);
    expect(dashboard.querySelector('input')).toBe(input);
    expect(input.value).toBe('Unsaved investigation notes');
    expect([input.selectionStart, input.selectionEnd]).toEqual([2, 9]);
    expect(document.activeElement).toBe(input);
    expect(select.selectedIndex).toBe(1);
    expect(cases.querySelector('nve-grid')).toBe(grid);
    expect(grid.querySelector('nve-grid-row')).toBe(row);
    expect(row.selected).toBe(true);
    expect([scroll.scrollLeft, scroll.scrollTop]).toEqual([75, 40]);
    expect([independent.scrollLeft, independent.scrollTop]).toEqual([35, 20]);

    changed.mockClear();

    const column = grid.querySelector<HTMLElement>('nve-grid-column')!;

    column.focus();
    await userEvent.keyboard('{ArrowDown}');

    expect(document.activeElement).not.toBe(column);
    expect(grid.contains(document.activeElement)).toBe(true);
    expect(dashboard.value).toBe(value);
    expect(changed).not.toHaveBeenCalled();
  });
});
