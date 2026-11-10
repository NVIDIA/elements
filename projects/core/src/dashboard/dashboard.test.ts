// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';

import { createFixture, elementIsStable, removeFixture } from '@internals/testing';

import { parseDashboardValue } from './utils/layout.utils.js';

import { Dashboard } from './dashboard.js';

import type { DashboardPanel } from './panel/panel.js';

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

describe(Dashboard.metadata.tag, () => {
  let fixture: HTMLElement | undefined;

  afterEach(() => {
    if (fixture) {
      removeFixture(fixture);
    }

    vi.restoreAllMocks();
  });

  async function createDashboard() {
    fixture =
      await createFixture(html`<nve-dashboard autosettle .value=${initial} rearrangeable style="width:608px;height:300px;--gap:8px">
      <nve-dashboard-panel id="a"><nve-dashboard-panel-header>First<button slot="suffix">Action</button></nve-dashboard-panel-header><input value="unsaved" /></nve-dashboard-panel>
      <nve-dashboard-panel id="b"><nve-dashboard-panel-header>Second</nve-dashboard-panel-header>Content</nve-dashboard-panel>
    </nve-dashboard>`);

    const dashboard = fixture.querySelector('nve-dashboard')!;

    await elementIsStable(dashboard);
    await vi.waitFor(() => expect(dashboard.querySelector<HTMLElement>('#a')!.style.width).not.toBe(''));
    await elementIsStable(dashboard.querySelector('nve-dashboard-panel')!);

    return dashboard;
  }

  function control(panel: DashboardPanel, action: string) {
    return panel.shadowRoot!.querySelector<HTMLElement>(`[data-dashboard-action="${action}"]`)!;
  }

  const key = (element: HTMLElement, value: string) => {
    for (const type of ['keydown', 'keyup']) {
      element.dispatchEvent(
        new KeyboardEvent(type, { key: value, code: value, bubbles: true, composed: true, cancelable: true })
      );
    }
  };

  const pointer = (type: string, x: number, y: number) =>
    new PointerEvent(type, {
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

  it('locks and unlocks movement and resizing while keeping application content interactive', async () => {
    expect(new Dashboard().rearrangeable).toBe(false);

    const dashboard = await createDashboard();
    const panel = dashboard.querySelector<DashboardPanel>('#a')!;
    const input = panel.querySelector('input')!;
    const changed = vi.fn();
    const inputChanged = vi.fn();

    dashboard.addEventListener('change', event => {
      if (event.target === dashboard) {
        changed();
      }

      if (event.target === input) {
        inputChanged();
      }
    });

    expect(control(panel, 'move')).not.toBeNull();
    expect(control(panel, 'resize')).not.toBeNull();

    dashboard.rearrangeable = false;
    await elementIsStable(dashboard);
    await elementIsStable(panel);

    expect(control(panel, 'move').closest<HTMLElement>('.grip')!.inert).toBe(true);
    expect(control(panel, 'resize').closest<HTMLElement>('.grip')!.inert).toBe(true);
    expect(dashboard.isCommandAvailable('--move-right', { value: 'a' })).toBe(false);
    expect(dashboard.isCommandAvailable('--increase-height', { value: 'a' })).toBe(false);
    expect(dashboard.place('a', { column: 2, row: 0, columnSpan: 2, rowSpan: 2 })).toBe(false);
    expect(dashboard.place('a', { column: 0, row: 0, columnSpan: 2, rowSpan: 3 })).toBe(false);

    await userEvent.click(input);
    await userEvent.keyboard('{End} while locked');
    await userEvent.click(panel.querySelector('button')!);

    expect(input.value).toBe('unsaved while locked');
    expect(inputChanged).toHaveBeenCalledOnce();
    expect(panel.querySelector('input')).toBe(input);
    expect(dashboard.value).toBe(initial);
    expect(changed).not.toHaveBeenCalled();

    dashboard.rearrangeable = true;
    await elementIsStable(dashboard);
    await elementIsStable(panel);

    expect(control(panel, 'move')).not.toBeNull();
    expect(control(panel, 'resize')).not.toBeNull();
    expect(dashboard.isCommandAvailable('--move-right', { value: 'a' })).toBe(true);
    expect(dashboard.isCommandAvailable('--increase-height', { value: 'a' })).toBe(true);
    expect(dashboard.value).toBe(initial);
    expect(panel.querySelector('input')).toBe(input);
    expect(changed).not.toHaveBeenCalled();
  });

  it('publishes grid-based movement on unlock without waiting for control rendering', async () => {
    const dashboard = await createDashboard();
    const panels = [...dashboard.querySelectorAll('nve-dashboard-panel')];

    dashboard.rearrangeable = false;
    await elementIsStable(dashboard);
    await Promise.all(panels.map(panel => panel.updateComplete));

    const available: boolean[] = [];
    const change = vi.fn();

    dashboard.addEventListener('commandavailabilitychange', () => {
      available.push(dashboard.isCommandAvailable('--move-right', { value: 'a' }));
    });
    dashboard.addEventListener('change', change);
    dashboard.rearrangeable = true;

    expect(dashboard.isCommandAvailable('--move-right', { value: 'a' })).toBe(true);

    await elementIsStable(dashboard);
    await Promise.all(panels.map(panel => panel.updateComplete));

    expect(available).toEqual([true]);
    expect(dashboard.value).toBe(initial);
    expect(change).not.toHaveBeenCalled();

    dashboard.requestUpdate();
    await elementIsStable(dashboard);

    expect(available).toEqual([true]);
  });

  it('queries and executes directional commands inside a container with no rendered geometry', async () => {
    fixture = await createFixture(html`
      <div style="display:none">
        <nve-dashboard rearrangeable .value=${initial}>
          <nve-dashboard-panel id="a"><nve-dashboard-panel-header>First</nve-dashboard-panel-header></nve-dashboard-panel>
          <nve-dashboard-panel id="b"><nve-dashboard-panel-header>Second</nve-dashboard-panel-header></nve-dashboard-panel>
        </nve-dashboard>
      </div>
    `);

    const dashboard = fixture.querySelector('nve-dashboard')!;
    const panels = [...dashboard.querySelectorAll('nve-dashboard-panel')];

    await elementIsStable(dashboard);
    await Promise.all(panels.map(panel => panel.updateComplete));

    const change = vi.fn();

    dashboard.addEventListener('change', change);

    expect(dashboard.isCommandAvailable('--move-right', { value: 'a' })).toBe(true);

    panels[0]!.dispatchEvent(new CommandEvent('command', { command: '--move-right' }));
    await elementIsStable(dashboard);

    expect(parseDashboardValue(dashboard.value)?.items).toEqual([
      { id: 'a', column: 2, row: 0, columnSpan: 2, rowSpan: 2 },
      { id: 'b', column: 0, row: 0, columnSpan: 2, rowSpan: 2 }
    ]);
    expect(change).toHaveBeenCalledOnce();
  });

  it('retains independent panel restrictions across a parent lock and unlock', async () => {
    const dashboard = await createDashboard();
    const panel = dashboard.querySelector<DashboardPanel>('#a')!;
    const other = dashboard.querySelector<DashboardPanel>('#b')!;

    panel.moveDisabled = true;
    await elementIsStable(dashboard);
    await elementIsStable(panel);

    expect(control(panel, 'move').closest<HTMLElement>('.grip')!.inert).toBe(true);
    expect(control(panel, 'resize')).not.toBeNull();

    panel.moveDisabled = false;
    panel.resizeDisabled = true;
    await elementIsStable(dashboard);
    await elementIsStable(panel);

    expect(control(panel, 'move')).not.toBeNull();
    expect(control(panel, 'resize').closest<HTMLElement>('.grip')!.inert).toBe(true);
    expect(control(other, 'move')).not.toBeNull();
    expect(control(other, 'resize')).not.toBeNull();

    dashboard.rearrangeable = false;
    await elementIsStable(dashboard);
    await elementIsStable(other);

    expect(control(other, 'move').closest<HTMLElement>('.grip')!.inert).toBe(true);
    expect(control(other, 'resize').closest<HTMLElement>('.grip')!.inert).toBe(true);

    dashboard.rearrangeable = true;
    await elementIsStable(dashboard);
    await elementIsStable(panel);

    expect(panel.resizeDisabled).toBe(true);
    expect(control(panel, 'move')).not.toBeNull();
    expect(control(panel, 'resize').closest<HTMLElement>('.grip')!.inert).toBe(true);
    expect(dashboard.value).toBe(initial);
  });

  it('restores silently and preserves the supplied content identity', async () => {
    const dashboard = await createDashboard();
    const input = dashboard.querySelector('input')!;

    input.value = 'edited';

    const listener = vi.fn();

    dashboard.addEventListener('change', listener);
    dashboard.value = initial;
    await elementIsStable(dashboard);

    expect(dashboard.querySelector('input')).toBe(input);
    expect(input.value).toBe('edited');
    expect(listener).not.toHaveBeenCalled();
  });

  it.each(['place', 'membership'] as const)(
    'preserves a synchronous application restore after %s changes',
    async action => {
      const dashboard = await createDashboard();
      const optimized = JSON.stringify({
        version: 1,
        grid: { flow: 'vertical', tracks: 4 },
        items: [
          { id: 'a', column: 0, row: 0, columnSpan: 3, rowSpan: 2 },
          { id: 'b', column: 1, row: 2, columnSpan: 2, rowSpan: 2 }
        ]
      });
      const changes = vi.fn(() => {
        dashboard.value = optimized;
      });

      dashboard.addEventListener('change', changes);

      if (action === 'place') {
        dashboard.place('a', { column: 2, row: 0, columnSpan: 2, rowSpan: 2 });
      } else {
        dashboard.querySelector('nve-dashboard-panel')!.minColumnSpan = 3;
      }

      await vi.waitFor(() => expect(changes).toHaveBeenCalledOnce());
      await elementIsStable(dashboard);

      expect(dashboard.value).toBe(optimized);
      expect(dashboard.shadowRoot!.querySelector('.canvas')!.hasAttribute('hidden')).toBe(false);
      expect(dashboard.querySelector<HTMLElement>('#a')!.style.height).toBe('248px');
    }
  );

  it('finishes an application reset requested synchronously by membership reconciliation', async () => {
    const dashboard = await createDashboard();
    const changes = vi.fn(() => {
      dashboard.value = '';
    });

    dashboard.addEventListener('change', changes);
    dashboard.querySelector('nve-dashboard-panel')!.minColumnSpan = 3;
    await vi.waitFor(() => expect(changes).toHaveBeenCalledOnce());
    await elementIsStable(dashboard);

    expect(parseDashboardValue(dashboard.value)?.items).toEqual([
      { id: 'a', column: 0, row: 0, columnSpan: 3, rowSpan: 1 },
      { id: 'b', column: 3, row: 0, columnSpan: 1, rowSpan: 1 }
    ]);
    expect(dashboard.shadowRoot!.querySelector('.canvas')!.hasAttribute('hidden')).toBe(false);
  });

  it('reflects autoSettle in both directions and silently normalizes when its attribute enables it', async () => {
    const dashboard = await createDashboard();
    const changes = vi.fn();

    dashboard.addEventListener('change', changes);
    dashboard.autoSettle = false;
    await elementIsStable(dashboard);

    expect(dashboard.hasAttribute('autosettle')).toBe(false);

    const sparse = JSON.stringify({
      version: 1,
      grid: { flow: 'vertical', tracks: 4 },
      items: [
        { id: 'a', column: 0, row: 3, columnSpan: 2, rowSpan: 2 },
        { id: 'b', column: 2, row: 0, columnSpan: 2, rowSpan: 2 }
      ]
    });

    dashboard.value = sparse;
    await elementIsStable(dashboard);

    expect(dashboard.value).toBe(sparse);

    dashboard.setAttribute('autosettle', '');

    expect(dashboard.autoSettle).toBe(true);
    expect(dashboard.value).toBe(initial);

    await elementIsStable(dashboard);

    dashboard.removeAttribute('autosettle');

    expect(dashboard.autoSettle).toBe(false);
    expect(dashboard.value).toBe(initial);

    dashboard.autoSettle = true;
    await elementIsStable(dashboard);

    expect(dashboard.hasAttribute('autosettle')).toBe(true);
    expect(changes).not.toHaveBeenCalled();
  });

  it.each(['left', 'top'] as const)('resizes the %s edge without enabling arbitrary placement movement', async edge => {
    const dashboard = await createDashboard();

    dashboard.autoSettle = false;
    dashboard.value = JSON.stringify({
      version: 1,
      grid: { flow: 'vertical', tracks: 4 },
      items: [
        { id: 'a', column: 1, row: 1, columnSpan: 2, rowSpan: 2 },
        { id: 'b', column: 3, row: 0, columnSpan: 1, rowSpan: 2 }
      ]
    });
    await elementIsStable(dashboard);

    const panel = dashboard.querySelector<DashboardPanel>('#a')!;

    await elementIsStable(panel);

    panel.moveDisabled = true;
    await elementIsStable(dashboard);
    await elementIsStable(panel);

    const zone = panel.shadowRoot!.querySelector<HTMLElement>(`[data-dashboard-edge="${edge}"]`)!;
    const changes = vi.fn();

    dashboard.addEventListener('change', changes);
    vi.spyOn(dashboard, 'setPointerCapture').mockImplementation(() => {});

    const sample = (type: string, x: number, y: number) =>
      new PointerEvent(type, {
        pointerType: 'mouse',
        clientX: x,
        clientY: y,
        pointerId: 5,
        isPrimary: true,
        button: 0,
        buttons: type === 'pointerup' ? 0 : 1,
        bubbles: true,
        composed: true,
        cancelable: true
      });

    zone.dispatchEvent(sample('pointerdown', 200, 200));
    dashboard.dispatchEvent(sample('pointerup', edge === 'left' ? 46 : 200, edge === 'top' ? 72 : 200));
    await elementIsStable(dashboard);

    const expected =
      edge === 'left'
        ? { column: 0, row: 1, columnSpan: 3, rowSpan: 2 }
        : { column: 1, row: 0, columnSpan: 2, rowSpan: 3 };

    expect(parseDashboardValue(dashboard.value)?.items[0]).toEqual({ id: 'a', ...expected });
    expect(changes).toHaveBeenCalledOnce();
    expect(panel.shadowRoot!.activeElement).toBe(control(panel, 'resize'));

    expect(dashboard.place('a', { ...expected, column: expected.column + 1 })).toBe(false);
    expect(
      dashboard.isCommandAvailable('--place', { value: 'a', placement: { ...expected, column: expected.column + 1 } })
    ).toBe(false);
  });

  it('reflects guide visibility without changing the saved layout or arrangement permissions', async () => {
    const dashboard = await createDashboard();
    const changes = vi.fn();

    dashboard.addEventListener('change', changes);

    expect(dashboard.guides).toBe('auto');
    expect(dashboard.getAttribute('guides')).toBe('auto');

    dashboard.guides = 'visible';
    await elementIsStable(dashboard);

    expect(dashboard.getAttribute('guides')).toBe('visible');

    dashboard.setAttribute('guides', 'hidden');

    expect(dashboard.guides).toBe('hidden');

    await elementIsStable(dashboard);

    expect(dashboard.value).toBe(initial);
    expect(dashboard.rearrangeable).toBe(true);
    expect(changes).not.toHaveBeenCalled();
  });

  it('updates guide diameter, color, and pitch through CSS without component updates', async () => {
    const dashboard = await createDashboard();

    dashboard.guides = 'visible';
    await elementIsStable(dashboard);

    const canvas = dashboard.shadowRoot!.querySelector<HTMLElement>('.canvas')!;
    const defaults = getComputedStyle(canvas);

    expect(defaults.backgroundImage).toContain('4px');

    const initialPitch = defaults.backgroundSize;
    const muted = getComputedStyle(dashboard).getPropertyValue('--nve-ref-border-color-muted').trim();

    expect(getComputedStyle(dashboard).getPropertyValue('--guide-color').trim()).toBe(muted);

    const updates = vi.spyOn(dashboard, 'requestUpdate');

    dashboard.style.setProperty('--guide-size', '12px');
    dashboard.style.setProperty('--guide-color', 'rgb(1, 2, 3)');
    dashboard.style.setProperty('--gap', '0px');

    const customized = getComputedStyle(canvas);

    expect(customized.backgroundImage).toContain('6px');
    expect(customized.backgroundImage).toContain('rgb(1, 2, 3)');
    expect(customized.backgroundSize).not.toBe(initialPitch);
    expect(updates).not.toHaveBeenCalled();
  });

  it.each(['move', 'resize'])(
    'keeps pointer %s focus while restoring the custom cue on keyboard input and fresh focus',
    async action => {
      const dashboard = await createDashboard();
      const panel = dashboard.querySelector('nve-dashboard-panel')!;
      const input = panel.querySelector('input')!;
      const handle = control(panel, action);
      const grip = handle.parentElement!;

      input.focus();
      vi.spyOn(dashboard, 'setPointerCapture').mockImplementation(() => {});
      handle.dispatchEvent(pointer('pointerdown', 50, 50));

      expect(panel.shadowRoot!.activeElement).toBe(handle);
      expect(handle.hasAttribute('data-pointer-focus')).toBe(true);
      expect(getComputedStyle(grip, '::before').content).toBe('none');

      dashboard.dispatchEvent(pointer('pointerup', 50, 50));
      await elementIsStable(dashboard);

      expect(handle.hasAttribute('data-pointer-focus')).toBe(true);

      key(handle, 'ArrowDown');
      await elementIsStable(dashboard);

      expect(handle.hasAttribute('data-pointer-focus')).toBe(false);

      handle.dispatchEvent(pointer('pointerdown', 50, 50));
      dashboard.dispatchEvent(pointer('pointerup', 50, 50));
      input.focus();

      expect(handle.hasAttribute('data-pointer-focus')).toBe(false);

      handle.focus();

      expect(handle.hasAttribute('data-pointer-focus')).toBe(false);
    }
  );

  it('clears pointer focus paint when a panel disconnects and returns with the same controls', async () => {
    const dashboard = await createDashboard();
    const panel = dashboard.querySelector('nve-dashboard-panel')!;
    const handle = control(panel, 'resize');

    vi.spyOn(dashboard, 'setPointerCapture').mockImplementation(() => {});
    handle.dispatchEvent(pointer('pointerdown', 50, 50));
    dashboard.dispatchEvent(pointer('pointerup', 50, 50));

    expect(handle.hasAttribute('data-pointer-focus')).toBe(true);

    panel.remove();

    expect(handle.hasAttribute('data-pointer-focus')).toBe(false);

    dashboard.append(panel);
    await elementIsStable(dashboard);
    await elementIsStable(panel);

    expect(control(panel, 'resize')).toBe(handle);
    expect(handle.hasAttribute('data-pointer-focus')).toBe(false);
  });

  it.each(['move', 'resize'])(
    'keeps %s focus fill and foreground after pointer release until actual blur',
    async action => {
      const dashboard = await createDashboard();
      const panel = dashboard.querySelector('nve-dashboard-panel')!;
      const input = panel.querySelector('input')!;
      const handle = control(panel, action);
      const surface = handle.shadowRoot!.querySelector<HTMLElement>('[interaction-state]')!;

      input.focus();

      const initialBackground = getComputedStyle(surface).backgroundImage;
      const initialColor = getComputedStyle(handle).getPropertyValue('--color');
      const initialSize = {
        width: handle.getBoundingClientRect().width,
        height: handle.getBoundingClientRect().height
      };
      const changes = vi.fn();

      dashboard.addEventListener('change', changes);
      vi.spyOn(dashboard, 'setPointerCapture').mockImplementation(() => {});
      handle.dispatchEvent(pointer('pointerdown', 50, 50));
      dashboard.dispatchEvent(pointer('pointerup', 50, 50));
      await elementIsStable(dashboard);

      const focusedBackground = getComputedStyle(surface).backgroundImage;

      expect(focusedBackground).not.toBe(initialBackground);
      expect(getComputedStyle(handle).getPropertyValue('--color')).toBe(
        getComputedStyle(handle).getPropertyValue('--nve-sys-interaction-selected-color')
      );
      expect(handle.matches(':state(pressed)')).toBe(false);

      key(handle, 'Enter');
      await elementIsStable(dashboard);

      expect(getComputedStyle(surface).backgroundImage).toBe(focusedBackground);
      expect(handle.matches(':state(pressed)')).toBe(false);
      expect({ width: handle.getBoundingClientRect().width, height: handle.getBoundingClientRect().height }).toEqual(
        initialSize
      );

      input.focus();

      expect(getComputedStyle(surface).backgroundImage).toBe(initialBackground);
      expect(getComputedStyle(handle).getPropertyValue('--color')).toBe(initialColor);
      expect(changes).not.toHaveBeenCalled();
    }
  );

  it('matches elliptical panel corners in the pointer ghost without changing body height', async () => {
    const dashboard = await createDashboard();
    const panel = dashboard.querySelector('nve-dashboard-panel')!;

    panel.style.setProperty('--border-radius', '12px 8px 20px 4px / 5px 15px 9px 2px');

    const body = panel.shadowRoot!.querySelector<HTMLElement>('.body')!;
    const before = body.getBoundingClientRect();
    const handle = control(panel, 'move');

    vi.spyOn(dashboard, 'setPointerCapture').mockImplementation(() => {});
    handle.dispatchEvent(pointer('pointerdown', 50, 50));
    dashboard.dispatchEvent(pointer('pointermove', 360, 50));
    await elementIsStable(dashboard);
    await elementIsStable(panel);

    const ghost = dashboard.shadowRoot!.querySelector('nve-ghost')!;
    const actual = getComputedStyle(ghost);
    const expected = getComputedStyle(panel.shadowRoot!.querySelector('[internal-host]')!);

    expect(actual.borderTopLeftRadius).toBe(expected.borderTopLeftRadius);
    expect(actual.borderTopRightRadius).toBe(expected.borderTopRightRadius);
    expect(actual.borderBottomRightRadius).toBe(expected.borderBottomRightRadius);
    expect(actual.borderBottomLeftRadius).toBe(expected.borderBottomLeftRadius);
    expect(body.getBoundingClientRect().height).toBe(before.height);
    expect(dashboard.shadowRoot!.querySelector('.canvas')!.hasAttribute('data-arranging')).toBe(true);

    key(handle, 'Escape');
    await elementIsStable(dashboard);

    expect(dashboard.shadowRoot!.querySelector('.canvas')!.hasAttribute('data-arranging')).toBe(false);
  });

  it('commits a command once and leaves no-op commands silent', async () => {
    const dashboard = await createDashboard();
    const listener = vi.fn();

    dashboard.addEventListener('change', listener);

    expect(dashboard.place('a', { column: 2, row: 0, columnSpan: 2, rowSpan: 2 })).toBe(true);

    expect(dashboard.place('a', { column: 2, row: 0, columnSpan: 2, rowSpan: 2 })).toBe(false);
    expect(listener).toHaveBeenCalledOnce();
  });

  it('keeps normalized growth-axis requests unavailable and silent when the complete arrangement is unchanged', async () => {
    const dashboard = await createDashboard();
    const changes = vi.fn();

    dashboard.addEventListener('change', changes);

    const placement = { column: 0, row: 999998, columnSpan: 2, rowSpan: 2 };

    expect(dashboard.isCommandAvailable('--place', { value: 'a', placement })).toBe(false);
    expect(dashboard.place('a', placement)).toBe(false);
    expect(dashboard.value).toBe(initial);
    expect(changes).not.toHaveBeenCalled();
  });

  it('compares pending canonical constraint changes with the committed value when querying commands', async () => {
    const dashboard = await createDashboard();
    const panel = dashboard.querySelector<DashboardPanel>('#a')!;
    const changes = vi.fn();

    dashboard.addEventListener('change', changes);
    panel.minColumnSpan = 3;

    const placement = { column: 0, row: 0, columnSpan: 3, rowSpan: 2 };

    expect(dashboard.isCommandAvailable('--place', { value: 'a', placement })).toBe(true);

    expect(dashboard.place('a', placement)).toBe(true);
    await elementIsStable(dashboard);

    expect(changes).toHaveBeenCalledOnce();
  });

  it.each(['inset', 'flat', 'full'] as const)(
    'propagates %s container framing without changing arrangement',
    async container => {
      const dashboard = await createDashboard();
      const changed = vi.fn();

      dashboard.addEventListener('change', changed);

      const panel = dashboard.querySelector('nve-dashboard-panel')!;
      const radius = getComputedStyle(panel).borderTopLeftRadius;

      dashboard.container = container;
      await elementIsStable(dashboard);

      expect(panel.getAttribute('container')).toBe(container);
      expect(getComputedStyle(panel).borderTopLeftRadius).toBe(container === 'inset' ? radius : '0px');
      expect(getComputedStyle(panel).boxShadow === 'none').toBe(container !== 'inset');
      expect(dashboard.value).toBe(initial);
      expect(changed).not.toHaveBeenCalled();

      dashboard.container = undefined;
      await elementIsStable(dashboard);

      expect(panel.hasAttribute('container')).toBe(false);
    }
  );

  it('commits repeated arrow actions once each and leaves Enter, Escape, Space and focus movement silent', async () => {
    const dashboard = await createDashboard();
    const handle = control(dashboard.querySelector('nve-dashboard-panel')!, 'resize');
    const changed = vi.fn();

    dashboard.addEventListener('change', changed);
    key(handle, 'ArrowDown');
    handle.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', repeat: true, bubbles: true, composed: true, cancelable: true })
    );

    expect(parseDashboardValue(dashboard.value)?.items[0]?.rowSpan).toBe(4);
    expect(changed).toHaveBeenCalledTimes(2);

    key(handle, 'Enter');
    key(handle, 'Escape');
    key(handle, ' ');
    dashboard.querySelector('input')!.focus();

    expect(changed).toHaveBeenCalledTimes(2);
    expect(dashboard.shadowRoot!.querySelector('nve-ghost')).toBeNull();
  });

  it('does not accumulate invalid keyboard steps at a grid boundary', async () => {
    const dashboard = await createDashboard();
    const panel = dashboard.querySelector('nve-dashboard-panel')!;
    const handle = control(panel, 'move');

    key(handle, 'ArrowLeft');
    key(handle, 'ArrowRight');
    key(handle, 'Enter');
    await elementIsStable(dashboard);

    expect(parseDashboardValue(dashboard.value)?.items[0]?.column).toBe(2);
  });

  it('reflects property restrictions without reverting an accepted keyboard placement', async () => {
    const dashboard = await createDashboard();
    const panel = dashboard.querySelector('nve-dashboard-panel')!;
    const handle = control(panel, 'move');

    key(handle, 'ArrowRight');

    const accepted = dashboard.value;

    panel.moveDisabled = true;
    await elementIsStable(panel);
    await elementIsStable(dashboard);

    expect(dashboard.value).toBe(accepted);
    expect(control(panel, 'move').closest<HTMLElement>('.grip')!.inert).toBe(true);
  });

  it('uses only title content for the default panel name and refreshes text changes', async () => {
    const dashboard = await createDashboard();
    const panel = dashboard.querySelector('nve-dashboard-panel')!;

    expect(panel._internals.ariaLabel).toBe('First');

    panel.querySelector('nve-dashboard-panel-header')!.firstChild!.textContent = 'Changed';
    await vi.waitFor(() => expect(panel._internals.ariaLabel).toBe('Changed'));
  });

  it('refreshes the panel name when header decoration changes slots without cancelling a pointer preview', async () => {
    const dashboard = await createDashboard();
    const panel = dashboard.querySelector('nve-dashboard-panel')!;
    const header = panel.querySelector('nve-dashboard-panel-header')!;
    const decoration = document.createElement('span');

    decoration.slot = 'prefix';
    decoration.textContent = ' Badge';
    header.append(decoration);
    await elementIsStable(dashboard);

    expect(panel._internals.ariaLabel).toBe('First');

    const handle = control(panel, 'move');
    const changes = vi.fn();

    dashboard.addEventListener('change', changes);
    vi.spyOn(dashboard, 'setPointerCapture').mockImplementation(() => {});
    handle.dispatchEvent(pointer('pointerdown', 50, 50));
    dashboard.dispatchEvent(pointer('pointermove', 360, 50));
    await elementIsStable(dashboard);

    const canvas = dashboard.shadowRoot!.querySelector('.canvas')!;

    expect(canvas.hasAttribute('data-arranging')).toBe(true);

    decoration.slot = '';
    await vi.waitFor(() => expect(panel._internals.ariaLabel).toBe('First Badge'));

    expect(canvas.hasAttribute('data-arranging')).toBe(true);

    decoration.slot = 'suffix';
    await vi.waitFor(() => expect(panel._internals.ariaLabel).toBe('First'));

    expect(canvas.hasAttribute('data-arranging')).toBe(true);

    const content = document.createElement('span');

    panel.append(content);
    content.textContent = 'Application status';
    content.id = 'application-status';
    content.slot = 'application-status';
    await elementIsStable(dashboard);

    expect(panel._internals.ariaLabel).toBe('First');
    expect(canvas.hasAttribute('data-arranging')).toBe(true);
    expect(dashboard.shadowRoot!.querySelector('nve-ghost')).not.toBeNull();
    expect(dashboard.value).toBe(initial);
    expect(changes).not.toHaveBeenCalled();

    key(handle, 'Escape');
    await elementIsStable(dashboard);

    expect(canvas.hasAttribute('data-arranging')).toBe(false);
    expect(dashboard.value).toBe(initial);
  });

  it('resumes names, measurement and one command commit after repeated reconnection', async () => {
    const dashboard = await createDashboard();

    dashboard.id = 'reconnected-dashboard';

    const parent = dashboard.parentElement!;
    const panel = dashboard.querySelector<DashboardPanel>('#a')!;
    const header = panel.querySelector('nve-dashboard-panel-header')!;
    const input = panel.querySelector('input')!;

    input.value = 'Retained draft';

    const invoker = Object.assign(document.createElement('nve-button'), { value: 'a' });

    invoker.setAttribute('commandfor', dashboard.id);
    invoker.textContent = 'Move panel';
    parent.prepend(invoker);
    await elementIsStable(invoker);

    const changed = vi.fn();

    dashboard.addEventListener('change', event => {
      if (event.target === dashboard) {
        changed();
      }
    });

    for (const [index, command] of ['--move-right', '--move-left'].entries()) {
      const saved = dashboard.value;
      const previousWidth = panel.getBoundingClientRect().width;

      dashboard.remove();
      dashboard.style.width = `${568 - index * 40}px`;
      parent.append(dashboard);
      await elementIsStable(dashboard);

      header.firstChild!.textContent = `Reconnected ${index}`;
      await vi.waitFor(() => expect(panel._internals.ariaLabel).toBe(`Reconnected ${index}`));
      await vi.waitFor(() => expect(panel.getBoundingClientRect().width).toBeLessThan(previousWidth - 10));

      expect(dashboard.value).toBe(saved);
      expect(dashboard.isCommandAvailable(command, { value: 'a' })).toBe(true);

      invoker.setAttribute('command', command);
      await userEvent.click(invoker);
      await elementIsStable(dashboard);

      expect(parseDashboardValue(dashboard.value)?.items.find(item => item.id === 'a')?.column).toBe(
        index === 0 ? 2 : 0
      );
      expect(changed).toHaveBeenCalledTimes(index + 1);
      expect(panel.querySelector('input')).toBe(input);
      expect(input.value).toBe('Retained draft');
    }
  });

  it('keeps a horizontal canvas no wider than its viewport when one panel fits', async () => {
    const dashboard = await createDashboard();

    dashboard.value = JSON.stringify({
      version: 1,
      grid: { flow: 'horizontal', tracks: 4 },
      items: [{ id: 'a', column: 0, row: 0, columnSpan: 1, rowSpan: 1 }]
    });
    dashboard.querySelector('#b')!.remove();
    await elementIsStable(dashboard);

    const viewport = dashboard.shadowRoot!.querySelector<HTMLElement>('.viewport')!;

    await vi.waitFor(() => expect(viewport.scrollWidth).toBe(viewport.clientWidth));
  });

  it('respects an application restore triggered while focusing a pointer handle', async () => {
    const dashboard = await createDashboard();

    dashboard.autoSettle = false;
    await elementIsStable(dashboard);

    const panel = dashboard.querySelector('nve-dashboard-panel')!;
    const handle = control(panel, 'move');
    const restored = JSON.stringify({
      version: 1,
      grid: { flow: 'vertical', tracks: 4 },
      items: [
        { id: 'a', column: 0, row: 3, columnSpan: 2, rowSpan: 2 },
        { id: 'b', column: 2, row: 0, columnSpan: 2, rowSpan: 2 }
      ]
    });

    const change = vi.fn();

    expect(restored).not.toBe(initial);
    dashboard.addEventListener('change', change);
    dashboard.addEventListener(
      'focusin',
      () => {
        dashboard.value = restored;
      },
      { once: true }
    );
    vi.spyOn(dashboard, 'setPointerCapture').mockImplementation(() => {});
    handle.dispatchEvent(pointer('pointerdown', 50, 50));
    dashboard.dispatchEvent(pointer('pointermove', 50, 190));
    dashboard.dispatchEvent(pointer('pointerup', 50, 190));
    await elementIsStable(dashboard);

    expect(dashboard.value).toBe(restored);
    expect(change).not.toHaveBeenCalled();
    expect(dashboard.shadowRoot!.querySelector('nve-ghost')).toBeNull();
  });

  it('consumes the final pointer release sample', async () => {
    const dashboard = await createDashboard();
    const panel = dashboard.querySelector('nve-dashboard-panel')!;
    const handle = control(panel, 'move');

    vi.spyOn(dashboard, 'setPointerCapture').mockImplementation(() => {});
    handle.dispatchEvent(pointer('pointerdown', 50, 50));
    dashboard.dispatchEvent(pointer('pointermove', 190, 50));
    dashboard.dispatchEvent(pointer('pointerup', 360, 50));

    expect(parseDashboardValue(dashboard.value)?.items[0]?.column).toBe(2);
  });

  it('keeps clicks idle after a canceled pointer gesture', async () => {
    const dashboard = await createDashboard();
    const panel = dashboard.querySelector('nve-dashboard-panel')!;
    const handle = control(panel, 'move');

    vi.spyOn(dashboard, 'setPointerCapture').mockImplementation(() => {});
    handle.dispatchEvent(pointer('pointerdown', 50, 50));
    dashboard.dispatchEvent(pointer('pointermove', 50, 190));
    dashboard.dispatchEvent(pointer('pointercancel', 50, 190));
    handle.click();
    await elementIsStable(dashboard);
    await elementIsStable(panel);

    expect(dashboard.shadowRoot!.querySelector('nve-ghost')).toBeNull();
    expect(dashboard.value).toBe(initial);
  });

  it('places a re-added panel in free cells without moving existing occupants', async () => {
    const dashboard = await createDashboard();
    const first = dashboard.querySelector('nve-dashboard-panel')!;

    first.remove();
    await elementIsStable(dashboard);

    dashboard.place('b', { column: 0, row: 0, columnSpan: 2, rowSpan: 2 });
    dashboard.prepend(first);
    await elementIsStable(dashboard);

    expect(parseDashboardValue(dashboard.value)?.items.find(item => item.id === 'b')?.column).toBe(0);
    expect(parseDashboardValue(dashboard.value)?.items.find(item => item.id === 'a')?.column).toBe(2);
  });

  it('rejects incompatible track changes without mutating a committed placement', async () => {
    const dashboard = await createDashboard();
    const panel = dashboard.querySelector('nve-dashboard-panel')!;

    panel.minColumnSpan = 2;
    await elementIsStable(panel);
    await elementIsStable(dashboard);

    const handle = control(panel, 'move');

    key(handle, 'ArrowRight');

    const before = dashboard.value;

    expect(() => {
      dashboard.tracks = 1;
    }).toThrow(RangeError);
    expect(dashboard.value).toBe(before);

    key(handle, 'Enter');

    expect(parseDashboardValue(dashboard.value)?.items[0]?.column).toBe(2);
  });

  it('rejects a flow change that cannot fit current minimum row spans', async () => {
    const dashboard = await createDashboard();

    dashboard.querySelector('nve-dashboard-panel')!.minRowSpan = 5;
    await elementIsStable(dashboard.querySelector('nve-dashboard-panel')!);
    await elementIsStable(dashboard);

    const before = dashboard.value;

    expect(() => {
      dashboard.flow = 'horizontal';
    }).toThrow(RangeError);
    expect(dashboard.value).toBe(before);
    expect(dashboard.flow).toBe('vertical');
  });

  it('allocates resize chrome outside authored footer and body hit targets', async () => {
    const dashboard = await createDashboard();
    const panel = dashboard.querySelector('nve-dashboard-panel')!;

    await vi.waitFor(() =>
      expect(control(panel, 'resize').getBoundingClientRect().right).toBeCloseTo(
        panel.getBoundingClientRect().right - 1,
        0
      )
    );

    dashboard.dir = 'rtl';
    await elementIsStable(dashboard);

    expect(control(panel, 'resize').getBoundingClientRect().left).toBeCloseTo(
      panel.getBoundingClientRect().left + 1,
      0
    );

    dashboard.dir = 'ltr';
    await elementIsStable(dashboard);

    const footer = globalThis.document.createElement('nve-dashboard-panel-footer');
    const button = globalThis.document.createElement('button');

    button.textContent = 'Save';
    button.style.marginInlineStart = 'auto';
    footer.append(button);
    panel.append(footer);
    await elementIsStable(footer);
    await elementIsStable(panel);
    await elementIsStable(dashboard);

    const buttonBox = button.getBoundingClientRect();
    const resizeBox = control(panel, 'resize').getBoundingClientRect();

    expect(resizeBox.right).toBeCloseTo(panel.getBoundingClientRect().right - 1, 0);
    expect(buttonBox.right).toBeLessThanOrEqual(resizeBox.left);

    dashboard.dir = 'rtl';
    await elementIsStable(dashboard);

    const rtlResize = control(panel, 'resize').getBoundingClientRect();

    expect(rtlResize.left).toBeCloseTo(panel.getBoundingClientRect().left + 1, 0);

    expect(panel.shadowRoot!.querySelector('.body')!.getBoundingClientRect().bottom).toBeLessThanOrEqual(resizeBox.top);
  });

  it('announces one canonical reconciliation when panel span constraints change', async () => {
    const dashboard = await createDashboard();
    const changed = vi.fn();

    dashboard.addEventListener('change', changed);

    const panel = dashboard.querySelector('nve-dashboard-panel')!;

    panel.minColumnSpan = 3;
    await elementIsStable(panel);
    await elementIsStable(dashboard);
    await vi.waitFor(() => expect(changed).toHaveBeenCalledOnce());

    expect(parseDashboardValue(dashboard.value)?.items[0]?.columnSpan).toBe(3);

    await elementIsStable(dashboard);

    expect(changed).toHaveBeenCalledOnce();
  });

  it.each(['accepted', 'blocked'] as const)(
    'reveals the focused control for %s keyboard intent without repeating during rendering',
    async intent => {
      const dashboard = await createDashboard();
      const panel = dashboard.querySelector('nve-dashboard-panel')!;

      panel.minRowSpan = 2;
      await elementIsStable(panel);
      await elementIsStable(dashboard);

      const handle = control(dashboard.querySelector('nve-dashboard-panel')!, 'resize');

      handle.focus();

      const viewport = dashboard.shadowRoot!.querySelector<HTMLElement>('.viewport')!;
      const scroll = vi.spyOn(viewport, 'scrollBy').mockImplementation(() => {});
      const changes = vi.fn();

      dashboard.addEventListener('change', changes);
      key(handle, intent === 'accepted' ? 'ArrowDown' : 'ArrowUp');

      expect(changes).toHaveBeenCalledTimes(intent === 'accepted' ? 1 : 0);

      await elementIsStable(dashboard);

      expect(scroll).toHaveBeenCalledOnce();

      dashboard.requestUpdate();
      await elementIsStable(dashboard);

      expect(scroll).toHaveBeenCalledOnce();
    }
  );

  it.each(['focus', 'restore', 'pointer', 'disconnect'] as const)(
    'preserves synchronous application %s authority before keyboard reveal',
    async authority => {
      const dashboard = await createDashboard();
      const handle = control(dashboard.querySelector('nve-dashboard-panel')!, 'resize');

      handle.focus();

      const viewport = dashboard.shadowRoot!.querySelector<HTMLElement>('.viewport')!;
      const scroll = vi.spyOn(viewport, 'scrollBy').mockImplementation(() => {});

      vi.spyOn(dashboard, 'setPointerCapture').mockImplementation(() => {});
      dashboard.addEventListener(
        'change',
        () => {
          if (authority === 'focus') {
            dashboard.querySelector('input')!.focus();
          }

          if (authority === 'restore') {
            dashboard.value = initial;
          }

          if (authority === 'pointer') {
            handle.dispatchEvent(pointer('pointerdown', 50, 50));
          }

          if (authority === 'disconnect') {
            dashboard.remove();
          }
        },
        { once: true }
      );
      key(handle, 'ArrowDown');
      await elementIsStable(dashboard);

      expect(scroll).not.toHaveBeenCalled();
    }
  );

  it('announces changed command availability on silent restoration without notification loops', async () => {
    const dashboard = await createDashboard();
    const context = { value: 'a', placement: { column: 0, row: 0, columnSpan: 2, rowSpan: 2 } };

    expect(dashboard.isCommandAvailable('--place', context)).toBe(false);

    const availability = vi.fn();
    const changed = vi.fn();

    dashboard.addEventListener('commandavailabilitychange', availability);
    dashboard.addEventListener('change', changed);

    const restored = parseDashboardValue(initial)!;

    dashboard.value = JSON.stringify({
      ...restored,
      items: restored.items.map(item => ({ ...item, column: item.id === 'a' ? 2 : 0 }))
    });
    await elementIsStable(dashboard);

    expect(dashboard.isCommandAvailable('--place', context)).toBe(true);
    expect(availability).toHaveBeenCalledOnce();
    expect(changed).not.toHaveBeenCalled();

    dashboard.value = dashboard.value;
    await elementIsStable(dashboard);

    expect(availability).toHaveBeenCalledOnce();
  });

  it('keeps a plain pointer tap idle with no preview or arrangement change', async () => {
    const dashboard = await createDashboard();
    const panel = dashboard.querySelector('nve-dashboard-panel')!;
    const handle = control(panel, 'resize');
    const changed = vi.fn();

    dashboard.addEventListener('change', changed);
    vi.spyOn(dashboard, 'setPointerCapture').mockImplementation(() => {});
    handle.dispatchEvent(pointer('pointerdown', 50, 50));
    await elementIsStable(dashboard);

    expect(dashboard.shadowRoot!.querySelector('nve-ghost')).toBeNull();

    dashboard.dispatchEvent(pointer('pointerup', 50, 50));
    handle.click();
    await elementIsStable(dashboard);
    await elementIsStable(panel);

    expect(dashboard.value).toBe(initial);
    expect(changed).not.toHaveBeenCalled();
    expect(dashboard.shadowRoot!.querySelector('nve-ghost')).toBeNull();
    expect(dashboard.shadowRoot!.querySelector('.canvas')!.hasAttribute('data-arranging')).toBe(false);
    expect(panel.shadowRoot!.activeElement).toBe(handle);
  });

  it('rejects a stale preview when another panel needs constraint reconciliation before release', async () => {
    const dashboard = await createDashboard();
    const panel = dashboard.querySelector('nve-dashboard-panel')!;
    const other = dashboard.querySelectorAll('nve-dashboard-panel')[1]!;
    const handle = control(panel, 'move');

    vi.spyOn(dashboard, 'setPointerCapture').mockImplementation(() => {});
    handle.dispatchEvent(pointer('pointerdown', 50, 50));
    dashboard.dispatchEvent(pointer('pointermove', 50, 190));
    await elementIsStable(dashboard);

    other.minColumnSpan = 3;
    dashboard.dispatchEvent(pointer('pointerup', 50, 190));

    expect(parseDashboardValue(dashboard.value)?.items[0]?.row).toBe(0);

    await elementIsStable(other);
    await elementIsStable(dashboard);

    expect(parseDashboardValue(dashboard.value)?.items[0]?.row).toBe(0);
    expect(parseDashboardValue(dashboard.value)?.items[1]?.columnSpan).toBe(3);
  });

  it('does not commit fresh geometry that differs from the displayed preview after a membership change', async () => {
    const dashboard = await createDashboard();
    const panel = dashboard.querySelector('nve-dashboard-panel')!;
    const other = dashboard.querySelectorAll('nve-dashboard-panel')[1]!;
    const handle = control(panel, 'move');

    vi.spyOn(dashboard, 'setPointerCapture').mockImplementation(() => {});
    handle.dispatchEvent(pointer('pointerdown', 50, 50));
    dashboard.dispatchEvent(pointer('pointermove', 360, 50));
    await elementIsStable(dashboard);

    other.hidden = true;
    dashboard.dispatchEvent(pointer('pointerup', 360, 50));

    expect(dashboard.value).toBe(initial);
  });
});
