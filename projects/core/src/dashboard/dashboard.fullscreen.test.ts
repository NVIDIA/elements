// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';

import { createFixture, elementIsStable, emulateClick, removeFixture } from '@internals/testing';

import type { Dashboard, DashboardLayout, DashboardPanel } from './index.js';

import './define.js';
import '@nvidia-elements/core/button/define.js';

const initial = JSON.stringify({
  version: 1,
  grid: { flow: 'vertical', tracks: 4 },
  items: [
    { id: 'a', column: 0, row: 0, columnSpan: 2, rowSpan: 2 },
    { id: 'b', column: 2, row: 0, columnSpan: 2, rowSpan: 2 }
  ]
});

describe('dashboard panel fullscreen', () => {
  let fixture: HTMLElement | undefined;
  let native: Element | null = null;

  afterEach(() => {
    if (fixture) {
      removeFixture(fixture);
    }

    vi.restoreAllMocks();
  });

  async function stable(dashboard: Dashboard) {
    await elementIsStable(dashboard);
    await Promise.all([...dashboard.querySelectorAll('nve-dashboard-panel')].map(panel => elementIsStable(panel)));
    await new Promise(requestAnimationFrame);
    await elementIsStable(dashboard);
  }

  async function createDashboardFixture(
    options: { fullscreenable?: boolean; rearrangeable?: boolean; sizing?: 'fit' | 'fixed' } = {}
  ) {
    fixture =
      await createFixture(html`<nve-dashboard ?fullscreenable=${options.fullscreenable ?? true} ?rearrangeable=${options.rearrangeable ?? true} sizing=${options.sizing ?? 'fit'} .value=${initial} style="width:700px;height:320px;--gap:8px;--column-size:160px;--row-size:120px">
      <nve-dashboard-panel id="a"><nve-dashboard-panel-header>First<button slot="suffix">Actions</button></nve-dashboard-panel-header><input aria-label="Draft" value="Unsaved" /><nve-dashboard-panel-footer><button>Save</button></nve-dashboard-panel-footer></nve-dashboard-panel>
      <nve-dashboard-panel id="b"><nve-dashboard-panel-header>Second</nve-dashboard-panel-header><input aria-label="Second draft" value="Second" /></nve-dashboard-panel>
    </nve-dashboard>`);

    const dashboard = fixture.querySelector<Dashboard>('nve-dashboard')!;

    await stable(dashboard);

    const chrome = [...dashboard.querySelectorAll('nve-dashboard-panel')].flatMap(panel => [
      ...panel.getAnimations(),
      ...[...panel.shadowRoot!.querySelectorAll('.grip, .control-divider, .footer')].flatMap(element =>
        element.getAnimations()
      )
    ]);

    await Promise.allSettled(chrome.map(animation => animation.finished));

    native = null;
    const matches = dashboard.matches;

    vi.spyOn(dashboard, 'matches').mockImplementation(selector =>
      selector === ':fullscreen' ? native === dashboard : matches.call(dashboard, selector)
    );
    vi.spyOn(document, 'fullscreenElement', 'get').mockImplementation(() => native);

    const request = vi.spyOn(dashboard, 'requestFullscreen').mockImplementation(async () => {
      native = dashboard;
      document.dispatchEvent(new Event('fullscreenchange'));
    });
    const exit = vi.spyOn(document, 'exitFullscreen').mockImplementation(async () => {
      native = null;
      document.dispatchEvent(new Event('fullscreenchange'));
    });
    const changed = vi.fn();

    dashboard.addEventListener('change', event => {
      if (event.target === dashboard) {
        changed();
      }
    });

    return { dashboard, request, exit, changed, saved: dashboard.value };
  }

  function getPanel(dashboard: Dashboard, id = 'a') {
    return dashboard.querySelector<DashboardPanel>(`#${id}`)!;
  }

  function control(dashboard: Dashboard, id = 'a') {
    return getPanel(dashboard, id).shadowRoot!.querySelector<HTMLElement>('[part~="fullscreen-button"]');
  }

  async function invoke(dashboard: Dashboard, command: string, id = 'a') {
    getPanel(dashboard, id).dispatchEvent(new CommandEvent('command', { command, bubbles: true, composed: true }));
    await stable(dashboard);
  }

  function getProjection(dashboard: Dashboard, id: string) {
    const selected = getPanel(dashboard, id);
    const bounds = selected.getBoundingClientRect();
    const panels = [...dashboard.querySelectorAll('nve-dashboard-panel')];

    return {
      width: bounds.width,
      height: bounds.height,
      transitions: selected.getAnimations().filter(animation => animation instanceof CSSTransition),
      visiblePanels: panels.filter(panel => getComputedStyle(panel).display !== 'none').map(panel => panel.id),
      hiddenPanels: panels.filter(panel => panel.hidden).map(panel => panel.id)
    };
  }

  for (const fullscreenable of [false, true]) {
    it(`preserves application-owned native fullscreen with capability ${fullscreenable}`, async () => {
      const { dashboard, request, exit, saved, changed } = await createDashboardFixture({ fullscreenable });

      await dashboard.requestFullscreen();
      await stable(dashboard);

      expect(request).toHaveBeenCalledOnce();
      expect(native).toBe(dashboard);
      expect(exit).not.toHaveBeenCalled();
      expect(dashboard.value).toBe(saved);
      expect(changed).not.toHaveBeenCalled();

      for (const panel of dashboard.querySelectorAll('nve-dashboard-panel')) {
        expect(getComputedStyle(panel).display).not.toBe('none');
      }

      expect(control(dashboard)?.getAttribute('aria-label')).not.toBe('exit full screen');

      native = null;
      document.dispatchEvent(new Event('fullscreenchange'));
      await stable(dashboard);
    });
  }

  it('defaults fullscreen off and keeps availability queries pure', async () => {
    const { dashboard, request, exit, changed, saved } = await createDashboardFixture({ fullscreenable: false });

    expect(dashboard.fullscreenable).toBe(false);
    expect(dashboard.hasAttribute('fullscreenable')).toBe(false);

    for (const command of ['--enter-fullscreen', '--exit-fullscreen', '--toggle-fullscreen']) {
      expect(dashboard.isCommandAvailable(command, { value: 'a' })).toBe(false);

      await invoke(dashboard, command);
    }

    expect(control(dashboard)).toBeNull();
    expect(request).not.toHaveBeenCalled();
    expect(exit).not.toHaveBeenCalled();
    expect(dashboard.value).toBe(saved);
    expect(changed).not.toHaveBeenCalled();
  });

  it('enables fullscreen independently of rearrangement and preserves an exit control when entry is disabled', async () => {
    const { dashboard, request, exit, saved, changed } = await createDashboardFixture({ rearrangeable: false });
    const button = control(dashboard)!;

    expect(dashboard.hasAttribute('fullscreenable')).toBe(true);
    expect(button.getAttribute('aria-label')).toBe('enter full screen');
    expect(dashboard.isCommandAvailable('--enter-fullscreen', { value: 'a' })).toBe(true);
    expect(dashboard.isCommandAvailable('--move-right', { value: 'a' })).toBe(false);

    await emulateClick(button);
    await stable(dashboard);

    expect(request).toHaveBeenCalledOnce();
    expect(native).toBe(dashboard);
    expect(button.getAttribute('aria-label')).toBe('exit full screen');

    dashboard.fullscreenable = false;
    await stable(dashboard);

    expect(control(dashboard)).toBe(button);
    expect(dashboard.isCommandAvailable('--enter-fullscreen', { value: 'b' })).toBe(false);
    expect(dashboard.isCommandAvailable('--exit-fullscreen', { value: 'a' })).toBe(true);

    await emulateClick(button);
    await stable(dashboard);

    expect(exit).toHaveBeenCalledOnce();
    expect(control(dashboard)).toBeNull();
    expect(dashboard.value).toBe(saved);
    expect(changed).not.toHaveBeenCalled();
  });

  for (const sizing of ['fit', 'fixed'] as const) {
    it(`projects one ${sizing} panel and restores the current layout immediately on browser exit`, async () => {
      const { dashboard, request, changed, saved } = await createDashboardFixture({ sizing });
      const source = getPanel(dashboard);
      const input = source.querySelector('input')!;
      const children = [...dashboard.children];

      input.value = 'Keep fullscreen draft';
      dashboard.guides = 'visible';
      await stable(dashboard);

      const canvasElement = dashboard.shadowRoot!.querySelector<HTMLElement>('.canvas')!;

      expect(getComputedStyle(canvasElement).backgroundImage).not.toBe('none');

      await invoke(dashboard, '--enter-fullscreen');

      expect(request).toHaveBeenCalledOnce();
      expect(getProjection(dashboard, 'a')).toEqual({
        width: dashboard.shadowRoot!.querySelector<HTMLElement>('.viewport')!.clientWidth,
        height: dashboard.shadowRoot!.querySelector<HTMLElement>('.viewport')!.clientHeight,
        transitions: [],
        visiblePanels: ['a'],
        hiddenPanels: []
      });
      expect(getComputedStyle(canvasElement).backgroundImage).toBe('none');
      expect(dashboard.value).toBe(saved);
      expect(changed).not.toHaveBeenCalled();
      expect([...dashboard.children]).toEqual(children);
      expect(dashboard.isCommandAvailable('--move-right', { value: 'a' })).toBe(false);
      expect(dashboard.isCommandAvailable('--increase-height', { value: 'a' })).toBe(false);
      expect(dashboard.place('a', { column: 2, row: 0, columnSpan: 2, rowSpan: 2 })).toBe(false);
      expect(dashboard.place('a', { column: 0, row: 0, columnSpan: 2, rowSpan: 3 })).toBe(false);
      expect(source.shadowRoot!.querySelector('.resize-edge')).toBeNull();
      expect([...source.shadowRoot!.querySelectorAll<HTMLElement>('.grip')].every(grip => grip.inert)).toBe(true);

      const savedLayout: DashboardLayout = JSON.parse(saved);
      const restored: DashboardLayout = {
        ...savedLayout,
        items: savedLayout.items.map(item => (item.id === 'a' ? { ...item, row: 2 } : item))
      };

      dashboard.value = JSON.stringify(restored);
      await stable(dashboard);

      expect(getProjection(dashboard, 'a')).toEqual({
        width: dashboard.shadowRoot!.querySelector<HTMLElement>('.viewport')!.clientWidth,
        height: dashboard.shadowRoot!.querySelector<HTMLElement>('.viewport')!.clientHeight,
        transitions: [],
        visiblePanels: ['a'],
        hiddenPanels: []
      });
      input.focus();
      input.setSelectionRange(1, 4);
      native = null;
      document.dispatchEvent(new Event('fullscreenchange'));
      await stable(dashboard);

      const canvas = dashboard.shadowRoot!.querySelector<HTMLElement>('.canvas')!.getBoundingClientRect();
      const actual = source.getBoundingClientRect();

      expect(actual.x - canvas.x).toBeCloseTo(
        Number.parseFloat(source.style.getPropertyValue('--_dashboard-inline-start')),
        1
      );
      expect(actual.y - canvas.y).toBeCloseTo(Number.parseFloat(source.style.top), 1);
      expect(actual.width).toBeCloseTo(Number.parseFloat(source.style.width), 1);
      expect(actual.height).toBeCloseTo(Number.parseFloat(source.style.height), 1);
      expect(source.getAnimations().filter(animation => animation instanceof CSSTransition)).toEqual([]);
      expect(getComputedStyle(getPanel(dashboard, 'b')).display).not.toBe('none');
      expect(getComputedStyle(canvasElement).backgroundImage).not.toBe('none');
      expect(document.activeElement).toBe(input);
      expect([input.selectionStart, input.selectionEnd]).toEqual([1, 4]);
      expect(source.querySelector('input')).toBe(input);
      expect(input.value).toBe('Keep fullscreen draft');
      expect(dashboard.value).toBe(JSON.stringify(restored));
      expect(changed).not.toHaveBeenCalled();
    });
  }

  it('keeps the focused exit control visible after a scrolled fixed panel returns to the grid', async () => {
    const { dashboard, changed } = await createDashboardFixture({ sizing: 'fixed' });

    dashboard.value = JSON.stringify({
      version: 1,
      grid: { flow: 'horizontal', tracks: 4 },
      items: [
        { id: 'a', column: 0, row: 0, columnSpan: 2, rowSpan: 2 },
        { id: 'b', column: 6, row: 2, columnSpan: 2, rowSpan: 2 }
      ]
    });
    await stable(dashboard);

    const viewport = dashboard.shadowRoot!.querySelector<HTMLElement>('.viewport')!;
    const target = getPanel(dashboard, 'b');

    await vi.waitFor(() =>
      expect(Number.parseFloat(target.style.getPropertyValue('--_dashboard-inline-start'))).toBe(1008)
    );
    await vi.waitFor(() => {
      const canvas = dashboard.shadowRoot!.querySelector('.canvas')!.getBoundingClientRect();

      expect(target.getBoundingClientRect().left - canvas.left).toBeCloseTo(1008, 1);
    });

    viewport.scrollLeft = viewport.scrollWidth;

    const input = target.querySelector('input')!;

    input.value = 'Retained far-panel draft';
    input.setSelectionRange(1, 4);

    const button = control(dashboard, 'b')!;

    button.focus();

    const saved = dashboard.value;

    expect(viewport.scrollLeft).toBeGreaterThan(0);

    await emulateClick(button);
    await stable(dashboard);

    expect(getProjection(dashboard, 'b')).toEqual({
      width: dashboard.shadowRoot!.querySelector<HTMLElement>('.viewport')!.clientWidth,
      height: dashboard.shadowRoot!.querySelector<HTMLElement>('.viewport')!.clientHeight,
      transitions: [],
      visiblePanels: ['b'],
      hiddenPanels: []
    });
    await emulateClick(button);
    await stable(dashboard);
    await vi.waitFor(() => {
      const bounds = button.getBoundingClientRect();
      const view = viewport.getBoundingClientRect();

      expect(bounds.left).toBeGreaterThanOrEqual(view.left);
      expect(bounds.right).toBeLessThanOrEqual(view.left + viewport.clientWidth);
      expect(bounds.top).toBeGreaterThanOrEqual(view.top);
      expect(bounds.bottom).toBeLessThanOrEqual(view.top + viewport.clientHeight);
    });

    expect(target.shadowRoot!.activeElement).toBe(button);
    expect(target.querySelector('input')).toBe(input);
    expect(input.value).toBe('Retained far-panel draft');
    expect([input.selectionStart, input.selectionEnd]).toEqual([1, 4]);
    expect(dashboard.value).toBe(saved);
    expect(changed).not.toHaveBeenCalled();
  });

  it('switches the selected panel without another native request or changing panel ownership', async () => {
    const { dashboard, request, changed, saved } = await createDashboardFixture();
    const children = [...dashboard.children];

    await invoke(dashboard, '--enter-fullscreen');
    await invoke(dashboard, '--enter-fullscreen', 'b');

    expect(getProjection(dashboard, 'b')).toEqual({
      width: dashboard.shadowRoot!.querySelector<HTMLElement>('.viewport')!.clientWidth,
      height: dashboard.shadowRoot!.querySelector<HTMLElement>('.viewport')!.clientHeight,
      transitions: [],
      visiblePanels: ['b'],
      hiddenPanels: []
    });
    expect(request).toHaveBeenCalledOnce();
    expect(dashboard.value).toBe(saved);
    expect([...dashboard.children]).toEqual(children);
    expect(changed).not.toHaveBeenCalled();
  });

  it('routes parent Invokers and panel commands through the same fullscreen session', async () => {
    const { dashboard, request, exit, changed, saved } = await createDashboardFixture();
    const invoker = document.createElement('nve-button');

    dashboard.id = 'fullscreen-target';
    invoker.setAttribute('commandfor', dashboard.id);
    invoker.setAttribute('command', '--enter-fullscreen');
    invoker.value = 'b';
    invoker.textContent = 'Fullscreen second';
    fixture!.prepend(invoker);
    await userEvent.click(invoker);
    await stable(dashboard);

    expect(getProjection(dashboard, 'b')).toEqual({
      width: dashboard.shadowRoot!.querySelector<HTMLElement>('.viewport')!.clientWidth,
      height: dashboard.shadowRoot!.querySelector<HTMLElement>('.viewport')!.clientHeight,
      transitions: [],
      visiblePanels: ['b'],
      hiddenPanels: []
    });
    await invoke(dashboard, '--exit-fullscreen', 'b');

    expect(request).toHaveBeenCalledOnce();
    expect(exit).toHaveBeenCalledOnce();
    expect(dashboard.value).toBe(saved);
    expect(changed).not.toHaveBeenCalled();
  });

  it('retains an accepted fullscreen target through an incomplete peer and restores the current normal frame on exit', async () => {
    const { dashboard, exit, changed, saved } = await createDashboardFixture();
    const selected = getPanel(dashboard);
    const peer = getPanel(dashboard, 'b');
    const before = selected.getBoundingClientRect();

    await invoke(dashboard, '--enter-fullscreen');

    const incomplete = document.createElement('nve-dashboard-panel');
    dashboard.append(incomplete);
    await stable(dashboard);

    expect(native).toBe(dashboard);
    expect(exit).not.toHaveBeenCalled();
    expect(dashboard.isCommandAvailable('--exit-fullscreen', { value: 'a' })).toBe(true);
    expect(selected.getBoundingClientRect().width).toBe(700);
    expect(incomplete.getBoundingClientRect().width).toBe(0);

    await invoke(dashboard, '--exit-fullscreen');

    expect(exit).toHaveBeenCalledOnce();
    expect(selected.getBoundingClientRect().width).toBe(before.width);
    expect(selected.getBoundingClientRect().height).toBe(before.height);
    expect(peer.getBoundingClientRect().width).toBe(before.width);
    expect(getComputedStyle(peer).display).not.toBe('none');
    peer.querySelector('input')!.focus();
    expect(document.activeElement).toBe(peer.querySelector('input'));
    expect(dashboard.value).toBe(saved);
    expect(changed).not.toHaveBeenCalled();
  });

  it('rejects fullscreen admission for a newcomer withheld by incomplete identity', async () => {
    const { dashboard, request } = await createDashboardFixture();
    const newcomer = document.createElement('nve-dashboard-panel');
    const incomplete = document.createElement('nve-dashboard-panel');

    newcomer.id = 'fresh';
    dashboard.append(newcomer, incomplete);

    expect(dashboard.isCommandAvailable('--enter-fullscreen', { value: 'fresh' })).toBe(false);
    await invoke(dashboard, '--enter-fullscreen', 'fresh');

    expect(request).not.toHaveBeenCalled();
    expect(newcomer.getBoundingClientRect().width).toBe(0);
  });

  it('rejects immediate fullscreen admission when a fresh panel cannot fit the current grid', async () => {
    const { dashboard, request } = await createDashboardFixture();
    const newcomer = document.createElement('nve-dashboard-panel');

    newcomer.id = 'fresh';
    newcomer.minColumnSpan = 5;
    dashboard.append(newcomer);

    expect(dashboard.isCommandAvailable('--enter-fullscreen', { value: 'fresh' })).toBe(false);
    await invoke(dashboard, '--enter-fullscreen', 'fresh');

    expect(request).not.toHaveBeenCalled();
    expect(newcomer.getBoundingClientRect().width).toBe(0);
  });

  it('leaves ordinary panels available when the browser rejects fullscreen admission', async () => {
    const { dashboard, request, changed, saved } = await createDashboardFixture();

    request.mockRejectedValueOnce(new Error('Permission denied'));
    await invoke(dashboard, '--enter-fullscreen');
    await vi.waitFor(() => expect(control(dashboard)!.getAttribute('aria-label')).toBe('enter full screen'));

    expect(
      [...dashboard.querySelectorAll('nve-dashboard-panel')].every(panel => getComputedStyle(panel).display !== 'none')
    ).toBe(true);
    expect(dashboard.isCommandAvailable('--exit-fullscreen', { value: 'a' })).toBe(false);
    expect(dashboard.value).toBe(saved);
    expect(changed).not.toHaveBeenCalled();
  });

  for (const removal of ['hidden', 'removed'] as const) {
    it(`exits rather than projecting a replacement when its selected single panel is ${removal}`, async () => {
      const { dashboard, exit } = await createDashboardFixture();

      await invoke(dashboard, '--enter-fullscreen');

      const selected = getPanel(dashboard);

      if (removal === 'hidden') {
        selected.hidden = true;
      } else {
        selected.remove();
      }

      await vi.waitFor(() => expect(exit).toHaveBeenCalledOnce());
      await stable(dashboard);

      expect(native).toBeNull();
      expect(getComputedStyle(getPanel(dashboard, 'b')).display).not.toBe('none');

      if (removal === 'hidden') {
        expect(selected.hidden).toBe(true);
      }
    });
  }
});
