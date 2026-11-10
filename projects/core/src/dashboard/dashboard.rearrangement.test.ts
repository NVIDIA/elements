// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';

import { createFixture, elementIsStable, removeFixture } from '@internals/testing';

import type { Dashboard, DashboardLayout, DashboardPanel } from './index.js';

import './define.js';

describe('dashboard rearrangement', () => {
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

  it('routes an application command through the same placement and change boundary', async () => {
    const dashboard = await createDashboard();
    const panel = dashboard.querySelector<DashboardPanel>('#notes')!;
    const invoker = document.createElement('button');

    invoker.type = 'button';
    invoker.textContent = 'Place notes';
    invoker.command = '--place';
    invoker.commandForElement = panel;
    Object.assign(invoker, { placement: { column: 0, row: 3, columnSpan: 2, rowSpan: 2 } });
    fixture!.append(invoker);

    const value = dashboard.value;
    const change = vi.fn();

    dashboard.addEventListener('change', change);
    await userEvent.click(invoker);
    await settle(dashboard);

    expect(dashboard.value).not.toBe(value);
    expect(change).toHaveBeenCalledOnce();

    const committed = dashboard.value;

    await userEvent.click(invoker);
    await settle(dashboard);

    expect(dashboard.value).toBe(committed);
    expect(change).toHaveBeenCalledOnce();
  });

  for (const action of ['move', 'resize'] as const) {
    it(`keeps an idle ${action} handle silent after click, Enter, and Space`, async () => {
      const dashboard = await createDashboard();
      const panel = dashboard.querySelector('#notes')!;
      const control = panel.shadowRoot!.querySelector<HTMLElement>(`[data-dashboard-action="${action}"]`)!;
      const value = dashboard.value;
      const change = vi.fn();

      dashboard.addEventListener('change', change);
      await userEvent.click(control);

      for (const key of ['{Enter}', ' ']) {
        control.focus();
        await userEvent.keyboard(key);
        await settle(dashboard);

        expect(dashboard.shadowRoot!.querySelector('nve-ghost')).toBeNull();
        expect(dashboard.shadowRoot!.querySelector('.canvas')!.hasAttribute('data-arranging')).toBe(false);
        expect(control.matches(':state(pressed)')).toBe(false);
        expect(dashboard.value).toBe(value);
        expect(change).not.toHaveBeenCalled();
      }
    });

    it(`commits direct ${action} keyboard placement once and leaves later activation idle`, async () => {
      const dashboard = await createDashboard();
      const panel = dashboard.querySelector('#notes')!;
      const control = panel.shadowRoot!.querySelector<HTMLElement>(`[data-dashboard-action="${action}"]`)!;
      const value = dashboard.value;
      const change = vi.fn();

      dashboard.addEventListener('change', change);
      control.focus();
      await userEvent.keyboard('{ArrowDown}');
      await settle(dashboard);

      expect(dashboard.shadowRoot!.querySelector('nve-ghost')).toBeNull();
      expect(dashboard.value).not.toBe(value);
      expect(change).toHaveBeenCalledOnce();

      await userEvent.keyboard('{Enter}');
      await settle(dashboard);

      const committed = dashboard.value;

      expect(committed).not.toBe(value);
      expect(change).toHaveBeenCalledOnce();

      await userEvent.keyboard('{Enter} ');
      await settle(dashboard);

      expect(dashboard.value).toBe(committed);
      expect(dashboard.shadowRoot!.querySelector('nve-ghost')).toBeNull();
      expect(control.matches(':state(pressed)')).toBe(false);

      expect(change).toHaveBeenCalledOnce();
    });
  }

  it('commits each occupied-slot arrow immediately and keeps Escape from undoing it', async () => {
    const dashboard = await createDashboard();
    const panel = dashboard.querySelector('#notes')!;
    const control = panel.shadowRoot!.querySelector<HTMLElement>('[data-dashboard-action="move"]')!;
    const value = dashboard.value;
    const change = vi.fn();

    dashboard.addEventListener('change', change);
    control.focus();
    await userEvent.keyboard('{ArrowRight}');
    await settle(dashboard);

    const committed = dashboard.value;

    expect(committed).not.toBe(value);
    expect(change).toHaveBeenCalledOnce();
    expect(dashboard.shadowRoot!.querySelector('nve-ghost')).toBeNull();

    await userEvent.keyboard('{Escape}{Enter}');
    await settle(dashboard);

    expect(dashboard.value).toBe(committed);
    expect(change).toHaveBeenCalledOnce();

    await userEvent.keyboard('{ArrowLeft}');
    await settle(dashboard);

    expect(dashboard.value).toBe(value);
    expect(change).toHaveBeenCalledTimes(2);
  });

  it('commits keyboard resizing exactly once without leaking control events as arrangement changes', async () => {
    const dashboard = await createDashboard();
    const panel = dashboard.querySelector('#notes')!;
    const control = panel.shadowRoot!.querySelector<HTMLElement>('[data-dashboard-action="resize"]')!;
    const value = dashboard.value;
    const targets: EventTarget[] = [];

    dashboard.addEventListener('change', event => {
      if (event.target) {
        targets.push(event.target);
      }
    });
    control.focus();
    await userEvent.keyboard('{ArrowDown}');
    await settle(dashboard);

    expect(dashboard.value).not.toBe(value);
    expect(targets).toEqual([dashboard]);

    await userEvent.keyboard('{Enter}');
    await settle(dashboard);

    expect(dashboard.value).not.toBe(value);
    expect(targets).toEqual([dashboard]);
  });

  describe('directional panel arrangement', () => {
    for (const flow of ['vertical', 'horizontal'] as const) {
      for (const axis of ['row', 'column'] as const) {
        it(`distinguishes keyboard steps from reversible pointer exchanges along a physical ${axis} in ${flow} flow`, async () => {
          const dashboard = await createDashboard(flow);

          dashboard.style.width = '1000px';
          dashboard.style.height = '800px';

          const ids = ['notes', 'cases', 'baseline'];

          dashboard.value = JSON.stringify({
            version: 1,
            grid: { flow, tracks: 6 },
            items: ids.map((id, index) => ({
              id,
              column: axis === 'row' ? index * 2 : 0,
              row: axis === 'column' ? index * 2 : 0,
              columnSpan: 2,
              rowSpan: 2
            }))
          });
          await settle(dashboard);

          const panels = ids.map(id => dashboard.querySelector<HTMLElement>(`#${id}`)!);
          if (!panels[0] || !panels[1] || !panels[2]) {
            throw new Error('Missing arrangement fixture panels');
          }

          const origin = panels[0].getBoundingClientRect();
          const last = panels[2].getBoundingClientRect();
          const [sourceTarget, intermediateTarget, destinationTarget] = panels.map(panel => [
            panel.style.getPropertyValue('--_dashboard-inline-start'),
            panel.style.top
          ]);
          const coordinate = axis === 'row' ? 'left' : 'top';
          const key = axis === 'row' ? 'ArrowRight' : 'ArrowDown';
          const distance = last[coordinate] - origin[coordinate];
          const control = panels[0].shadowRoot!.querySelector<HTMLElement>('[data-dashboard-action="move"]')!;
          const value = dashboard.value;
          const change = vi.fn();

          dashboard.addEventListener('change', change);
          control.focus();
          await userEvent.keyboard(`{${key}}{${key}}`);
          await settle(dashboard);

          const acceptedTargets = () => {
            const ghost = dashboard.shadowRoot!.querySelector<HTMLElement>('nve-ghost')!;
            return [
              [ghost.style.getPropertyValue('--_dashboard-inline-start'), ghost.style.top],
              ...panels
                .slice(1)
                .map(panel => [panel.style.getPropertyValue('--_dashboard-inline-start'), panel.style.top])
            ];
          };

          expect(panels[1].getBoundingClientRect()[coordinate]).toBeCloseTo(origin[coordinate]);
          expect(panels[0].getBoundingClientRect()[coordinate]).toBeCloseTo(last[coordinate]);

          const keyboardLayout: DashboardLayout = JSON.parse(dashboard.value);

          expect(keyboardLayout.items.map(item => (axis === 'row' ? item.column : item.row))).toEqual([4, 0, 2]);
          expect(change).toHaveBeenCalledTimes(2);
          expect(dashboard.shadowRoot!.querySelector('nve-ghost')).toBeNull();

          dashboard.value = value;
          await settle(dashboard);

          change.mockClear();
          vi.spyOn(control, 'setPointerCapture').mockImplementation(() => {});

          const handle = control.getBoundingClientRect();
          const x = handle.left + handle.width / 2;
          const y = handle.top + handle.height / 2;

          const moveTo = (delta: number) =>
            dashboard.dispatchEvent(
              pointer('pointermove', x + (axis === 'row' ? delta : 0), y + (axis === 'column' ? delta : 0))
            );

          control.dispatchEvent(pointer('pointerdown', x, y));
          moveTo(distance * 0.1875);
          await settle(dashboard);

          expect(panels[1].getBoundingClientRect()[coordinate]).toBeCloseTo(origin[coordinate] + distance / 2);

          moveTo(distance);
          await settle(dashboard);

          expect(acceptedTargets()).toEqual([destinationTarget, intermediateTarget, sourceTarget]);

          moveTo(distance / 2);
          await settle(dashboard);

          expect(panels[2].getBoundingClientRect()[coordinate]).toBeCloseTo(last[coordinate]);
          expect(acceptedTargets()).toEqual([intermediateTarget, sourceTarget, destinationTarget]);

          moveTo(distance);
          await settle(dashboard);

          expect(acceptedTargets()).toEqual([destinationTarget, intermediateTarget, sourceTarget]);
          expect(dashboard.value).toBe(value);
          expect(change).not.toHaveBeenCalled();

          dashboard.dispatchEvent(
            pointer('pointerup', x + (axis === 'row' ? distance : 0), y + (axis === 'column' ? distance : 0))
          );
          await settle(dashboard);

          expect(change).toHaveBeenCalledOnce();
          expect(ids.map(id => dashboard.querySelector(`#${id}`))).toEqual(panels);

          const committed = JSON.parse(dashboard.value).items;
          const positions = committed.map((item: { column: number; row: number }) =>
            axis === 'row' ? item.column : item.row
          );

          expect(positions).toEqual([4, 2, 0]);
        });
      }
    }
  });

  it('commits sparse free cells and occupied contacts from each current arrangement', async () => {
    const dashboard = await createDashboard();

    dashboard.style.width = '1000px';

    const initial = layout();

    dashboard.value = JSON.stringify({
      ...initial,
      grid: { flow: 'vertical', tracks: 10 },
      items: initial.items.map(item => (item.id === 'cases' ? { ...item, column: 4 } : item))
    });
    await settle(dashboard);

    dashboard.querySelector<HTMLElement>('#baseline')!.hidden = true;
    await settle(dashboard);

    const panel = dashboard.querySelector<HTMLElement>('#notes')!;
    const control = panel.shadowRoot!.querySelector<HTMLElement>('[data-dashboard-action="move"]')!;
    const value = dashboard.value;
    const change = vi.fn();

    dashboard.addEventListener('change', change);
    control.focus();

    const steps = [
      ['ArrowRight', 1],
      ['ArrowRight', 2],
      ['ArrowRight', 4],
      ['ArrowLeft', 2],
      ['ArrowLeft', 1],
      ['ArrowLeft', 0],
      ['ArrowRight', 1],
      ['ArrowRight', 2],
      ['ArrowRight', 4],
      ['ArrowRight', 5]
    ] as const;

    for (const [key, expected] of steps) {
      await userEvent.keyboard(`{${key}}`);
      await settle(dashboard);

      expect(dashboard.shadowRoot!.querySelector('nve-ghost')).toBeNull();
      expect(
        Number.parseFloat(panel.style.getPropertyValue('--_dashboard-inline-start')) /
          ((viewport(dashboard).clientWidth + 8) / 10)
      ).toBeCloseTo(expected);
    }

    const committed = dashboard.value;

    expect(committed).not.toBe(value);

    await userEvent.keyboard('{Escape}');
    await settle(dashboard);

    expect(dashboard.value).toBe(committed);
    expect(change).toHaveBeenCalledTimes(steps.length);
  });

  describe('physical keyboard directions', () => {
    for (const flow of ['vertical', 'horizontal'] as const) {
      for (const direction of ['ltr', 'rtl'] as const) {
        it(`keeps every isolated top-row panel packed before and after a transverse arrow in ${flow} ${direction}`, async () => {
          const dashboard = await createDashboard(flow);

          dashboard.dir = direction;

          const ids = ['notes', 'cases', 'baseline'];
          const initial = JSON.stringify({
            version: 1,
            grid: { flow, tracks: 6 },
            items: ids.map((id, index) => ({
              id,
              column: flow === 'vertical' ? index * 2 : 0,
              row: flow === 'horizontal' ? index * 2 : 0,
              columnSpan: 2,
              rowSpan: 2
            }))
          });
          const keys =
            flow === 'vertical'
              ? {
                  growth: 'ArrowDown',
                  positive: direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight',
                  negative: direction === 'rtl' ? 'ArrowRight' : 'ArrowLeft'
                }
              : {
                  growth: direction === 'rtl' ? 'ArrowLeft' : 'ArrowRight',
                  positive: 'ArrowDown',
                  negative: 'ArrowUp'
                };
          const change = vi.fn();

          dashboard.addEventListener('change', change);

          for (const id of ids) {
            dashboard.value = initial;
            await settle(dashboard);

            change.mockClear();

            const control = dashboard
              .querySelector(`#${id}`)!
              .shadowRoot!.querySelector<HTMLElement>('[data-dashboard-action="move"]')!;

            control.focus();
            await userEvent.keyboard(`{${keys.growth}}`);
            await settle(dashboard);

            expect(dashboard.value).toBe(initial);
            expect(change).not.toHaveBeenCalled();

            await userEvent.keyboard(`{${id === 'baseline' ? keys.negative : keys.positive}}`);
            await settle(dashboard);

            const reordered = dashboard.value;

            expect(reordered).not.toBe(initial);
            expect(change).toHaveBeenCalledOnce();

            await userEvent.keyboard(`{${keys.growth}}{Enter}{Escape}`);
            await settle(dashboard);

            expect(dashboard.value).toBe(reordered);
            expect(change).toHaveBeenCalledOnce();
            expect(dashboard.shadowRoot!.querySelector('nve-ghost')).toBeNull();
          }
        });

        it(`moves into occupied lower contacts from the current arrangement in ${flow} ${direction}`, async () => {
          const dashboard = await createDashboard(flow);

          dashboard.dir = direction;

          const fourth = document.createElement('nve-dashboard-panel');

          fourth.id = 'lower-cases';
          fourth.innerHTML =
            '<nve-dashboard-panel-header>Lower cases</nve-dashboard-panel-header><nve-dashboard-panel-content>Application content</nve-dashboard-panel-content>';
          dashboard.append(fourth);

          const items = [
            { id: 'notes', column: 0, row: 0, columnSpan: 2, rowSpan: 2 },
            { id: 'cases', column: 2, row: 0, columnSpan: 2, rowSpan: 2 },
            { id: 'baseline', column: 0, row: 2, columnSpan: 2, rowSpan: 2 },
            { id: 'lower-cases', column: 2, row: 2, columnSpan: 2, rowSpan: 2 }
          ];
          const initial = JSON.stringify({
            version: 1,
            grid: { flow, tracks: 4 },
            items: flow === 'vertical' ? items : items.map(item => ({ ...item, column: item.row, row: item.column }))
          });
          const keys =
            flow === 'vertical'
              ? ['ArrowDown', 'ArrowUp']
              : direction === 'rtl'
                ? ['ArrowLeft', 'ArrowRight']
                : ['ArrowRight', 'ArrowLeft'];
          const coordinate = flow === 'vertical' ? 'row' : 'column';
          const change = vi.fn();

          dashboard.addEventListener('change', change);

          for (const id of ['notes', 'cases']) {
            dashboard.value = initial;
            await settle(dashboard);

            change.mockClear();

            const control = dashboard
              .querySelector(`#${id}`)!
              .shadowRoot!.querySelector<HTMLElement>('[data-dashboard-action="move"]')!;

            control.focus();
            await userEvent.keyboard(`{${keys[0]}}`);
            await settle(dashboard);

            expect(JSON.parse(dashboard.value).items.find((item: { id: string }) => item.id === id)[coordinate]).toBe(
              2
            );

            const committed = dashboard.value;

            expect(change).toHaveBeenCalledOnce();

            await userEvent.keyboard(`{${keys[0]}}`);
            await settle(dashboard);

            expect(dashboard.value).toBe(committed);
            expect(change).toHaveBeenCalledOnce();

            await userEvent.keyboard(`{${keys[1]}}{Enter}{Escape}`);
            await settle(dashboard);

            expect(dashboard.value).toBe(initial);
            expect(change).toHaveBeenCalledTimes(2);
            expect(dashboard.shadowRoot!.querySelector('nve-ghost')).toBeNull();
          }
        });
      }
    }
  });

  it('keeps an immediately committed keyboard placement when another step exceeds the bounded tracks', async () => {
    const dashboard = await createDashboard();
    const panel = dashboard.querySelector('#notes')!;
    const change = vi.fn();

    dashboard.addEventListener('change', change);
    panel.shadowRoot!.querySelector<HTMLElement>('[data-dashboard-action="move"]')!.focus();
    await userEvent.keyboard('{ArrowRight}{ArrowRight}');
    await settle(dashboard);

    const lastValid = panel.getBoundingClientRect();

    await userEvent.keyboard('{ArrowRight}');
    await settle(dashboard);

    expect(panel.getBoundingClientRect().left).toBeCloseTo(lastValid.left);

    await userEvent.keyboard('{Enter}');
    await settle(dashboard);

    expect(panel.getBoundingClientRect().left).toBeCloseTo(lastValid.left);
    expect(change).toHaveBeenCalledOnce();
  });

  for (const flow of ['vertical', 'horizontal'] as const) {
    for (const drift of [-0.6, 0.6]) {
      it(`admits a full-track ${flow} drag with ${drift} cells of lateral drift while keeping commands strict`, async () => {
        const dashboard = await createDashboard(flow);

        dashboard.style.height = '700px';

        const items = [
          { id: 'notes', column: 0, row: 0, columnSpan: 3, rowSpan: 2 },
          { id: 'cases', column: 3, row: 0, columnSpan: 3, rowSpan: 2 },
          { id: 'baseline', column: 0, row: 2, columnSpan: 6, rowSpan: 2 }
        ];

        dashboard.value = JSON.stringify({
          version: 1,
          grid: { flow, tracks: 6 },
          items:
            flow === 'vertical'
              ? items
              : items.map(item => ({
                  ...item,
                  column: item.row,
                  row: item.column,
                  columnSpan: item.rowSpan,
                  rowSpan: item.columnSpan
                }))
        });
        await settle(dashboard);

        const panel = dashboard.querySelector<HTMLElement>('#baseline')!;
        const control = panel.shadowRoot!.querySelector<HTMLElement>('[data-dashboard-action="move"]')!;
        const bounds = panel.getBoundingClientRect();
        const handle = control.getBoundingClientRect();
        const x = handle.left + handle.width / 2;
        const y = handle.top + handle.height / 2;
        const pitchX = flow === 'vertical' ? (viewport(dashboard).clientWidth + 8) / 6 : 168;
        const pitchY = flow === 'vertical' ? 128 : (viewport(dashboard).clientHeight + 8) / 6;
        const dx = flow === 'vertical' ? drift * pitchX : -2 * pitchX;
        const dy = flow === 'vertical' ? -2 * pitchY : drift * pitchY;
        const span = flow === 'vertical' ? { columnSpan: 6, rowSpan: 2 } : { columnSpan: 2, rowSpan: 6 };
        const invalidOrigin = flow === 'vertical' ? { column: 1, row: 0 } : { column: 0, row: 1 };
        const change = vi.fn();

        dashboard.addEventListener('change', change);
        control.dispatchEvent(pointer('pointerdown', x, y));
        dashboard.dispatchEvent(pointer('pointermove', x + dx, y + dy));
        await rendered(dashboard);

        const ghost = dashboard.shadowRoot!.querySelector<HTMLElement>('nve-ghost')!;

        expect(ghost).not.toBeNull();
        expect(ghost.style.getPropertyValue('--_dashboard-inline-start')).toBe('0px');
        expect(ghost.style.top).toBe('0px');
        expect(panel.getBoundingClientRect().left).toBeCloseTo(bounds.left + dx);
        expect(panel.getBoundingClientRect().top).toBeCloseTo(bounds.top + dy);

        dashboard.dispatchEvent(pointer('pointerup', x + dx, y + dy));
        await settle(dashboard);

        expect(JSON.parse(dashboard.value).items.find((item: { id: string }) => item.id === 'baseline')).toEqual({
          id: 'baseline',
          column: 0,
          row: 0,
          ...span
        });
        expect(change).toHaveBeenCalledOnce();

        expect(
          dashboard.place('baseline', {
            ...invalidOrigin,
            ...span
          })
        ).toBe(false);
        expect(change).toHaveBeenCalledOnce();
      });
    }
  }

  it('announces grid spans after keyboard resizing with the shared default template', async () => {
    const dashboard = await createDashboard('vertical', 'fit', false);
    const panel = dashboard.querySelector('#notes')!;
    const control = panel.shadowRoot!.querySelector<HTMLElement>('.grip > [data-dashboard-action="resize"]')!;

    control.focus();
    await userEvent.keyboard('{ArrowRight}');
    await settle(dashboard);

    expect(dashboard.shadowRoot!.querySelector('[role="status"]')!.textContent?.trim()).toBe(
      'Notes: column 1, row 1, column span 3, row span 2'
    );
  });

  it('steps from settled mixed-height positions and keeps each commit at a directional boundary', async () => {
    const dashboard = await createDashboard();

    dashboard.value = JSON.stringify({
      version: 1,
      grid: { flow: 'vertical', tracks: 6 },
      items: [
        { id: 'notes', column: 0, row: 0, columnSpan: 6, rowSpan: 2 },
        { id: 'cases', column: 0, row: 2, columnSpan: 6, rowSpan: 6 },
        { id: 'baseline', column: 0, row: 8, columnSpan: 6, rowSpan: 1 }
      ]
    });
    dashboard.i18n = {
      gridPlacement: 'row={row}, column={column}, spans={columnSpan}/{rowSpan}',
      placementUnavailable: 'Cannot place'
    };
    await settle(dashboard);

    const panel = dashboard.querySelector('#notes')!;
    const control = panel.shadowRoot!.querySelector<HTMLElement>('[data-dashboard-action="move"]')!;
    const change = vi.fn();

    dashboard.addEventListener('change', change);
    control.focus();

    let commits = 0;

    for (const [key, row, valid] of [
      ['ArrowDown', 6, true],
      ['ArrowDown', 7, true],
      ['ArrowDown', 7, false],
      ['ArrowUp', 6, true]
    ] as const) {
      await userEvent.keyboard(`{${key}}`);
      await settle(dashboard);

      expect(dashboard.shadowRoot!.querySelector('nve-ghost')).toBeNull();
      expect(JSON.parse(dashboard.value).items.find((item: { id: string }) => item.id === 'notes').row).toBe(row);
      expect(dashboard.shadowRoot!.querySelector('[role="status"]')!.textContent).toContain(
        valid ? `row=${row + 1}, column=1, spans=6/2` : 'Cannot place'
      );

      if (valid) {
        commits++;
      }

      expect(change).toHaveBeenCalledTimes(commits);
    }

    await userEvent.keyboard('{Enter}{Tab}');
    await settle(dashboard);

    expect(JSON.parse(dashboard.value).items.find((item: { id: string }) => item.id === 'notes').row).toBe(6);
    expect(change).toHaveBeenCalledTimes(3);
    expect(dashboard.shadowRoot!.querySelector('nve-ghost')).toBeNull();
  });

  for (const test of [
    {
      name: 'vertical panel movement',
      flow: 'vertical',
      direction: 'ltr',
      target: 'panel',
      command: '--move-right',
      action: 'move',
      key: 'ArrowRight',
      expected: [
        { id: 'notes', column: 2, row: 0, columnSpan: 2, rowSpan: 2 },
        { id: 'cases', column: 0, row: 0, columnSpan: 2, rowSpan: 2 },
        { id: 'baseline', column: 0, row: 6, columnSpan: 2, rowSpan: 2 }
      ]
    },
    {
      name: 'horizontal RTL dashboard movement',
      flow: 'horizontal',
      direction: 'rtl',
      target: 'dashboard',
      command: '--move-left',
      action: 'move',
      key: 'ArrowLeft',
      expected: [
        { id: 'notes', column: 2, row: 0, columnSpan: 2, rowSpan: 2 },
        { id: 'cases', column: 0, row: 0, columnSpan: 2, rowSpan: 2 },
        { id: 'baseline', column: 6, row: 2, columnSpan: 2, rowSpan: 2 }
      ]
    },
    {
      name: 'vertical RTL dashboard resizing',
      flow: 'vertical',
      direction: 'rtl',
      target: 'dashboard',
      command: '--increase-height',
      action: 'resize',
      key: 'ArrowDown',
      expected: [
        { id: 'notes', column: 0, row: 0, columnSpan: 2, rowSpan: 3 },
        { id: 'cases', column: 2, row: 0, columnSpan: 2, rowSpan: 2 },
        { id: 'baseline', column: 0, row: 6, columnSpan: 2, rowSpan: 2 }
      ]
    },
    {
      name: 'horizontal panel resizing',
      flow: 'horizontal',
      direction: 'ltr',
      target: 'panel',
      command: '--increase-width',
      action: 'resize',
      key: 'ArrowRight',
      expected: [
        { id: 'notes', column: 0, row: 0, columnSpan: 3, rowSpan: 2 },
        { id: 'cases', column: 3, row: 0, columnSpan: 2, rowSpan: 2 },
        { id: 'baseline', column: 6, row: 2, columnSpan: 2, rowSpan: 2 }
      ]
    }
  ] as const) {
    it(`commits ${test.name} against a literal layout through keyboard and Invoker input`, async () => {
      const dashboard = await createDashboard(test.flow, 'fit', false);

      dashboard.dir = test.direction;

      const panel = dashboard.querySelector<DashboardPanel>('#notes')!;
      const initial = dashboard.value;
      const expected = { version: 1, grid: { flow: test.flow, tracks: 4 }, items: test.expected };
      const changed = vi.fn();

      dashboard.addEventListener('change', event => {
        if (event.target === dashboard) {
          changed();
        }
      });

      const control = panel.shadowRoot!.querySelector<HTMLElement>(`[data-dashboard-action="${test.action}"]`)!;

      control.focus();
      await userEvent.keyboard(`{${test.key}}`);

      expect(JSON.parse(dashboard.value)).toEqual(expected);
      expect(changed).toHaveBeenCalledOnce();
      expect(dashboard.shadowRoot!.querySelector('nve-ghost')).toBeNull();

      dashboard.value = initial;
      await settle(dashboard);

      changed.mockClear();

      const invoker = document.createElement('button');

      invoker.type = 'button';
      invoker.textContent = 'Application arrangement action';
      invoker.commandForElement = test.target === 'dashboard' ? dashboard : panel;
      invoker.value = panel.id;
      invoker.command = test.command;
      fixture!.append(invoker);

      expect(dashboard.isCommandAvailable(test.command, { value: panel.id })).toBe(true);

      await userEvent.click(invoker);

      expect(JSON.parse(dashboard.value)).toEqual(expected);
      expect(changed).toHaveBeenCalledOnce();
      expect(document.activeElement).toBe(invoker);
      expect(dashboard.shadowRoot!.querySelector('nve-ghost')).toBeNull();
    });
  }
});
