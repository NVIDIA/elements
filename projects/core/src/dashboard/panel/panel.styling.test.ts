// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';

import { createFixture, elementIsStable, removeFixture } from '@internals/testing';

import type { Dashboard, DashboardPanel } from '../index.js';

import '../define.js';

describe('dashboard panel styling', () => {
  let fixture: HTMLElement | undefined;
  let host: HTMLElement;

  afterEach(() => {
    if (fixture) {
      removeFixture(fixture);
    }

    vi.restoreAllMocks();
  });

  beforeEach(async () => {
    fixture = await createFixture(
      html`<div style="position:relative;width:620px;height:320px;--animation-duration:0ms;--animation-easing:ease"><nve-dashboard-panel id="notes" style="width:calc((100% - 8px)/2);height:248px;left:0;top:0"><nve-dashboard-panel-header>Notes</nve-dashboard-panel-header><input value="Kept draft" /><nve-dashboard-panel-footer>Draft investigation</nve-dashboard-panel-footer></nve-dashboard-panel></div>`
    );

    host = fixture.querySelector('div')!;
    const panel = host.querySelector('nve-dashboard-panel')!;

    panel._configure({
      placed: true,
      movable: true,
      resizable: true,
      labels: { move: 'Move panel', resize: 'Resize panel' }
    });
    await settle(host);

    window.scrollTo(0, 0);
  });

  async function settle(container: Element) {
    for (const element of container.querySelectorAll<HTMLElement & { updateComplete?: Promise<boolean> }>('*')) {
      if (element.updateComplete) {
        await elementIsStable(element);
      }
    }

    await new Promise(requestAnimationFrame);
  }

  function focusBox(control: HTMLElement) {
    const target = control.closest<HTMLElement>('.grip')!;
    const bounds = target.getBoundingClientRect();
    const outer = getComputedStyle(target, '::before');
    const inner = getComputedStyle(target, '::after');

    return {
      width: bounds.width,
      height: bounds.height,
      borderStyle: outer.borderTopStyle,
      borderWidth: outer.borderTopWidth,
      color: outer.borderTopColor,
      innerWidth: inner.width,
      innerHeight: inner.height
    };
  }

  it('keeps the far edge of an authored footer action available beside resize chrome', async () => {
    const panel = host.querySelector('#notes')!;
    const footer = panel.querySelector('nve-dashboard-panel-footer')!;
    const action = document.createElement('button');

    action.type = 'button';
    action.textContent = 'Save investigation';
    action.style.marginInlineStart = 'auto';
    footer.replaceChildren(action);
    await settle(host);

    const bounds = action.getBoundingClientRect();
    const hit = document.elementFromPoint(bounds.right - 2, bounds.bottom - 2);

    expect(hit === action || action.contains(hit)).toBe(true);

    const click = vi.fn();

    action.addEventListener('click', click);

    await userEvent.click(action);

    expect(click).toHaveBeenCalledOnce();
  });

  for (const direction of ['ltr', 'rtl']) {
    for (const compact of [false, true]) {
      it(`joins the fullscreen action divider to the header edges in ${compact ? 'compact' : 'default'} ${direction}`, async () => {
        host.dir = direction;

        const panel = host.querySelector('nve-dashboard-panel')!;

        if (compact) {
          const title = panel.querySelector('nve-dashboard-panel-header')!;

          panel.style.setProperty('--control-height', '32px');
          title.style.setProperty('--min-height', '32px');
          title.style.setProperty('--padding', '4px 4px 4px 10px');
        }

        panel._configure({
          placed: true,
          movable: true,
          resizable: true,
          fullscreenControl: 'enter',
          labels: { move: 'Move panel', resize: 'Resize panel', enterFullscreen: 'Enter fullscreen' }
        });
        await settle(host);

        const header = panel.shadowRoot!.querySelector<HTMLElement>('.header')!;
        const action = panel.shadowRoot!.querySelector<HTMLElement>('.fullscreen-action')!;
        const button = action.querySelector('nve-icon-button')!;
        const headerBounds = header.getBoundingClientRect();
        const actionBounds = action.getBoundingClientRect();
        const buttonBounds = button.getBoundingClientRect();
        const headerStyle = getComputedStyle(header);
        const separatorWidth = Number.parseFloat(headerStyle.borderBottomWidth);

        expect(actionBounds.top).toBeCloseTo(headerBounds.top);
        expect(actionBounds.bottom).toBeCloseTo(headerBounds.bottom - separatorWidth);
        expect(buttonBounds.top + buttonBounds.height / 2).toBeCloseTo(actionBounds.top + actionBounds.height / 2);
      });
    }
  }

  it('fills both grip targets with square control surfaces and matching icons', () => {
    const panel = host.querySelector('#notes')!;
    const move = panel.shadowRoot!.querySelector<HTMLElement>('[data-dashboard-action="move"]')!;
    const resize = panel.shadowRoot!.querySelector<HTMLElement>('[data-dashboard-action="resize"]')!;

    for (const control of [move, resize]) {
      const target = control.shadowRoot!.querySelector<HTMLElement>('[internal-host]')!;
      const bounds = control.getBoundingClientRect();
      const internal = target.getBoundingClientRect();

      expect(internal.width).toBeCloseTo(bounds.width);
      expect(internal.height).toBeCloseTo(bounds.height);
      expect(internal.left).toBeCloseTo(bounds.left);
      expect(internal.top).toBeCloseTo(bounds.top);

      const style = getComputedStyle(control);

      expect(style.margin).toBe('0px');
      expect(getComputedStyle(target).padding).toBe('0px');
      expect(getComputedStyle(target).borderRadius).toBe('0px');
    }

    const moveIcon = move.shadowRoot!.querySelector('nve-icon')!;
    const resizeIcon = resize.shadowRoot!.querySelector('nve-icon')!;
    const moveIconSurface = moveIcon.shadowRoot!.querySelector<HTMLElement>('[internal-host]')!;
    const resizeIconSurface = resizeIcon.shadowRoot!.querySelector<HTMLElement>('[internal-host]')!;

    expect(getComputedStyle(resizeIconSurface).width).toBe(getComputedStyle(moveIconSurface).width);
    expect(getComputedStyle(resizeIconSurface).height).toBe(getComputedStyle(moveIconSurface).height);
  });

  for (const scenario of [
    { name: 'normal LTR', direction: 'ltr', width: 620, tall: false },
    { name: 'normal RTL', direction: 'rtl', width: 620, tall: false },
    { name: 'tall header and footer', direction: 'ltr', width: 620, tall: true },
    { name: 'narrow LTR', direction: 'ltr', width: 280, tall: false },
    { name: 'narrow RTL with tall chrome', direction: 'rtl', width: 280, tall: true }
  ]) {
    it(`keeps identical handle targets and rectangular focus boxes with ${scenario.name}`, async () => {
      host.dir = scenario.direction;
      host.style.width = `${scenario.width}px`;

      const panel = host.querySelector('#notes')!;
      const header = panel.querySelector('nve-dashboard-panel-header')!;
      const footer = panel.querySelector('nve-dashboard-panel-footer')!;

      if (scenario.tall) {
        header.setAttribute('style', '--min-height:96px');
        footer.setAttribute('style', '--padding:24px 8px');
      }

      const decoration = document.createElement('span');

      decoration.slot = 'prefix';
      decoration.textContent = '•';

      const headerAction = document.createElement('button');

      headerAction.slot = 'suffix';
      headerAction.textContent = 'More';

      const footerAction = document.createElement('button');

      footerAction.slot = 'suffix';
      footerAction.textContent = 'Save';
      header.append(decoration, headerAction);
      footer.append(footerAction);
      await settle(host);

      const move = panel.shadowRoot!.querySelector<HTMLElement>('[data-dashboard-action="move"]')!;
      const resize = panel.shadowRoot!.querySelector<HTMLElement>('[data-dashboard-action="resize"]')!;
      const moveBounds = move.getBoundingClientRect();
      const resizeBounds = resize.getBoundingClientRect();

      expect(resizeBounds.width).toBeCloseTo(moveBounds.width);
      expect(resizeBounds.height).toBeCloseTo(moveBounds.height);
      expect(moveBounds.width).toBe(36);
      expect(moveBounds.height).toBe(48);

      expect(footerAction.assignedSlot?.name).toBe('suffix');

      if (scenario.direction === 'rtl') {
        expect(footerAction.getBoundingClientRect().left).toBeGreaterThanOrEqual(resizeBounds.right);
        expect(resizeBounds.left).toBeLessThan(panel.getBoundingClientRect().left + 12);
      } else {
        expect(footerAction.getBoundingClientRect().right).toBeLessThanOrEqual(resizeBounds.left);
        expect(resizeBounds.right).toBeGreaterThan(panel.getBoundingClientRect().right - 12);
      }

      const headerRow = panel.shadowRoot!.querySelector<HTMLElement>('.header')!;
      const footerRow = panel.shadowRoot!.querySelector<HTMLElement>('.footer')!;

      expect(Number.parseFloat(getComputedStyle(headerRow).borderBottomWidth)).toBeGreaterThan(0);
      expect(Number.parseFloat(getComputedStyle(footerRow).borderTopWidth)).toBeGreaterThan(0);

      const childFooter = footer.shadowRoot!.querySelector<HTMLElement>('[internal-host]')!;

      expect(Number.parseFloat(getComputedStyle(childFooter).borderTopWidth)).toBe(0);

      await userEvent.keyboard('{Tab}');

      move.focus();
      await settle(host);

      const moveFocus = focusBox(move);

      expect(moveFocus.borderStyle).toBe('solid');
      expect(moveFocus.borderWidth).toBe('2px');
      expect(moveFocus.innerWidth).toBe('32px');
      expect(moveFocus.innerHeight).toBe('44px');

      resize.focus();
      await settle(host);

      expect(focusBox(resize)).toEqual(moveFocus);

      const change = vi.fn();

      host.addEventListener('change', change);
      await userEvent.click(headerAction);
      await userEvent.click(footerAction);

      expect(change).not.toHaveBeenCalled();

      footer.remove();
      await settle(host);

      expect(Number.parseFloat(getComputedStyle(footerRow).borderTopWidth)).toBeGreaterThan(0);
    });
  }

  it('bounds long footer actions inside their scrollable area and keeps the resize corner available', async () => {
    host.style.width = '280px';

    const panel = host.querySelector('#notes')!;
    const footer = panel.querySelector('nve-dashboard-panel-footer')!;
    const action = document.createElement('button');

    action.type = 'button';
    action.slot = 'suffix';
    action.textContent = 'Export investigation';
    action.style.cssText = 'width:180px;flex:none';
    footer.append(action);
    await settle(host);
    await vi.waitFor(() => expect(panel.getBoundingClientRect().width).toBeCloseTo(136, 1));

    const suffix = footer.shadowRoot!.querySelector<HTMLSlotElement>('slot[name="suffix"]')!;

    expect(suffix.scrollWidth).toBeGreaterThan(suffix.clientWidth);

    suffix.scrollLeft = suffix.scrollWidth;
    await settle(host);

    const resize = panel.shadowRoot!.querySelector<HTMLElement>('[data-dashboard-action="resize"]')!;
    const bounds = resize.getBoundingClientRect();
    const point = panel.shadowRoot!.elementFromPoint(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2);

    expect(point === resize || resize.contains(point)).toBe(true);

    const visible = suffix.getBoundingClientRect();
    const actionBounds = action.getBoundingClientRect();

    expect(actionBounds.right).toBeLessThanOrEqual(visible.right + 1);
    expect(visible.right).toBeLessThanOrEqual(bounds.left);

    const click = vi.fn();

    action.addEventListener('click', click);

    await userEvent.click(action);

    expect(click).toHaveBeenCalledOnce();
  });

  it('bounds long header actions without covering the movement grip', async () => {
    host.style.width = '280px';

    const panel = host.querySelector('#notes')!;
    const header = panel.querySelector('nve-dashboard-panel-header')!;
    const action = document.createElement('button');

    action.type = 'button';
    action.slot = 'suffix';
    action.textContent = 'Investigation actions';
    action.style.cssText = 'width:180px;flex:none';
    header.append(action);
    await settle(host);

    const suffix = header.shadowRoot!.querySelector<HTMLSlotElement>('slot[name="suffix"]')!;

    expect(suffix.scrollWidth).toBeGreaterThan(suffix.clientWidth);

    suffix.scrollLeft = suffix.scrollWidth;
    await settle(host);

    const move = panel.shadowRoot!.querySelector<HTMLElement>('[data-dashboard-action="move"]')!;
    const bounds = move.getBoundingClientRect();
    const point = panel.shadowRoot!.elementFromPoint(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2);

    expect(point === move || move.contains(point)).toBe(true);

    const visible = suffix.getBoundingClientRect();

    expect(visible.left).toBeGreaterThanOrEqual(bounds.right);
    expect(action.getBoundingClientRect().right).toBeLessThanOrEqual(visible.right + 1);

    const click = vi.fn();

    action.addEventListener('click', click);

    await userEvent.click(action);

    expect(click).toHaveBeenCalledOnce();
  });

  it('bounds wide default footer content beside suffix actions and keeps both keyboard reachable', async () => {
    host.style.width = '280px';

    const panel = host.querySelector('#notes')!;
    const footer = panel.querySelector('nve-dashboard-panel-footer')!;
    const contentAction = document.createElement('button');

    contentAction.type = 'button';
    contentAction.textContent = 'Open detailed investigation';
    contentAction.style.cssText = 'width:180px;white-space:nowrap';

    const suffixAction = document.createElement('button');

    suffixAction.type = 'button';
    suffixAction.slot = 'suffix';
    suffixAction.textContent = 'Save';
    footer.replaceChildren(contentAction, suffixAction);
    await settle(host);
    await vi.waitFor(() => expect(panel.getBoundingClientRect().width).toBeCloseTo(136, 1));

    const content = footer.shadowRoot!.querySelector<HTMLElement>('.content')!;
    const suffix = footer.shadowRoot!.querySelector<HTMLSlotElement>('slot[name="suffix"]')!;

    expect(content.scrollWidth).toBeGreaterThan(content.clientWidth);
    expect(getComputedStyle(content).overflowX).toBe('auto');

    content.scrollLeft = content.scrollWidth;
    await settle(host);

    const resize = panel.shadowRoot!.querySelector<HTMLElement>('[data-dashboard-action="resize"]')!;
    const bounds = resize.getBoundingClientRect();

    expect(content.getBoundingClientRect().right).toBeLessThanOrEqual(suffix.getBoundingClientRect().left);
    expect(suffix.getBoundingClientRect().right).toBeLessThanOrEqual(bounds.left);

    const point = panel.shadowRoot!.elementFromPoint(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2);

    expect(point === resize || resize.contains(point)).toBe(true);

    contentAction.focus();
    await userEvent.keyboard('{Tab}');

    expect(document.activeElement).toBe(suffixAction);

    const click = vi.fn();

    contentAction.addEventListener('click', click);
    await userEvent.click(contentAction);

    expect(click).toHaveBeenCalledOnce();
  });
});

describe('dashboard panel control transitions', () => {
  let fixture: HTMLElement;

  afterEach(() => removeFixture(fixture));

  async function renderDashboard(dashboard: Dashboard) {
    await elementIsStable(dashboard);
    await Promise.all([...dashboard.querySelectorAll('nve-dashboard-panel')].map(panel => elementIsStable(panel)));
    await new Promise(requestAnimationFrame);
    await elementIsStable(dashboard);
    await new Promise(requestAnimationFrame);
  }

  async function createDashboard(options: { direction: 'ltr' | 'rtl'; rearrangeable: boolean }) {
    fixture = await createFixture(html`<div></div>`);

    const dashboard = document.createElement('nve-dashboard');
    const transitions = vi.fn();

    dashboard.dir = options.direction;
    dashboard.rearrangeable = options.rearrangeable;
    dashboard.style.cssText = 'width:620px;height:400px;--row-size:90px;--animation-duration:1000ms';
    dashboard.value = JSON.stringify({
      version: 1,
      grid: { flow: 'vertical', tracks: 6 },
      items: [
        { id: 'baseline', column: 0, row: 0, columnSpan: 3, rowSpan: 2 },
        { id: 'notes', column: 3, row: 0, columnSpan: 3, rowSpan: 2 }
      ]
    });
    dashboard.innerHTML = `
      <nve-dashboard-panel id="baseline">
        <nve-dashboard-panel-header>Baseline</nve-dashboard-panel-header>
        Reference run
        <nve-dashboard-panel-footer>Complete</nve-dashboard-panel-footer>
      </nve-dashboard-panel>
      <nve-dashboard-panel id="notes">
        <nve-dashboard-panel-header>Notes</nve-dashboard-panel-header>
        <input value="Kept draft" />
      </nve-dashboard-panel>`;
    fixture.append(dashboard);

    const baseline = dashboard.querySelector<DashboardPanel>('#baseline')!;
    const notes = dashboard.querySelector<DashboardPanel>('#notes')!;

    baseline.shadowRoot!.addEventListener('transitionrun', transitions);
    notes.shadowRoot!.addEventListener('transitionrun', transitions);
    await renderDashboard(dashboard);

    return { dashboard, baseline, notes, transitions };
  }

  it.each([
    { direction: 'ltr', rearrangeable: false },
    { direction: 'rtl', rearrangeable: false },
    { direction: 'ltr', rearrangeable: true },
    { direction: 'rtl', rearrangeable: true }
  ] as const)(
    'inserts and reconnects panels without revealing controls separately in $direction with rearrangeable=$rearrangeable',
    async options => {
      const { dashboard, notes, transitions } = await createDashboard(options);

      expect(transitions).not.toHaveBeenCalled();

      const added = document.createElement('nve-dashboard-panel');

      added.id = 'candidate';
      added.innerHTML = `
        <nve-dashboard-panel-header>Candidate</nve-dashboard-panel-header>
        Current run
        <nve-dashboard-panel-footer>Review</nve-dashboard-panel-footer>`;
      dashboard.append(added);
      added.shadowRoot!.addEventListener('transitionrun', transitions);
      await renderDashboard(dashboard);

      expect(transitions).not.toHaveBeenCalled();

      notes.remove();
      await renderDashboard(dashboard);
      dashboard.append(notes);
      await renderDashboard(dashboard);

      expect(transitions).not.toHaveBeenCalled();
      expect(notes.querySelector('input')!.value).toBe('Kept draft');

      added.remove();
      dashboard.append(added);
      await renderDashboard(dashboard);

      expect(transitions).not.toHaveBeenCalled();
    }
  );

  it.each([false, true])(
    'reconnects without control transitions after rearrangeable changes to %s while absent',
    async rearrangeable => {
      const { dashboard, notes, transitions } = await createDashboard({
        direction: 'ltr',
        rearrangeable: !rearrangeable
      });

      notes.remove();
      dashboard.rearrangeable = rearrangeable;
      await renderDashboard(dashboard);
      transitions.mockClear();

      dashboard.append(notes);
      await renderDashboard(dashboard);

      const moveGrip = notes.shadowRoot!.querySelector<HTMLElement>('.move-grip')!;

      expect(transitions).not.toHaveBeenCalled();
      expect(moveGrip.inert).toBe(!rearrangeable);
    }
  );
});
