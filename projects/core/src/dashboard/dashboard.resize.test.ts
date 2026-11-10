// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';

import { createFixture, elementIsStable, removeFixture } from '@internals/testing';

import type { Dashboard, DashboardLayout, DashboardPanel } from './index.js';

import './define.js';

describe('dashboard resize', () => {
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

  describe('four physical pointer resize edges', () => {
    type Edge = 'left' | 'right' | 'top' | 'bottom';

    async function edgeSetup(options: { flow?: 'vertical' | 'horizontal'; autoSettle?: boolean } = {}) {
      const flow = options.flow ?? 'vertical';
      const dashboard = await createDashboard(flow, 'fixed', options.autoSettle ?? false);

      dashboard.style.cssText = 'width:360px;height:480px;--column-size:50px;--row-size:60px;--gap:8px';

      const items = [
        { id: 'notes', column: 1, row: 2, columnSpan: 3, rowSpan: 3 },
        { id: 'cases', column: 1, row: 0, columnSpan: 3, rowSpan: 2 },
        { id: 'baseline', column: 4, row: 0, columnSpan: 2, rowSpan: 1 }
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

      return dashboard;
    }

    function edgeRecord(dashboard: Dashboard) {
      const value: DashboardLayout = JSON.parse(dashboard.value);
      return value.items.find(item => item.id === 'notes')!;
    }

    function edgeSample(
      type: string,
      point: { x: number; y: number },
      pointerType: 'mouse' | 'pen' | 'touch' = 'mouse'
    ) {
      return new PointerEvent(type, {
        clientX: point.x,
        clientY: point.y,
        pointerType,
        pointerId: 7,
        isPrimary: true,
        button: 0,
        buttons: type === 'pointerup' || type === 'pointercancel' ? 0 : 1,
        bubbles: true,
        composed: true,
        cancelable: true
      });
    }

    function edgeStart(options: { dashboard: Dashboard; edge: Edge }) {
      const { dashboard, edge } = options;
      const panel = dashboard.querySelector<DashboardPanel>('#notes')!;
      const zone = panel.shadowRoot!.querySelector<HTMLElement>(`[data-dashboard-edge="${edge}"]`)!;

      expect(zone).not.toBeNull();

      const bounds = panel.getBoundingClientRect();
      const point = {
        x: edge === 'left' ? bounds.left + 0.5 : edge === 'right' ? bounds.right - 0.5 : bounds.left + bounds.width / 2,
        y: edge === 'top' ? bounds.top + 0.5 : edge === 'bottom' ? bounds.bottom - 0.5 : bounds.top + bounds.height / 2
      };

      expect(
        panel.shadowRoot!.elementFromPoint(point.x, point.y),
        JSON.stringify({
          edge,
          point,
          bounds: bounds.toJSON(),
          zone: zone.getBoundingClientRect().toJSON(),
          viewport: viewport(dashboard).getBoundingClientRect().toJSON(),
          scroll: [viewport(dashboard).scrollLeft, viewport(dashboard).scrollTop],
          window: [innerWidth, innerHeight],
          target: document.elementFromPoint(point.x, point.y)?.tagName
        })
      ).toBe(zone);

      vi.spyOn(zone, 'setPointerCapture').mockImplementation(() => {});
      vi.spyOn(dashboard, 'setPointerCapture').mockImplementation(() => {});
      zone.dispatchEvent(edgeSample('pointerdown', point));

      return { panel, zone, point };
    }

    function edgePreview(dashboard: Dashboard, gap = 8) {
      const ghost = dashboard.shadowRoot!.querySelector<HTMLElement>('nve-ghost')!;

      expect(ghost).not.toBeNull();

      const spacing = gap === 0 ? -1 : gap;

      return {
        column: Number.parseFloat(ghost.style.getPropertyValue('--_dashboard-inline-start')) / (50 + spacing),
        row: Number.parseFloat(ghost.style.top) / (60 + spacing),
        columnSpan: (Number.parseFloat(ghost.style.width) + spacing) / (50 + spacing),
        rowSpan: (Number.parseFloat(ghost.style.height) + spacing) / (60 + spacing)
      };
    }

    for (const flow of ['vertical', 'horizontal'] as const) {
      for (const autoSettle of [false, true]) {
        it(`commits all four edge previews exactly in ${flow} flow with autoSettle=${autoSettle}`, async () => {
          const dashboard = await edgeSetup({ flow, autoSettle });
          const initial = dashboard.value;
          const nodes = [...dashboard.children];
          const input = dashboard.querySelector('input')!;

          input.value = 'Retained edge draft';
          input.setSelectionRange(2, 7);

          const applicationNodes = [...dashboard.querySelectorAll('input,select,nve-dashboard-panel-content')];
          const change = vi.fn();

          dashboard.addEventListener('change', change);

          for (const edge of ['left', 'right', 'top', 'bottom'] as const) {
            dashboard.value = initial;
            await settle(dashboard);

            change.mockClear();

            const { point } = edgeStart({ dashboard, edge });
            const target = {
              x: point.x + (edge === 'left' || edge === 'right' ? 58 : 0),
              y: point.y + (edge === 'top' || edge === 'bottom' ? 68 : 0)
            };

            dashboard.dispatchEvent(edgeSample('pointermove', target));
            await rendered(dashboard);

            const accepted = edgePreview(dashboard);
            const peers = [...dashboard.querySelectorAll<HTMLElement>('nve-dashboard-panel:not(#notes)')].map(panel => [
              panel.style.getPropertyValue('--_dashboard-inline-start'),
              panel.style.top,
              panel.style.width,
              panel.style.height
            ]);

            expect(dashboard.value).toBe(initial);

            dashboard.dispatchEvent(edgeSample('pointerup', target));

            expect(edgeRecord(dashboard)).toEqual({ id: 'notes', ...accepted });
            expect(change).toHaveBeenCalledOnce();

            await settle(dashboard);

            expect(
              [...dashboard.querySelectorAll<HTMLElement>('nve-dashboard-panel:not(#notes)')].map(panel => [
                panel.style.getPropertyValue('--_dashboard-inline-start'),
                panel.style.top,
                panel.style.width,
                panel.style.height
              ])
            ).toEqual(peers);
            expect(dashboard.shadowRoot!.querySelector('nve-ghost')).toBeNull();
          }

          expect([...dashboard.children]).toEqual(nodes);
          expect(dashboard.querySelector('input')).toBe(input);
          expect(input.value).toBe('Retained edge draft');
          expect([input.selectionStart, input.selectionEnd]).toEqual([2, 7]);
          expect([...dashboard.querySelectorAll('input,select,nve-dashboard-panel-content')]).toEqual(applicationNodes);
        });
      }
    }

    it('matches anchored placement permissions for left and top resizing when movement is disabled', async () => {
      const dashboard = await edgeSetup();
      const panel = dashboard.querySelector<DashboardPanel>('#notes')!;

      panel.moveDisabled = true;
      await settle(dashboard);

      const initial = dashboard.value;
      const origin = edgeRecord(dashboard);
      const change = vi.fn();

      dashboard.addEventListener('change', change);

      const placement = { ...origin, column: origin.column - 1, columnSpan: origin.columnSpan + 1 };

      expect(dashboard.isCommandAvailable('--place', { value: 'notes', placement })).toBe(true);

      expect(dashboard.place('notes', placement)).toBe(true);
      expect(edgeRecord(dashboard)).toEqual(placement);
      expect(change).toHaveBeenCalledOnce();

      for (const edge of ['left', 'top'] as const) {
        dashboard.value = initial;
        await settle(dashboard);

        change.mockClear();

        const { point } = edgeStart({ dashboard, edge });
        const target = { x: point.x + (edge === 'left' ? -58 : 0), y: point.y + (edge === 'top' ? 68 : 0) };

        dashboard.dispatchEvent(edgeSample('pointermove', target));
        await rendered(dashboard);

        dashboard.dispatchEvent(edgeSample('pointerup', target));

        const result = edgeRecord(dashboard);

        expect(edge === 'left' ? result.column + result.columnSpan : result.row + result.rowSpan).toBe(
          edge === 'left' ? origin.column + origin.columnSpan : origin.row + origin.rowSpan
        );
        expect(edge === 'left' ? result.column : result.row).toBe(edge === 'left' ? origin.column - 1 : origin.row + 1);
        expect(change).toHaveBeenCalledOnce();
      }
    });

    for (const edge of ['left', 'top'] as const) {
      it(`quantizes the ${edge} edge at min/max spans and the physical origin without shifting its opposite boundary`, async () => {
        const dashboard = await edgeSetup();
        const panel = dashboard.querySelector<DashboardPanel>('#notes')!;

        dashboard.querySelector<HTMLElement>('#cases')!.hidden = true;
        dashboard.querySelector<HTMLElement>('#baseline')!.hidden = true;
        panel.minColumnSpan = 2;
        panel.maxColumnSpan = 4;
        panel.minRowSpan = 2;
        panel.maxRowSpan = 4;
        await settle(dashboard);

        const initial = dashboard.value;
        const origin = edgeRecord(dashboard);

        for (const delta of [-1000, 1000]) {
          dashboard.value = initial;
          await settle(dashboard);

          const { point } = edgeStart({ dashboard, edge });
          const target = { x: point.x + (edge === 'left' ? delta : 0), y: point.y + (edge === 'top' ? delta : 0) };

          dashboard.dispatchEvent(edgeSample('pointermove', target));
          await rendered(dashboard);

          const accepted = edgePreview(dashboard);

          expect(edge === 'left' ? accepted.columnSpan : accepted.rowSpan).toBe(delta < 0 ? 4 : 2);
          expect(edge === 'left' ? accepted.column + accepted.columnSpan : accepted.row + accepted.rowSpan).toBe(
            edge === 'left' ? origin.column + origin.columnSpan : origin.row + origin.rowSpan
          );

          dashboard.dispatchEvent(edgeSample('pointerup', target));

          expect(edgeRecord(dashboard)).toEqual({ id: 'notes', ...accepted });
        }
      });
    }

    for (const interruption of ['Escape', 'pointercancel', 'lostpointercapture'] as const) {
      it(`cancels an edge from application input focus on ${interruption} and ignores a later release`, async () => {
        const dashboard = await edgeSetup();
        const input = dashboard.querySelector('input')!;

        input.value = 'Keep application input';
        input.focus();

        const value = dashboard.value;
        const change = vi.fn();

        dashboard.addEventListener('change', change);

        const { panel, zone, point } = edgeStart({ dashboard, edge: 'left' });
        const target = { x: point.x - 58, y: point.y };

        dashboard.dispatchEvent(edgeSample('pointermove', target));
        await rendered(dashboard);

        expect(dashboard.shadowRoot!.querySelector('nve-ghost')).not.toBeNull();
        expect(panel.shadowRoot!.activeElement).toBe(
          panel.shadowRoot!.querySelector('.resize-grip > [data-dashboard-action="resize"]')
        );

        if (interruption === 'Escape') {
          await userEvent.keyboard('{Escape}');
        } else if (interruption === 'pointercancel') {
          dashboard.dispatchEvent(edgeSample('pointercancel', target));
        } else {
          zone.dispatchEvent(edgeSample('lostpointercapture', target));
        }

        dashboard.dispatchEvent(edgeSample('pointerup', target));
        await settle(dashboard);

        expect(dashboard.value).toBe(value);
        expect(change).not.toHaveBeenCalled();
        expect(dashboard.shadowRoot!.querySelector('nve-ghost')).toBeNull();
        expect(input.value).toBe('Keep application input');
      });
    }

    it('keeps an oversized panel viewport still after edge release or cancellation and reveals a later keyboard resize', async () => {
      const dashboard = await edgeSetup();

      dashboard.style.cssText = 'width:240px;height:180px;--column-size:100px;--row-size:80px;--gap:8px';
      dashboard.value = JSON.stringify({
        version: 1,
        grid: { flow: 'vertical', tracks: 6 },
        items: [
          { id: 'notes', column: 0, row: 0, columnSpan: 3, rowSpan: 3 },
          { id: 'cases', column: 4, row: 0, columnSpan: 2, rowSpan: 1 },
          { id: 'baseline', column: 4, row: 2, columnSpan: 2, rowSpan: 1 }
        ]
      });
      await settle(dashboard);

      const panel = dashboard.querySelector<DashboardPanel>('#notes')!;
      const body = panel.shadowRoot!.querySelector<HTMLElement>('.body')!;
      const grip = panel.shadowRoot!.querySelector<HTMLElement>('.resize-grip > [data-dashboard-action="resize"]')!;
      const scrollport = viewport(dashboard);

      panel.minColumnSpan = 3;
      await settle(dashboard);

      const initial = dashboard.value;
      const change = vi.fn();

      dashboard.addEventListener('change', change);

      for (const ending of ['pointerup', 'pointercancel'] as const) {
        body.focus({ preventScroll: true });
        scrollport.scrollLeft = 0;
        scrollport.scrollTop = 0;

        const visible = scrollport.getBoundingClientRect();

        expect(grip.getBoundingClientRect().right).toBeGreaterThan(visible.right);
        expect(grip.getBoundingClientRect().bottom).toBeGreaterThan(visible.bottom);

        const { point } = edgeStart({ dashboard, edge: 'left' });

        expect(panel.shadowRoot!.activeElement).toBe(grip);
        expect([scrollport.scrollLeft, scrollport.scrollTop]).toEqual([0, 0]);

        const target = { x: point.x + 3, y: point.y };

        dashboard.dispatchEvent(edgeSample('pointermove', target));
        await rendered(dashboard);

        expect([scrollport.scrollLeft, scrollport.scrollTop]).toEqual([0, 0]);

        dashboard.dispatchEvent(edgeSample(ending, target));
        dashboard.dispatchEvent(edgeSample('pointerup', target));
        await settle(dashboard);

        expect([scrollport.scrollLeft, scrollport.scrollTop]).toEqual([0, 0]);
        expect(dashboard.value).toBe(initial);
        expect(change).not.toHaveBeenCalled();
      }

      await userEvent.keyboard('{ArrowLeft}');
      await settle(dashboard);

      expect(dashboard.value).toBe(initial);
      expect(change).not.toHaveBeenCalled();
      expect(grip.getBoundingClientRect().right).toBeLessThanOrEqual(scrollport.getBoundingClientRect().right + 1);
      expect(grip.getBoundingClientRect().bottom).toBeLessThanOrEqual(scrollport.getBoundingClientRect().bottom + 1);

      scrollport.scrollLeft = 0;
      scrollport.scrollTop = 0;
      await userEvent.keyboard('{ArrowDown}');
      await settle(dashboard);

      expect(edgeRecord(dashboard).rowSpan).toBe(4);
      expect(change).toHaveBeenCalledOnce();

      const visible = scrollport.getBoundingClientRect();
      const bounds = grip.getBoundingClientRect();

      expect(bounds.right).toBeLessThanOrEqual(visible.right + 1);
      expect(bounds.bottom).toBeLessThanOrEqual(visible.bottom + 1);
      expect(panel.shadowRoot!.activeElement).toBe(grip);
    });

    it('keeps a tiny bottom-right or left-edge pickup during a position transition from changing the logical span', async () => {
      const dashboard = await edgeSetup();
      const initial = dashboard.value;
      const panel = dashboard.querySelector<DashboardPanel>('#notes')!;
      const source = edgeRecord(dashboard);

      for (const action of ['bottom-right', 'left'] as const) {
        dashboard.value = initial;
        await settle(dashboard);

        const origin = panel.getBoundingClientRect();

        expect(dashboard.place('notes', { ...source, column: source.column + 1 })).toBe(true);
        await dashboard.updateComplete;
        await panel.updateComplete;

        const transition = panel
          .getAnimations()
          .find(animation => animation instanceof CSSTransition && animation.transitionProperty === 'left');

        expect(transition).toBeDefined();
        transition!.pause();
        transition!.currentTime = Number(transition!.effect!.getComputedTiming().duration) / 2;
        await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

        const painted = panel.getBoundingClientRect();

        expect(painted.left).toBeGreaterThan(origin.left);
        expect(painted.left).toBeLessThan(origin.left + 58);

        const change = vi.fn();

        dashboard.addEventListener('change', change);

        let point: { x: number; y: number };

        if (action === 'left') {
          point = edgeStart({ dashboard, edge: 'left' }).point;
        } else {
          const grip = panel.shadowRoot!.querySelector<HTMLElement>('.resize-grip > [data-dashboard-action="resize"]')!;
          const bounds = grip.getBoundingClientRect();

          point = { x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 };
          vi.spyOn(grip, 'setPointerCapture').mockImplementation(() => {});
          vi.spyOn(dashboard, 'setPointerCapture').mockImplementation(() => {});
          grip.dispatchEvent(edgeSample('pointerdown', point));
        }

        const captured = panel.getBoundingClientRect();
        const target = { x: point.x + 13, y: point.y };

        dashboard.dispatchEvent(edgeSample('pointermove', target));
        await rendered(dashboard);

        const raw = panel.getBoundingClientRect();

        expect(raw.left).toBeCloseTo(captured.left + (action === 'left' ? 13 : 0));
        expect(raw.width).toBeCloseTo(captured.width + (action === 'left' ? -13 : 13));
        expect(edgePreview(dashboard)).toEqual({
          column: source.column + 1,
          row: source.row,
          columnSpan: source.columnSpan,
          rowSpan: source.rowSpan
        });

        dashboard.dispatchEvent(edgeSample('pointerup', target));
        await settle(dashboard);

        expect(edgeRecord(dashboard)).toEqual({ ...source, column: source.column + 1 });
        expect(change).not.toHaveBeenCalled();

        dashboard.removeEventListener('change', change);
      }
    });

    it('keeps committed spans when an outward grip resize interrupts an earlier size transition', async () => {
      const dashboard = await edgeSetup();
      const panel = dashboard.querySelector<DashboardPanel>('#notes')!;
      const source = edgeRecord(dashboard);

      expect(dashboard.place('notes', { ...source, columnSpan: source.columnSpan + 1 })).toBe(true);
      await dashboard.updateComplete;
      await panel.updateComplete;

      const transition = panel
        .getAnimations()
        .find(animation => animation instanceof CSSTransition && animation.transitionProperty === 'width');

      expect(transition).toBeDefined();
      transition!.pause();
      transition!.currentTime = 0;
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

      const committed = dashboard.value;
      const painted = panel.getBoundingClientRect();
      const grip = panel.shadowRoot!.querySelector<HTMLElement>('.resize-grip > [data-dashboard-action="resize"]')!;
      const bounds = grip.getBoundingClientRect();
      const point = { x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 };
      const target = { x: point.x + 13, y: point.y };
      const change = vi.fn();

      dashboard.addEventListener('change', change);
      vi.spyOn(grip, 'setPointerCapture').mockImplementation(() => {});
      vi.spyOn(dashboard, 'setPointerCapture').mockImplementation(() => {});
      grip.dispatchEvent(edgeSample('pointerdown', point));
      dashboard.dispatchEvent(edgeSample('pointermove', target));
      await rendered(dashboard);

      expect(panel.getBoundingClientRect().width).toBeCloseTo(painted.width + 13);

      dashboard.dispatchEvent(edgeSample('pointerup', target));
      await settle(dashboard);

      expect(dashboard.value).toBe(committed);
      expect(change).not.toHaveBeenCalled();
    });

    it('commits pen resizing from an edge reserved for direct manipulation', async () => {
      const dashboard = await edgeSetup();
      const panel = dashboard.querySelector<DashboardPanel>('#notes')!;
      const edge = panel.shadowRoot!.querySelector<HTMLElement>('[data-dashboard-edge="right"]')!;
      const bounds = edge.getBoundingClientRect();
      const point = { x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 };
      const target = { x: point.x + 58, y: point.y };
      const initial = dashboard.value;
      const changed = vi.fn();

      dashboard.addEventListener('change', changed);
      vi.spyOn(dashboard, 'setPointerCapture').mockImplementation(() => {});

      expect(getComputedStyle(edge).touchAction).toBe('none');

      edge.dispatchEvent(edgeSample('pointerdown', point, 'pen'));
      dashboard.dispatchEvent(edgeSample('pointermove', target, 'pen'));
      await rendered(dashboard);

      expect(dashboard.value).toBe(initial);
      expect(dashboard.shadowRoot!.querySelector('nve-ghost')).not.toBeNull();

      dashboard.dispatchEvent(edgeSample('pointerup', target, 'pen'));
      await settle(dashboard);

      expect(edgeRecord(dashboard)).toEqual({ id: 'notes', column: 1, row: 2, columnSpan: 4, rowSpan: 3 });
      expect(changed).toHaveBeenCalledOnce();
    });

    it('bounds edge strips near the border outside keyboard order, reserves native gestures, and declines touch resizing', async () => {
      const dashboard = await edgeSetup();
      const panel = dashboard.querySelector<DashboardPanel>('#notes')!;
      const bounds = panel.getBoundingClientRect();
      const edges = [...panel.shadowRoot!.querySelectorAll<HTMLElement>('[data-dashboard-edge]')];

      expect(edges.map(edge => edge.dataset.dashboardEdge).sort()).toEqual(['bottom', 'left', 'right', 'top']);

      for (const edge of edges) {
        expect(edge.getAttribute('aria-hidden')).toBe('true');
        expect(edge.hasAttribute('tabindex')).toBe(false);
        expect(edge.tabIndex).toBe(-1);
        expect(getComputedStyle(edge).touchAction).toBe('none');
      }

      const left = edges.find(edge => edge.dataset.dashboardEdge === 'left')!;

      expect(left.getBoundingClientRect().right).toBeLessThanOrEqual(bounds.left + 4.01);
      expect(panel.shadowRoot!.elementFromPoint(bounds.left + 5, bounds.top + bounds.height / 2)).not.toBe(left);

      const point = { x: bounds.left + 0.5, y: bounds.top + bounds.height / 2 };
      const down = edgeSample('pointerdown', point, 'touch');
      const initial = dashboard.value;

      left.dispatchEvent(down);

      expect(down.defaultPrevented).toBe(false);

      dashboard.dispatchEvent(edgeSample('pointermove', { x: point.x - 58, y: point.y }, 'touch'));
      dashboard.dispatchEvent(edgeSample('pointerup', { x: point.x - 58, y: point.y }, 'touch'));
      await settle(dashboard);

      expect(dashboard.value).toBe(initial);
      expect(dashboard.shadowRoot!.querySelector('nve-ghost')).toBeNull();
    });

    it('cancels on a live CSS gap change and uses fresh zero-gap and wider-gap edge geometry', async () => {
      const dashboard = await edgeSetup();
      const initial = dashboard.value;
      const change = vi.fn();

      dashboard.addEventListener('change', change);

      const active = edgeStart({ dashboard, edge: 'right' });

      dashboard.dispatchEvent(edgeSample('pointermove', { x: active.point.x + 58, y: active.point.y }));
      await rendered(dashboard);

      expect(dashboard.shadowRoot!.querySelector('nve-ghost')).not.toBeNull();

      dashboard.style.setProperty('--gap', '20px');
      await vi.waitFor(() => expect(dashboard.shadowRoot!.querySelector('nve-ghost')).toBeNull());

      dashboard.dispatchEvent(edgeSample('pointerup', { x: active.point.x + 58, y: active.point.y }));

      expect(dashboard.value).toBe(initial);
      expect(change).not.toHaveBeenCalled();

      for (const gap of [0, 20]) {
        dashboard.value = initial;
        dashboard.style.setProperty('--gap', `${gap}px`);
        await settle(dashboard);

        const { panel, zone, point } = edgeStart({ dashboard, edge: 'right' });

        expect(zone.getBoundingClientRect().width).toBe(gap === 0 ? 4 : 7);

        const target = { x: point.x + 50 + gap, y: point.y };

        dashboard.dispatchEvent(edgeSample('pointermove', target));
        await rendered(dashboard);

        const accepted = edgePreview(dashboard, gap);

        dashboard.dispatchEvent(edgeSample('pointerup', target));

        expect(edgeRecord(dashboard)).toEqual({ id: 'notes', ...accepted });

        await settle(dashboard);

        const spacing = gap === 0 ? -1 : gap;

        expect(panel.style.width).toBe(`${accepted.columnSpan * 50 + (accepted.columnSpan - 1) * spacing}px`);
      }

      expect(change).toHaveBeenCalledTimes(2);
    });
  });
});
