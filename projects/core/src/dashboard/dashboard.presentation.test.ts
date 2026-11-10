// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';

import { createFixture, elementIsStable, removeFixture } from '@internals/testing';

import { I18nService } from '@nvidia-elements/foundations/internal/i18n';

import type { Dashboard, DashboardLayout, DashboardPanel } from './index.js';

import './define.js';

describe('dashboard presentation', () => {
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

  describe('metric recalibration', () => {
    for (const flow of ['vertical', 'horizontal'] as const) {
      it(`snaps recalibrated ${flow} metrics without suppressing later arrangement or grip transitions`, async () => {
        const dashboard = await createDashboard(flow, 'fit', false);
        const notes = dashboard.querySelector<HTMLElement>('#notes')!;
        const input = notes.querySelector('input')!;
        const content = [...dashboard.children];
        const value = dashboard.value;
        const change = vi.fn();

        dashboard.addEventListener('change', event => {
          if (event.target === dashboard) {
            change();
          }
        });
        dashboard.style.setProperty('--animation-duration', '1000ms');
        input.value = 'Retain this calibration draft';
        input.focus();

        const dimension = flow === 'vertical' ? 'width' : 'height';
        const position = flow === 'vertical' ? 'top' : 'left';
        const before = notes.style[dimension];

        dashboard.style.width = '520px';
        dashboard.style.height = '260px';
        await vi.waitFor(() => expect(notes.style[dimension]).not.toBe(before));

        for (const panel of dashboard.querySelectorAll<HTMLElement>('nve-dashboard-panel')) {
          expect(panel.getBoundingClientRect()[dimension]).toBeCloseTo(Number.parseFloat(panel.style[dimension]), 1);
          expect(panel.getAnimations().filter(animation => animation instanceof CSSTransition)).toEqual([]);
        }

        expect(dashboard.value).toBe(value);
        expect(change).not.toHaveBeenCalled();
        expect([...dashboard.children]).toEqual(content);
        expect(notes.querySelector('input')).toBe(input);
        expect(input.value).toBe('Retain this calibration draft');
        expect(document.activeElement).toBe(input);

        const currentLayout: DashboardLayout = JSON.parse(dashboard.value);
        const source = currentLayout.items.find(item => item.id === 'notes')!;
        const destination =
          flow === 'vertical' ? { ...source, row: source.row + 2 } : { ...source, column: source.column + 2 };

        expect(dashboard.place('notes', destination)).toBe(true);
        await rendered(dashboard);

        const movement = notes
          .getAnimations()
          .find(animation => animation instanceof CSSTransition && animation.transitionProperty === position);

        expect(movement).toBeDefined();
        expect(movement!.effect!.getTiming().duration).toBe(1000);
        expect(change).toHaveBeenCalledOnce();

        for (const panel of dashboard.querySelectorAll('nve-dashboard-panel')) {
          for (const animation of panel.getAnimations()) {
            animation.finish();
          }
        }

        await rendered(dashboard);

        const committed = dashboard.value;

        dashboard.rearrangeable = false;
        await rendered(dashboard);

        const grip = notes.shadowRoot!.querySelector<HTMLElement>('.move-grip')!;
        const transitions = grip.getAnimations();

        expect(
          transitions.some(
            animation => animation instanceof CSSTransition && animation.transitionProperty === 'opacity'
          )
        ).toBe(true);

        for (const animation of transitions) {
          expect(animation.effect!.getTiming().duration).toBe(1000);

          animation.pause();
          animation.currentTime = 500;
        }

        expect(Number(getComputedStyle(grip).opacity)).toBeGreaterThan(0);
        expect(Number(getComputedStyle(grip).opacity)).toBeLessThan(1);
        expect(grip.inert).toBe(true);
        expect(dashboard.value).toBe(committed);
        expect(change).toHaveBeenCalledOnce();
      });
    }

    it('animates explicit value, flow, sizing and gap changes instead of classifying them as external resize', async () => {
      const dashboard = await createDashboard('vertical', 'fit', false);
      const notes = dashboard.querySelector<HTMLElement>('#notes')!;
      const input = notes.querySelector('input')!;
      const change = vi.fn();

      dashboard.addEventListener('change', event => {
        if (event.target === dashboard) {
          change();
        }
      });
      dashboard.style.setProperty('--animation-duration', '1000ms');
      input.value = 'Explicit settings keep this draft';

      async function finishPanelTransitions() {
        for (const panel of dashboard.querySelectorAll('nve-dashboard-panel')) {
          for (const animation of panel.getAnimations()) {
            animation.finish();
          }
        }

        await rendered(dashboard);
      }

      const initial: DashboardLayout = JSON.parse(dashboard.value);

      dashboard.style.width = '520px';
      dashboard.style.height = '260px';
      dashboard.value = JSON.stringify({
        ...initial,
        items: initial.items.map(item => (item.id === 'notes' ? { ...item, row: 2 } : item))
      });
      await rendered(dashboard);

      expect(
        notes
          .getAnimations()
          .some(animation => animation instanceof CSSTransition && animation.transitionProperty === 'top')
      ).toBe(true);

      await finishPanelTransitions();

      const vertical: DashboardLayout = JSON.parse(dashboard.value);

      dashboard.value = JSON.stringify({
        ...vertical,
        grid: { ...vertical.grid, flow: 'horizontal' },
        items: vertical.items.map(item => ({
          ...item,
          column: item.row,
          row: item.column,
          columnSpan: item.rowSpan,
          rowSpan: item.columnSpan
        }))
      });
      await rendered(dashboard);

      expect(
        notes
          .getAnimations()
          .some(animation => animation instanceof CSSTransition && animation.transitionProperty === 'height')
      ).toBe(true);

      await finishPanelTransitions();

      dashboard.sizing = 'fixed';
      await rendered(dashboard);

      expect(
        notes
          .getAnimations()
          .some(animation => animation instanceof CSSTransition && animation.transitionProperty === 'height')
      ).toBe(true);

      await finishPanelTransitions();

      const fixed = dashboard.value;

      dashboard.style.setProperty('--gap', '16px');
      await vi.waitFor(() => expect(notes.style.width).toBe('336px'));
      await rendered(dashboard);

      expect(
        notes
          .getAnimations()
          .some(animation => animation instanceof CSSTransition && animation.transitionProperty === 'width')
      ).toBe(true);

      await finishPanelTransitions();

      expect(dashboard.value).toBe(fixed);
      expect(change).not.toHaveBeenCalled();
      expect(notes.querySelector('input')).toBe(input);
      expect(input.value).toBe('Explicit settings keep this draft');
    });

    it('keeps the destination ghost animated when a held Candidate move grows internal canvas extent', async () => {
      const initial: DashboardLayout = {
        version: 1,
        grid: { flow: 'vertical', tracks: 6 },
        items: [
          { id: 'baseline', column: 0, row: 0, columnSpan: 3, rowSpan: 2 },
          { id: 'candidate', column: 3, row: 0, columnSpan: 3, rowSpan: 2 },
          { id: 'changes', column: 0, row: 2, columnSpan: 3, rowSpan: 2 },
          { id: 'evidence', column: 3, row: 2, columnSpan: 3, rowSpan: 2 },
          { id: 'notes', column: 0, row: 4, columnSpan: 6, rowSpan: 2 }
        ]
      };

      fixture =
        await createFixture(html`<nve-dashboard rearrangeable .value=${JSON.stringify(initial)} style="width:720px;height:550px;--row-size:70px;--gap:12px;--animation-duration:1000ms">
      ${initial.items.map(item => html`<nve-dashboard-panel id=${item.id}><nve-dashboard-panel-header>${item.id}</nve-dashboard-panel-header><nve-dashboard-panel-content>Application content</nve-dashboard-panel-content></nve-dashboard-panel>`)}
    </nve-dashboard>`);

      const dashboard = fixture.querySelector<Dashboard>('nve-dashboard')!;

      await settle(dashboard);

      const panel = dashboard.querySelector<HTMLElement>('#candidate')!;
      const control = panel.shadowRoot!.querySelector<HTMLElement>('.move-grip > [data-dashboard-action]')!;
      const canvas = dashboard.shadowRoot!.querySelector<HTMLElement>('.canvas')!;
      const host = dashboard.getBoundingClientRect();
      const extent = canvas.getBoundingClientRect().height;
      const value = dashboard.value;
      const bounds = control.getBoundingClientRect();
      const x = bounds.left - host.left + bounds.width / 2;
      const y = bounds.top - host.top + 8;
      const change = vi.fn();

      dashboard.addEventListener('change', change);
      await userEvent.pointer({ target: control, coords: { x: bounds.width / 2, y: 8 }, keys: '[MouseLeft>]' });

      try {
        await userEvent.pointer({ target: dashboard, coords: { x, y: y + 164 } });
        await rendered(dashboard);

        const ghost = dashboard.shadowRoot!.querySelector<HTMLElement>('nve-ghost')!;

        expect(ghost.style.top).toBe('164px');

        await userEvent.pointer({ target: dashboard, coords: { x, y: y + 492 } });
        await rendered(dashboard);

        expect(ghost.style.top).toBe('492px');

        const transition = ghost
          .getAnimations()
          .find(animation => animation instanceof CSSTransition && animation.transitionProperty === 'top');

        expect(transition).toBeDefined();
        expect(transition!.effect!.getTiming().duration).toBe(1000);
        expect(canvas.getBoundingClientRect().height).toBeGreaterThan(extent);
        expect(dashboard.getBoundingClientRect().width).toBe(host.width);
        expect(dashboard.getBoundingClientRect().height).toBe(host.height);
        expect(panel.matches(':state(carried)')).toBe(true);
        expect(dashboard.value).toBe(value);
      } finally {
        await userEvent.pointer('[/MouseLeft]');
      }

      await rendered(dashboard);

      const committed: DashboardLayout = JSON.parse(dashboard.value);

      expect(committed.items.find(item => item.id === 'candidate')!.row).toBe(6);
      expect(change).toHaveBeenCalledOnce();
      expect(dashboard.shadowRoot!.querySelector('nve-ghost')).toBeNull();
    });
  });

  it('switches fit and fixed sizing without changing the layout or application content', async () => {
    const dashboard = await createDashboard('vertical', 'fit', false);
    const scrollport = viewport(dashboard);
    const notes = dashboard.querySelector<HTMLElement>('#notes')!;
    const cases = dashboard.querySelector<HTMLElement>('#cases')!;
    const input = notes.querySelector('input')!;
    const content = [...dashboard.querySelectorAll('#notes input, #notes select')];
    const value = dashboard.value;
    const changed = vi.fn();

    dashboard.addEventListener('change', event => {
      if (event.target === dashboard) {
        changed();
      }
    });
    input.value = 'Unsaved sizing note';
    await vi.waitFor(() => {
      expect(notes.getBoundingClientRect().width).toBeCloseTo((scrollport.clientWidth - 8) / 2, 2);
      expect(cases.getBoundingClientRect().right - notes.getBoundingClientRect().left).toBeCloseTo(
        scrollport.clientWidth,
        2
      );
    });

    const initialWidth = notes.getBoundingClientRect().width;

    dashboard.style.width = '520px';
    await settle(dashboard);
    await vi.waitFor(() =>
      expect(notes.getBoundingClientRect().width).toBeCloseTo((scrollport.clientWidth - 8) / 2, 2)
    );

    expect(notes.getBoundingClientRect().width).toBeLessThan(initialWidth);

    dashboard.sizing = 'fixed';
    await settle(dashboard);
    await vi.waitFor(() => expect(notes.getBoundingClientRect().width).toBeCloseTo(328, 2));

    expect(notes.getBoundingClientRect().height).toBeCloseTo(248, 2);
    expect(scrollport.scrollWidth).toBeGreaterThan(scrollport.clientWidth);

    dashboard.style.width = '420px';
    await settle(dashboard);

    expect(notes.getBoundingClientRect().width).toBeCloseTo(328, 2);
    expect(notes.getBoundingClientRect().height).toBeCloseTo(248, 2);

    dashboard.sizing = 'fit';
    await settle(dashboard);
    await vi.waitFor(() => {
      expect(notes.getBoundingClientRect().width).toBeCloseTo((scrollport.clientWidth - 8) / 2, 2);
      expect(cases.getBoundingClientRect().right - notes.getBoundingClientRect().left).toBeCloseTo(
        scrollport.clientWidth,
        2
      );
      expect(scrollport.scrollWidth).toBeLessThanOrEqual(scrollport.clientWidth + 1);
    });

    expect(dashboard.value).toBe(value);
    expect(changed).not.toHaveBeenCalled();
    expect([...dashboard.querySelectorAll('#notes input, #notes select')]).toEqual(content);
    expect(notes.querySelector('input')).toBe(input);
    expect(input.value).toBe('Unsaved sizing note');
  });

  for (const flow of ['vertical', 'horizontal'] as const) {
    it(`fits ${flow} bounded tracks without accidental bounded-axis dashboard overflow`, async () => {
      const dashboard = await createDashboard(flow);
      const scrollport = viewport(dashboard);
      const value = dashboard.value;
      const change = vi.fn();

      dashboard.addEventListener('change', change);
      await vi.waitFor(() => {
        if (flow === 'vertical') {
          expect(scrollport.scrollWidth).toBeLessThanOrEqual(scrollport.clientWidth + 1);
          expect(scrollport.scrollHeight).toBeGreaterThan(scrollport.clientHeight);
        } else {
          expect(scrollport.scrollHeight).toBeLessThanOrEqual(scrollport.clientHeight + 1);
          expect(scrollport.scrollWidth).toBeGreaterThan(scrollport.clientWidth);
        }
      });

      dashboard.style.width = '480px';
      dashboard.style.height = '260px';
      await settle(dashboard);
      await vi.waitFor(() => {
        if (flow === 'vertical') {
          expect(scrollport.scrollWidth).toBeLessThanOrEqual(scrollport.clientWidth + 1);
        } else {
          expect(scrollport.scrollHeight).toBeLessThanOrEqual(scrollport.clientHeight + 1);
        }
      });

      scrollport.scrollTo(80, 80);
      await settle(dashboard);

      expect(dashboard.value).toBe(value);
      expect(change).not.toHaveBeenCalled();
    });

    it(`preserves ${flow} cell dimensions and exposes deliberate bounded-axis scrolling`, async () => {
      const dashboard = await createDashboard(flow, 'fixed');
      const scrollport = viewport(dashboard);
      const notes = dashboard.querySelector<HTMLElement>('#notes')!;

      await vi.waitFor(() => expect(notes.getBoundingClientRect().width).toBeCloseTo(328));

      const before = notes.getBoundingClientRect();
      const value = dashboard.value;

      dashboard.style.width = '420px';
      dashboard.style.height = '240px';
      await settle(dashboard);
      await vi.waitFor(() => {
        expect(scrollport.scrollWidth).toBeGreaterThan(scrollport.clientWidth);
        expect(scrollport.scrollHeight).toBeGreaterThan(scrollport.clientHeight);
      });

      expect(notes.getBoundingClientRect().width).toBeCloseTo(before.width);
      expect(notes.getBoundingClientRect().height).toBeCloseTo(before.height);
      expect(dashboard.value).toBe(value);
    });
  }

  it('fills a normal column layout and keeps controls hit-testable without an authored dashboard width', async () => {
    const { default: layoutStyles } = await import('@nvidia-elements/styles/layout.css?inline');

    fixture = await createFixture();

    const root = fixture.attachShadow({ mode: 'open' });
    const styles = document.createElement('style');

    styles.textContent = layoutStyles;

    const wrapper = document.createElement('div');

    wrapper.setAttribute('nve-layout', 'column pad:sm');
    wrapper.style.width = '620px';

    const dashboard = document.createElement('nve-dashboard');

    dashboard.autoSettle = true;
    dashboard.rearrangeable = true;
    dashboard.style.height = '320px';
    dashboard.innerHTML =
      '<nve-dashboard-panel id="notes"><nve-dashboard-panel-header>Notes</nve-dashboard-panel-header><input aria-label="Investigation" value="Retained" /></nve-dashboard-panel>';
    root.append(styles, wrapper);
    wrapper.append(dashboard);
    await settle(dashboard);

    const wrapperStyle = getComputedStyle(wrapper);

    expect(wrapperStyle.display).toBe('flex');

    const available =
      wrapper.clientWidth - Number.parseFloat(wrapperStyle.paddingLeft) - Number.parseFloat(wrapperStyle.paddingRight);

    expect(dashboard.getBoundingClientRect().width).toBeCloseTo(available);
    expect(viewport(dashboard).clientWidth).toBeGreaterThan(0);

    const panel = dashboard.querySelector('#notes')!;
    const control = panel.shadowRoot!.querySelector<HTMLElement>('[data-dashboard-action="move"]')!;
    const value = dashboard.value;

    await userEvent.click(control);
    await settle(dashboard);

    expect(dashboard.shadowRoot!.querySelector('nve-ghost')).toBeNull();

    await userEvent.keyboard('{ArrowDown}{Escape}');

    expect(dashboard.value).toBe(value);
  });

  for (const action of ['move', 'resize'] as const) {
    it(`carries the original panel continuously during ${action} while the ghost stays snapped`, async () => {
      const dashboard = await createDashboard();
      const panel = dashboard.querySelector<HTMLElement>('#notes')!;
      const control = panel.shadowRoot!.querySelector<HTMLElement>(`[data-dashboard-action="${action}"]`)!;
      const input = panel.querySelector('input')!;

      input.value = 'Unsaved investigation';

      const parent = panel.parentNode;
      const origin = panel.getBoundingClientRect();
      const handle = control.getBoundingClientRect();
      const x = handle.left + handle.width / 2;
      const y = handle.top + handle.height / 2;
      const value = dashboard.value;
      const change = vi.fn();

      dashboard.addEventListener('change', change);
      vi.spyOn(control, 'setPointerCapture').mockImplementation(() => {});
      control.dispatchEvent(pointer('pointerdown', x, y));
      dashboard.dispatchEvent(pointer('pointermove', x + 13, y + 13));
      await rendered(dashboard);

      const carried = panel.getBoundingClientRect();
      const ghost = dashboard.shadowRoot!.querySelector<HTMLElement>('nve-ghost')!;

      expect(ghost).not.toBeNull();

      const snapped = ghost.getBoundingClientRect();

      expect(snapped.left).toBeCloseTo(origin.left);
      expect(snapped.top).toBeCloseTo(origin.top);
      expect(snapped.width).toBeCloseTo(origin.width);
      expect(snapped.height).toBeCloseTo(origin.height);
      expect(carried.left).toBeCloseTo(origin.left + (action === 'move' ? 13 : 0));
      expect(carried.top).toBeCloseTo(origin.top + (action === 'move' ? 13 : 0));
      expect(carried.width).toBeCloseTo(origin.width + (action === 'resize' ? 13 : 0));
      expect(carried.height).toBeCloseTo(origin.height + (action === 'resize' ? 13 : 0));
      expect(panel.matches(':state(lifted)')).toBe(true);
      expect(getComputedStyle(panel).transform).toBe('none');
      expect(getComputedStyle(panel).opacity).toBe('1');
      expect(panel.parentNode).toBe(parent);
      expect(panel.querySelector('input')).toBe(input);
      expect(input.value).toBe('Unsaved investigation');
      expect(dashboard.value).toBe(value);
      expect(change).not.toHaveBeenCalled();

      dashboard.dispatchEvent(pointer('pointercancel', x + 13, y + 13));
      await settle(dashboard);

      expect(panel.getBoundingClientRect().left).toBeCloseTo(origin.left);
      expect(panel.getBoundingClientRect().top).toBeCloseTo(origin.top);
      expect(panel.getBoundingClientRect().width).toBeCloseTo(origin.width);
      expect(dashboard.value).toBe(value);
      expect(change).not.toHaveBeenCalled();
    });

    it(`keeps panel content and chrome stationary when the ${action} pointer is pressed`, async () => {
      const dashboard = await createDashboard();
      const panel = dashboard.querySelector('#notes')!;
      const body = panel.shadowRoot!.querySelector<HTMLElement>('.body')!;
      const footer = panel.shadowRoot!.querySelector<HTMLElement>('.footer')!;
      const control = panel.shadowRoot!.querySelector<HTMLElement>(`[data-dashboard-action="${action}"]`)!;

      vi.spyOn(control, 'setPointerCapture').mockImplementation(() => {});

      const before = {
        body: body.getBoundingClientRect(),
        footer: footer.getBoundingClientRect(),
        control: control.getBoundingClientRect()
      };
      const x = before.control.left + before.control.width / 2;
      const y = before.control.top + before.control.height / 2;
      const value = dashboard.value;

      control.dispatchEvent(pointer('pointerdown', x, y));
      await settle(dashboard);

      expect(body.getBoundingClientRect().height).toBeCloseTo(before.body.height);
      expect(footer.getBoundingClientRect().top).toBeCloseTo(before.footer.top);
      expect(control.getBoundingClientRect().top).toBeCloseTo(before.control.top);
      expect(control.getBoundingClientRect().left).toBeCloseTo(before.control.left);
      expect(dashboard.shadowRoot!.querySelector('nve-ghost')).toBeNull();
      expect(dashboard.shadowRoot!.querySelector('.canvas')!.hasAttribute('data-arranging')).toBe(false);

      dashboard.dispatchEvent(pointer('pointercancel', x, y));
      await settle(dashboard);

      expect(dashboard.value).toBe(value);
    });
  }

  it('publishes a resize immediately while a fallback-displaced panel eases through intermediate geometry', async () => {
    const dashboard = await createDashboard();
    const panel = dashboard.querySelector<HTMLElement>('#notes')!;
    const peer = dashboard.querySelector<HTMLElement>('#cases')!;
    const before = peer.getBoundingClientRect();
    const change = vi.fn();

    dashboard.addEventListener('change', change);

    expect(dashboard.place('notes', { column: 0, row: 0, columnSpan: 3, rowSpan: 2 })).toBe(true);
    expect(change).toHaveBeenCalledOnce();
    expect(JSON.parse(dashboard.value).items.find((item: { id: string }) => item.id === 'notes').columnSpan).toBe(3);

    await rendered(dashboard);

    const transition = peer
      .getAnimations()
      .find(animation => animation instanceof CSSTransition && animation.transitionProperty === 'top');

    expect(transition).toBeDefined();

    transition!.pause();
    transition!.currentTime = 75;
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

    expect(transition!.effect!.getTiming().duration).toBe(150);

    const intermediate = peer.getBoundingClientRect().top;

    expect(intermediate).toBeGreaterThan(before.top);
    expect(intermediate).toBeLessThan(before.top + 256);

    transition!.play();
    await settle(dashboard);

    expect(peer.getBoundingClientRect().top).toBeCloseTo(before.top + 256);
    expect(dashboard.querySelector('#notes')).toBe(panel);
    expect(change).toHaveBeenCalledOnce();
  });

  it('picks up the currently painted panel during a layout transition without jumping to its target', async () => {
    const dashboard = await createDashboard();
    const panel = dashboard.querySelector<HTMLElement>('#notes')!;

    expect(dashboard.place('notes', { column: 0, row: 3, columnSpan: 2, rowSpan: 2 })).toBe(true);
    await rendered(dashboard);

    const transition = panel
      .getAnimations()
      .find(animation => animation instanceof CSSTransition && animation.transitionProperty === 'top');

    expect(transition).toBeDefined();

    transition!.pause();
    transition!.currentTime = 15;
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

    const painted = panel.getBoundingClientRect();
    const control = panel.shadowRoot!.querySelector<HTMLElement>('[data-dashboard-action="move"]')!;
    const handle = control.getBoundingClientRect();
    const x = handle.left + handle.width / 2;
    const y = handle.top + handle.height / 2;

    vi.spyOn(control, 'setPointerCapture').mockImplementation(() => {});
    control.dispatchEvent(pointer('pointerdown', x, y));
    await rendered(dashboard);

    expect(panel.getBoundingClientRect().top).toBeCloseTo(painted.top);
    expect(panel.getBoundingClientRect().height).toBeCloseTo(painted.height);

    dashboard.dispatchEvent(pointer('pointermove', x + 13, y + 13));
    await rendered(dashboard);

    expect(panel.getBoundingClientRect().left).toBeCloseTo(painted.left + 13);
    expect(panel.getBoundingClientRect().top).toBeCloseTo(painted.top + 13);

    dashboard.dispatchEvent(pointer('pointercancel', x + 13, y + 13));
    await settle(dashboard);

    expect(panel.getBoundingClientRect().top).toBeCloseTo(viewport(dashboard).getBoundingClientRect().top + 256);
  });

  it('keeps the accepted resize stable when shrinking and extending the packed scroll extent', async () => {
    const dashboard = await createDashboard();

    dashboard.style.height = '400px';

    const value = JSON.stringify({
      ...layout(),
      items: [
        { id: 'notes', column: 0, row: 0, columnSpan: 2, rowSpan: 12 },
        { id: 'cases', column: 2, row: 0, columnSpan: 2, rowSpan: 2 },
        { id: 'baseline', column: 2, row: 2, columnSpan: 2, rowSpan: 2 }
      ]
    });

    dashboard.value = value;
    await settle(dashboard);

    const scrollport = viewport(dashboard);

    scrollport.scrollTop = scrollport.scrollHeight;
    await settle(dashboard);

    const panel = dashboard.querySelector<HTMLElement>('#notes')!;
    const control = panel.shadowRoot!.querySelector<HTMLElement>('[data-dashboard-action="resize"]')!;
    const box = control.getBoundingClientRect();
    const x = box.left + box.width / 2;
    const y = box.top + box.height / 2;
    const initialScroll = scrollport.scrollTop;

    expect(initialScroll).toBe(1128);

    control.dispatchEvent(pointer('pointerdown', x, y));
    dashboard.dispatchEvent(pointer('pointermove', x, y - 65));
    await rendered(dashboard);

    const ghost = dashboard.shadowRoot!.querySelector<HTMLElement>('nve-ghost')!;

    await new Promise(resolve => setTimeout(resolve, 100));
    await rendered(dashboard);

    expect(Number.parseFloat(ghost.style.height)).toBe(11 * 128 - 8);
    expect(scrollport.scrollTop).toBe(initialScroll);
    expect(dashboard.value).toBe(value);

    const edge = scrollport.getBoundingClientRect().bottom + 140;

    dashboard.dispatchEvent(pointer('pointermove', x, edge));
    await rendered(dashboard);

    const carriedBottom = panel.getBoundingClientRect().bottom;

    await new Promise(resolve => setTimeout(resolve, 150));
    await rendered(dashboard);

    expect(scrollport.scrollTop).toBeGreaterThan(initialScroll);
    expect(panel.getBoundingClientRect().bottom).toBeCloseTo(carriedBottom);

    const retreat = scrollport.getBoundingClientRect().top + 160;

    dashboard.dispatchEvent(pointer('pointermove', x, retreat));
    await rendered(dashboard);

    const accepted = ghost.style.height;
    const scroll = scrollport.scrollTop;

    await new Promise(resolve => setTimeout(resolve, 100));
    await rendered(dashboard);

    expect(ghost.style.height).toBe(accepted);
    expect(scrollport.scrollTop).toBe(scroll);
    expect(dashboard.value).toBe(value);

    dashboard.dispatchEvent(pointer('pointercancel', x, retreat));
    await settle(dashboard);
  });

  it('uses the actual customized panel corners for the pointer placement ghost', async () => {
    const dashboard = await createDashboard();
    const panel = dashboard.querySelector<HTMLElement>('#notes')!;

    panel.style.setProperty('--border-radius', '19px 7px 13px 3px / 5px 17px 11px 23px');
    await settle(dashboard);

    const surface = panel.shadowRoot!.querySelector<HTMLElement>('[internal-host]')!;
    const control = panel.shadowRoot!.querySelector<HTMLElement>('[data-dashboard-action="move"]')!;
    const bounds = control.getBoundingClientRect();
    const x = bounds.left + 18;
    const y = bounds.top + 24;

    control.dispatchEvent(pointer('pointerdown', x, y));
    dashboard.dispatchEvent(pointer('pointermove', x + 13, y + 13));
    await rendered(dashboard);

    const ghost = dashboard.shadowRoot!.querySelector<HTMLElement>('nve-ghost')!;

    expect(ghost).not.toBeNull();

    const expected = getComputedStyle(surface);
    const actual = getComputedStyle(ghost);

    expect(actual.borderTopLeftRadius).toBe(expected.borderTopLeftRadius);
    expect(actual.borderTopRightRadius).toBe(expected.borderTopRightRadius);
    expect(actual.borderBottomRightRadius).toBe(expected.borderBottomRightRadius);
    expect(actual.borderBottomLeftRadius).toBe(expected.borderBottomLeftRadius);

    dashboard.dispatchEvent(pointer('pointercancel', x + 13, y + 13));
  });

  it('shows guides and a ghost only for pointer arrangement while arrows commit directly', async () => {
    const dashboard = await createDashboard();
    const panel = dashboard.querySelector('#notes')!;
    const canvas = dashboard.shadowRoot!.querySelector<HTMLElement>('.canvas')!;
    const control = panel.shadowRoot!.querySelector<HTMLElement>('[data-dashboard-action="move"]')!;
    const idle = getComputedStyle(canvas).backgroundImage;

    control.focus();
    await userEvent.keyboard('{ArrowRight}');
    await settle(dashboard);

    expect(getComputedStyle(canvas).backgroundImage).toBe(idle);
    expect(dashboard.shadowRoot!.querySelector('nve-ghost')).toBeNull();

    const bounds = control.getBoundingClientRect();
    const x = bounds.left + 18;
    const y = bounds.top + 24;

    control.dispatchEvent(pointer('pointerdown', x, y));
    dashboard.dispatchEvent(pointer('pointermove', x + 13, y + 13));
    await rendered(dashboard);

    expect(getComputedStyle(canvas).backgroundImage).not.toBe('none');
    expect(getComputedStyle(canvas).backgroundImage).not.toBe(idle);
    expect(dashboard.shadowRoot!.querySelector('nve-ghost')).not.toBeNull();

    dashboard.dispatchEvent(pointer('pointercancel', x + 13, y + 13));
    await settle(dashboard);

    expect(getComputedStyle(canvas).backgroundImage).toBe(idle);
    expect(dashboard.shadowRoot!.querySelector('nve-ghost')).toBeNull();
  });

  it('keeps focused grip fill and foreground after pointer release and keyboard use, and clears them on blur', async () => {
    const dashboard = await createDashboard('vertical', 'fit', false);
    const panel = dashboard.querySelector<DashboardPanel>('#notes')!;
    const input = dashboard.querySelector('input')!;
    const initial = dashboard.value;

    vi.spyOn(dashboard, 'setPointerCapture').mockImplementation(() => {});

    for (const action of ['move', 'resize'] as const) {
      dashboard.value = initial;
      await settle(dashboard);

      const control = panel.shadowRoot!.querySelector<HTMLElement>(`.grip > [data-dashboard-action="${action}"]`)!;
      const wrapper = control.closest<HTMLElement>('.grip')!;
      const surface = control.shadowRoot!.querySelector<HTMLElement>('[internal-host]')!;
      const icon = control.shadowRoot!.querySelector('nve-icon')!;
      const iconSurface = icon.shadowRoot!.querySelector<HTMLElement>('[internal-host]')!;

      const paint = () => ({
        image: getComputedStyle(surface).backgroundImage,
        color: getComputedStyle(iconSurface).color
      });

      vi.spyOn(control, 'setPointerCapture').mockImplementation(() => {});
      await userEvent.click(input);

      const idle = paint();
      const bounds = control.getBoundingClientRect();
      const point = { x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 };

      control.dispatchEvent(pointer('pointerdown', point.x, point.y));
      dashboard.dispatchEvent(pointer('pointerup', point.x, point.y));
      await rendered(dashboard);

      const focused = paint();

      expect(focused.image).not.toBe(idle.image);
      expect(focused.color).not.toBe(idle.color);
      expect(panel.shadowRoot!.activeElement).toBe(control);
      expect(getComputedStyle(wrapper, '::before').content).toBe('none');
      expect(control.hasAttribute('selected')).toBe(false);
      expect(control.matches(':state(selected), :state(pressed)')).toBe(false);
      expect(dashboard.value).toBe(initial);
      expect(dashboard.shadowRoot!.querySelector('nve-ghost')).toBeNull();

      await userEvent.keyboard('{ArrowDown}');
      await settle(dashboard);

      expect(paint()).toEqual(focused);
      expect(getComputedStyle(wrapper, '::before').content).not.toBe('none');
      expect(control.matches(':state(selected), :state(pressed)')).toBe(false);
      expect(control.getAttribute('aria-label')).toBe(action);

      await userEvent.click(input);

      expect(panel.shadowRoot!.activeElement).not.toBe(control);
      expect(paint()).toEqual(idle);
      expect(getComputedStyle(wrapper, '::before').content).toBe('none');
    }
  });

  it.each(['move', 'resize'] as const)('uses shared global and instance %s translations for its grip', async action => {
    const dashboard = await createDashboard();
    const panel = dashboard.querySelector('#notes')!;
    const control = panel.shadowRoot!.querySelector(`.grip > [data-dashboard-action="${action}"]`)!;
    const previous = I18nService.i18n[action] ?? action;

    try {
      I18nService.update({ [action]: `Global ${action}` });
      await settle(dashboard);

      expect(control.getAttribute('aria-label')).toBe(`Global ${action}`);

      dashboard.i18n = { [action]: `Local ${action}` };
      await settle(dashboard);
      I18nService.update({ [action]: `Updated global ${action}` });
      await settle(dashboard);

      expect(control.getAttribute('aria-label')).toBe(`Local ${action}`);
    } finally {
      I18nService.update({ [action]: previous });
    }
  });

  it('limits pointer focus paint to its grip lifetime and restores fresh and keyboard focus cues', async () => {
    const dashboard = await createDashboard('vertical', 'fit', false);
    const panel = dashboard.querySelector<DashboardPanel>('#notes')!;
    const input = dashboard.querySelector('input')!;
    const initial = dashboard.value;

    vi.spyOn(dashboard, 'setPointerCapture').mockImplementation(() => {});

    for (const action of ['move', 'resize'] as const) {
      dashboard.value = initial;
      await settle(dashboard);

      const control = panel.shadowRoot!.querySelector<HTMLElement>(`.grip > [data-dashboard-action="${action}"]`)!;
      const wrapper = control.closest<HTMLElement>('.grip')!;

      vi.spyOn(control, 'setPointerCapture').mockImplementation(() => {});
      input.focus();

      const bounds = control.getBoundingClientRect();
      const point = { x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 };

      control.dispatchEvent(pointer('pointerdown', point.x, point.y));
      dashboard.dispatchEvent(pointer('pointermove', point.x + 13, point.y + 13));
      await rendered(dashboard);

      expect(panel.shadowRoot!.activeElement).toBe(control);
      expect(control.hasAttribute('data-pointer-focus')).toBe(true);
      expect(getComputedStyle(wrapper, '::before').content).toBe('none');

      dashboard.dispatchEvent(pointer('pointerup', point.x + 13, point.y + 13));
      await settle(dashboard);

      expect(control.hasAttribute('data-pointer-focus')).toBe(true);
      expect(getComputedStyle(wrapper, '::before').content).toBe('none');

      const changes = vi.fn();

      dashboard.addEventListener('change', changes);
      await userEvent.keyboard('{ArrowDown}');

      expect(control.hasAttribute('data-pointer-focus')).toBe(false);
      expect(getComputedStyle(wrapper, '::before').content).not.toBe('none');
      expect(changes).toHaveBeenCalledOnce();

      dashboard.removeEventListener('change', changes);
      await settle(dashboard);

      const moved = control.getBoundingClientRect();

      control.dispatchEvent(pointer('pointerdown', moved.left + moved.width / 2, moved.top + moved.height / 2));
      dashboard.dispatchEvent(pointer('pointerup', moved.left + moved.width / 2, moved.top + moved.height / 2));

      expect(control.hasAttribute('data-pointer-focus')).toBe(true);

      input.focus();

      expect(control.hasAttribute('data-pointer-focus')).toBe(false);

      control.focus();

      expect(getComputedStyle(wrapper, '::before').content).not.toBe('none');

      control.dispatchEvent(pointer('pointerdown', moved.left + moved.width / 2, moved.top + moved.height / 2));
      dashboard.dispatchEvent(pointer('pointerup', moved.left + moved.width / 2, moved.top + moved.height / 2));

      expect(control.hasAttribute('data-pointer-focus')).toBe(true);

      panel.remove();

      expect(control.hasAttribute('data-pointer-focus')).toBe(false);

      dashboard.append(panel);
      await settle(dashboard);

      expect(panel.shadowRoot!.querySelector(`.grip > [data-dashboard-action="${action}"]`)).toBe(control);

      control.focus();

      expect(getComputedStyle(wrapper, '::before').content).not.toBe('none');
    }
  });

  describe('cell guide presentation', () => {
    it('changes guide visibility without cancelling a pointer preview or hiding its ghost', async () => {
      const dashboard = await createDashboard('vertical', 'fit', false);
      const panel = dashboard.querySelector('#notes')!;
      const canvas = dashboard.shadowRoot!.querySelector<HTMLElement>('.canvas')!;
      const control = panel.shadowRoot!.querySelector<HTMLElement>('.move-grip > [data-dashboard-action="move"]')!;
      const initial = dashboard.value;
      const changes = vi.fn();

      dashboard.addEventListener('change', changes);

      for (const attribute of [undefined, '', 'invalid', 'auto']) {
        if (attribute === undefined) {
          dashboard.removeAttribute('guides');
        } else {
          dashboard.setAttribute('guides', attribute);
        }

        await rendered(dashboard);

        expect(getComputedStyle(canvas).backgroundImage).toBe('none');
      }

      const bounds = control.getBoundingClientRect();
      const point = { x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 };

      vi.spyOn(control, 'setPointerCapture').mockImplementation(() => {});
      vi.spyOn(dashboard, 'setPointerCapture').mockImplementation(() => {});
      control.dispatchEvent(pointer('pointerdown', point.x, point.y));
      dashboard.dispatchEvent(pointer('pointermove', point.x + 13, point.y + 13));
      await rendered(dashboard);

      const ghost = dashboard.shadowRoot!.querySelector('nve-ghost');

      expect(ghost).not.toBeNull();

      for (const attribute of ['visible', 'hidden', undefined, '', 'invalid', 'auto']) {
        if (attribute === undefined) {
          dashboard.removeAttribute('guides');
        } else {
          dashboard.setAttribute('guides', attribute);
        }

        await rendered(dashboard);

        expect(getComputedStyle(canvas).backgroundImage === 'none').toBe(attribute === 'hidden');
        expect(dashboard.shadowRoot!.querySelector('nve-ghost')).toBe(ghost);
        expect(dashboard.value).toBe(initial);
        expect(changes).not.toHaveBeenCalled();
      }

      dashboard.guides = 'hidden';
      await rendered(dashboard);

      dashboard.dispatchEvent(pointer('pointermove', point.x, point.y + 256));
      await rendered(dashboard);

      expect(getComputedStyle(canvas).backgroundImage).toBe('none');
      expect(dashboard.shadowRoot!.querySelector('nve-ghost')).toBe(ghost);

      const destination = JSON.parse(dashboard.value).items.find((item: { id: string }) => item.id === 'notes');

      expect(destination.row).toBe(0);

      dashboard.dispatchEvent(pointer('pointerup', point.x, point.y + 256));

      expect(JSON.parse(dashboard.value).items.find((item: { id: string }) => item.id === 'notes').row).toBe(2);
      expect(changes).toHaveBeenCalledOnce();

      await settle(dashboard);

      expect(dashboard.shadowRoot!.querySelector('nve-ghost')).toBeNull();

      dashboard.guides = 'visible';
      await rendered(dashboard);

      control.focus();
      await userEvent.keyboard('{ArrowDown}');

      expect(changes).toHaveBeenCalledTimes(2);
      expect(dashboard.shadowRoot!.querySelector('nve-ghost')).toBeNull();
      expect(getComputedStyle(canvas).backgroundImage).not.toBe('none');
    });

    for (const [flow, sizing] of [
      ['vertical', 'fit'],
      ['horizontal', 'fixed']
    ] as const) {
      it(`updates read-only ${flow} ${sizing} guide color, diameter, and pitch directly through CSS`, async () => {
        const dashboard = await createDashboard(flow, sizing, false);

        dashboard.rearrangeable = false;
        dashboard.guides = 'visible';
        await settle(dashboard);

        const canvas = dashboard.shadowRoot!.querySelector<HTMLElement>('.canvas')!;
        const initial = dashboard.value;
        const changes = vi.fn();

        dashboard.addEventListener('change', changes);

        const before = getComputedStyle(canvas).backgroundSize;

        expect(getComputedStyle(canvas).backgroundImage).toContain('4px');

        const render = vi.spyOn(dashboard, 'render');

        dashboard.style.setProperty('--guide-size', '12px');
        dashboard.style.setProperty('--guide-color', 'rgb(12, 34, 56)');
        dashboard.style.setProperty('--gap', '20px');

        const painted = getComputedStyle(canvas);

        expect(painted.backgroundImage).toContain('rgb(12, 34, 56) 6px');
        expect(painted.backgroundSize).not.toBe(before);
        expect(painted.backgroundSize).toBe(flow === 'vertical' ? 'calc(25% + 5px) 140px' : '180px 140px');
        expect(render).not.toHaveBeenCalled();
        expect(dashboard.value).toBe(initial);
        expect(changes).not.toHaveBeenCalled();
        expect(dashboard.shadowRoot!.querySelector('nve-ghost')).toBeNull();
        expect(dashboard.querySelector('input')!.value).toBe('Original notes');
      });
    }
  });

  it('continues measuring a reconnected dashboard without changing its arrangement', async () => {
    const dashboard = await createDashboard();
    const parent = dashboard.parentElement!;
    const notes = dashboard.querySelector<HTMLElement>('#notes')!;
    const initialWidth = notes.getBoundingClientRect().width;
    const value = dashboard.value;

    dashboard.remove();
    parent.append(dashboard);
    await settle(dashboard);

    dashboard.style.width = '480px';
    await vi.waitFor(() => expect(notes.getBoundingClientRect().width).toBeLessThan(initialWidth - 20));

    expect(dashboard.value).toBe(value);
  });

  it('commits fixed-size resizing when the preview introduces its first dashboard scrollbar', async () => {
    const dashboard = await createDashboard('vertical', 'fixed');

    dashboard.querySelector<HTMLElement>('#cases')!.hidden = true;
    dashboard.querySelector<HTMLElement>('#baseline')!.hidden = true;
    dashboard.value = JSON.stringify({
      version: 1,
      grid: { flow: 'vertical', tracks: 2 },
      items: [{ id: 'notes', column: 0, row: 0, columnSpan: 2, rowSpan: 2 }]
    });
    await settle(dashboard);

    const panel = dashboard.querySelector<HTMLElement>('#notes')!;
    const control = panel.shadowRoot!.querySelector<HTMLElement>('[data-dashboard-action="resize"]')!;

    vi.spyOn(control, 'setPointerCapture').mockImplementation(() => {});

    const bounds = control.getBoundingClientRect();
    const before = panel.getBoundingClientRect().height;
    const value = dashboard.value;
    const change = vi.fn();

    dashboard.addEventListener('change', change);

    const x = bounds.left + bounds.width / 2;
    const y = bounds.top + bounds.height / 2;

    control.dispatchEvent(pointer('pointerdown', x, y));
    dashboard.dispatchEvent(pointer('pointermove', x, y + 256));
    await settle(dashboard);

    expect(panel.getBoundingClientRect().height).toBeGreaterThan(before + 120);
    expect(dashboard.value).toBe(value);

    dashboard.dispatchEvent(pointer('pointerup', x, y + 256));
    await settle(dashboard);

    expect(dashboard.value).not.toBe(value);
    expect(change).toHaveBeenCalledOnce();
  });

  it('retargets a pointer ghost in CSS while committing the latest logical target immediately', async () => {
    const dashboard = await createDashboard('vertical', 'fit', false);

    dashboard.style.height = '1600px';
    await settle(dashboard);

    const panel = dashboard.querySelector<HTMLElement>('#notes')!;
    const control = panel.shadowRoot!.querySelector<HTMLElement>('[data-dashboard-action="move"]')!;

    vi.spyOn(control, 'setPointerCapture').mockImplementation(() => {});

    const box = control.getBoundingClientRect();
    const x = box.left + box.width / 2;
    const y = box.top + box.height / 2;
    const before = dashboard.value;
    const change = vi.fn();

    dashboard.addEventListener('change', change);
    control.dispatchEvent(pointer('pointerdown', x, y));
    dashboard.dispatchEvent(pointer('pointermove', x + 13, y + 13));
    await rendered(dashboard);

    const ghost = dashboard.shadowRoot!.querySelector<HTMLElement>('nve-ghost')!;
    const initial = ghost.getBoundingClientRect().top;

    expect(ghost.getAnimations()).toHaveLength(0);

    dashboard.dispatchEvent(pointer('pointermove', x, y + 384));
    await dashboard.updateComplete;

    const target = Number.parseFloat(ghost.style.top);

    expect(target).toBe(384);

    const transition = ghost
      .getAnimations()
      .find(animation => animation instanceof CSSTransition && animation.transitionProperty === 'top');

    expect(transition).toBeDefined();

    transition!.pause();
    transition!.currentTime = Number(transition!.effect!.getComputedTiming().duration) / 2;
    await rendered(dashboard);

    const painted = ghost.getBoundingClientRect().top;

    expect(painted).toBeGreaterThan(initial);
    expect(painted).toBeLessThan(initial + 384);
    expect(panel.getBoundingClientRect().top).toBeCloseTo(initial + 384);
    expect(dashboard.value).toBe(before);

    dashboard.dispatchEvent(pointer('pointermove', x, y + 256));
    await dashboard.updateComplete;

    expect(ghost.style.top).toBe('256px');
    expect(
      ghost
        .getAnimations()
        .find(animation => animation instanceof CSSTransition && animation.transitionProperty === 'top')
    ).toBeDefined();

    dashboard.dispatchEvent(pointer('pointerup', x, y + 256));

    expect(JSON.parse(dashboard.value).items.find((item: { id: string }) => item.id === 'notes').row).toBe(2);
    expect(change).toHaveBeenCalledOnce();

    await settle(dashboard);

    expect(dashboard.shadowRoot!.querySelector('nve-ghost')).toBeNull();
    expect(change).toHaveBeenCalledOnce();
  });
});
