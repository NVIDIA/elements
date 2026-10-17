// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import type { Workspace } from './workspace.js';
import './define.js';

const value = JSON.stringify({
  version: 1,
  closed: [],
  root: {
    type: 'split',
    axis: 'horizontal',
    weights: [1, 1],
    children: ['a', 'b'].map(id => ({ type: 'pane', panels: [id], active: id }))
  }
});

describe('workspace attached and detached dragging', () => {
  let fixture: HTMLElement;

  afterEach(() => {
    removeFixture(fixture);
    vi.restoreAllMocks();
  });

  async function setup() {
    fixture = await createFixture(html`
      <nve-workspace rearrangeable .value=${value} style="width:600px;height:220px">
        <nve-workspace-panel id="a">
          <span slot="label">Alpha</span>
          <input value="retained" />
        </nve-workspace-panel>
        <nve-workspace-panel id="b"> <span slot="label">Beta</span>Beta</nve-workspace-panel>
      </nve-workspace>
    `);
    const workspace = fixture.querySelector<Workspace>('nve-workspace')!;
    await elementIsStable(workspace);
    vi.spyOn(workspace, 'setPointerCapture').mockImplementation(() => {});
    return workspace;
  }

  async function setupGrouped() {
    const workspace = await setup();
    const companion = document.createElement('nve-workspace-panel');
    companion.id = 'companion';
    companion.textContent = 'Companion';
    workspace.append(companion);
    workspace.value = JSON.stringify({
      version: 1,
      closed: [],
      root: {
        type: 'split',
        axis: 'horizontal',
        weights: [1, 1],
        children: [
          { type: 'pane', panels: ['a', 'companion'], active: 'a' },
          { type: 'pane', panels: ['b'], active: 'b' }
        ]
      }
    });
    await elementIsStable(workspace);
    return workspace;
  }

  function press(workspace: Workspace, selector = '[data-panel="a"]') {
    const control = workspace.shadowRoot!.querySelector<HTMLElement>(selector)!;
    const rect = control.getBoundingClientRect();
    const origin = { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
    control.dispatchEvent(pointer('pointerdown', origin.x, origin.y));
    return (type: string, x: number, y = 0) => workspace.dispatchEvent(pointer(type, origin.x + x, origin.y + y));
  }

  function phase(workspace: Workspace) {
    return workspace.shadowRoot!.querySelector('[data-destination-ghost]')?.getAttribute('data-drag-phase');
  }

  describe('threshold and attachment', () => {
    it('captures the threshold at press and latches detachment after radial crossing', async () => {
      const workspace = await setup();
      const saved = workspace.value;
      expect(workspace.detachThreshold).toBe(48);
      workspace.setAttribute('detach-threshold', '80');
      await elementIsStable(workspace);
      expect(workspace.detachThreshold).toBe(80);
      const move = press(workspace);
      workspace.detachThreshold = 0;
      move('pointermove', 60);
      await elementIsStable(workspace);
      expect(phase(workspace)).toBe('attached');
      move('pointermove', 60, 60);
      await vi.waitFor(() => expect(phase(workspace)).toBe('detached'));
      move('pointermove', 10);
      await elementIsStable(workspace);
      expect(phase(workspace)).toBe('detached');
      workspace.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await vi.waitFor(() => expect(phase(workspace)).toBeUndefined());
      expect(workspace.value).toBe(saved);
    });

    it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])(
      'keeps click tolerance and validates the captured threshold for %s',
      async threshold => {
        const workspace = await setup();
        const saved = workspace.value;
        workspace.detachThreshold = threshold;
        await elementIsStable(workspace);
        const move = press(workspace);
        move('pointermove', 2, 2);
        await elementIsStable(workspace);
        expect(phase(workspace)).toBeUndefined();
        move('pointermove', 10);
        await elementIsStable(workspace);
        expect(phase(workspace)).toBe(threshold === 0 ? 'detached' : 'attached');
        move('pointercancel', 10);
        await vi.waitFor(() => expect(phase(workspace)).toBeUndefined());
        expect(workspace.value).toBe(saved);
      }
    );

    it.each(['[data-panel="a"]', '[data-drag-group="a"]'])(
      'retains original geometry and releases silently while attached through %s',
      async selector => {
        const grouped = selector.includes('drag-group');
        const workspace = grouped ? await setupGrouped() : await setup();
        const saved = workspace.value;
        const before = [...workspace.querySelectorAll('nve-workspace-panel')].map(panel => panel.getAttribute('style'));
        const input = workspace.querySelector('input')!;
        const change = vi.fn();
        workspace.addEventListener('workspacechange', change);
        const move = press(workspace, selector);
        move('pointermove', 33, 33);
        await elementIsStable(workspace);
        expect(phase(workspace)).toBe('attached');
        expect(
          [...workspace.querySelectorAll('nve-workspace-panel')].map(panel => panel.getAttribute('style'))
        ).toEqual(before);
        expect(workspace.shadowRoot!.querySelectorAll('[role="tab"]')).toHaveLength(grouped ? 3 : 2);
        expect(getComputedStyle(workspace.querySelector('#a')!).display).toBe('none');
        move('pointerup', 33, 33);
        await elementIsStable(workspace);
        expect(phase(workspace)).toBeUndefined();
        expect(workspace.value).toBe(saved);
        expect(change).not.toHaveBeenCalled();
        expect(workspace.querySelector('input')).toBe(input);
        expect(getComputedStyle(workspace.querySelector('#a')!).display).not.toBe('none');
      }
    );
  });

  describe('detachment and return', () => {
    it.each([
      { active: 'a', group: false },
      { active: 'companion', group: false },
      { active: 'a', group: true },
      { active: 'companion', group: true }
    ])(
      'presents surviving content across detachment with active $active and group $group',
      async ({ active, group }) => {
        const workspace = await setupGrouped();
        workspace.shadowRoot!.querySelector<HTMLElement>(`[data-panel="${active}"]`)!.click();
        await elementIsStable(workspace);
        const saved = workspace.value;
        const a = workspace.querySelector<HTMLElement>('#a')!;
        const companion = workspace.querySelector<HTMLElement>('#companion')!;
        const input = workspace.querySelector('input')!;
        const strip = workspace.shadowRoot!.querySelector<HTMLElement>('.tabs')!.getAttribute('style');
        const change = vi.fn();
        workspace.addEventListener('workspacechange', change);
        const move = press(workspace, group ? '[data-drag-group="a"]' : '[data-panel="companion"]');

        function expectPresentation() {
          if (group) {
            expect(getComputedStyle(a).display).toBe('none');
          } else {
            expect(getComputedStyle(a).display).not.toBe('none');
            expect(a.shadowRoot!.querySelector<HTMLElement>('.content')!.hidden).toBe(false);
            expect(a.getAttribute('aria-hidden')).toBe('false');
            expect(workspace.shadowRoot!.querySelector('[data-panel="a"]')!.getAttribute('aria-selected')).toBe('true');
          }
          expect(getComputedStyle(companion).display).toBe('none');
          expect(workspace.value).toBe(saved);
          expect(change).not.toHaveBeenCalled();
          expect(workspace.querySelector('input')).toBe(input);
          expect(a.parentElement).toBe(workspace);
        }
        move('pointermove', 20, 16);
        await elementIsStable(workspace);
        expect(phase(workspace)).toBe('attached');
        expect(workspace.shadowRoot!.querySelector('.tabs')!.getAttribute('style')).toBe(strip);
        expectPresentation();
        move('pointermove', 49, 0);
        await elementIsStable(workspace);
        expect(phase(workspace)).toBe('detached');
        expectPresentation();
        move('pointermove', 120, 90);
        await elementIsStable(workspace);
        expectPresentation();
        workspace.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        await vi.waitFor(() => expect(phase(workspace)).toBeUndefined());
        expect(workspace.value).toBe(saved);
        expect(change).not.toHaveBeenCalled();
        expect(a.shadowRoot!.querySelector<HTMLElement>('.content')!.hidden).toBe(active !== 'a');
        expect(companion.shadowRoot!.querySelector<HTMLElement>('.content')!.hidden).toBe(active !== 'companion');
        expect(workspace.querySelector('input')).toBe(input);
      }
    );

    it.each(['a', 'b', 'c'])('keeps the genuine initial %s pane reservation and silent original drop', async source => {
      const workspace = await setup();
      const third = document.createElement('nve-workspace-panel');
      third.id = 'c';
      third.textContent = 'Gamma';
      workspace.append(third);
      workspace.value = JSON.stringify({
        version: 1,
        closed: [],
        root: {
          type: 'split',
          axis: 'horizontal',
          weights: [1, 1, 1],
          children: ['a', 'b', 'c'].map(id => ({ type: 'pane', panels: [id], active: id }))
        }
      });
      await elementIsStable(workspace);
      const saved = workspace.value;
      const change = vi.fn();
      workspace.addEventListener('workspacechange', change);
      const before = workspace.querySelector(`#${source}`)!.getBoundingClientRect();
      const move = press(workspace, `[data-panel="${source}"]`);
      move('pointermove', 0, 60);
      await vi.waitFor(() => expect(phase(workspace)).toBe('detached'));
      await elementIsStable(workspace);
      const ghost = workspace.shadowRoot!.querySelector<HTMLElement>('[data-destination-ghost]')!;
      expect(ghost.hasAttribute('data-reserved-placement')).toBe(true);
      expect(ghost.getBoundingClientRect().width).toBeCloseTo(before.width, 1);
      expect(workspace.shadowRoot!.querySelectorAll('[data-seam-badge="insert"]')).toHaveLength(source === 'b' ? 2 : 1);
      move('pointerup', 0, 60);
      await elementIsStable(workspace);
      expect(workspace.value).toBe(saved);
      expect(change).not.toHaveBeenCalled();
    });

    it('preserves the content inset and normal label across computed-target detachment', async () => {
      const workspace = await setup();
      const panel = workspace.querySelector<HTMLElement>('#b')!;
      const content = panel.shadowRoot!.querySelector<HTMLElement>('.content')!;
      const label = panel.shadowRoot!.querySelector<HTMLElement>('.label-viewport')!;
      const inset = getComputedStyle(content).top;
      const saved = workspace.value;
      expect(parseFloat(inset)).toBeGreaterThan(0);
      expect(label.hidden).toBe(false);
      const move = press(workspace);
      move('pointermove', 80, 80);
      await vi.waitFor(() => expect(phase(workspace)).toBe('detached'));
      await elementIsStable(workspace);
      expect(label.hidden).toBe(false);
      expect(getComputedStyle(content).top).toBe(inset);
      expect(content.getBoundingClientRect().y - panel.getBoundingClientRect().y).toBeCloseTo(parseFloat(inset), 1);
      move('pointercancel', 80, 80);
      await vi.waitFor(() => expect(phase(workspace)).toBeUndefined());
      expect(label.hidden).toBe(false);
      expect(getComputedStyle(content).top).toBe(inset);
      expect(workspace.value).toBe(saved);
    });
  });

  describe('cancellation', () => {
    it('cancels the computed-target candidate when the viewport changes', async () => {
      const workspace = await setup();
      const saved = workspace.value;
      const move = press(workspace);
      move('pointermove', 80, 80);
      await vi.waitFor(() => expect(phase(workspace)).toBe('detached'));
      workspace.style.width = '500px';
      await vi.waitFor(() => expect(phase(workspace)).toBeUndefined());
      expect(workspace.value).toBe(saved);
    });

    it.each(['pointer', 'keyboard'])(
      'lets fresh %s input supersede cosmetic cancellation without restoring old focus',
      async input => {
        const workspace = await setup();
        const saved = workspace.value;
        const changed = vi.fn();
        workspace.addEventListener('workspacechange', changed);
        const move = press(workspace);
        move('pointermove', 0, 60);
        await vi.waitFor(() => expect(phase(workspace)).toBe('detached'));
        workspace.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        move('pointerup', 0, 60);
        await workspace.updateComplete;
        expect(phase(workspace)).toBe('returning-detached');
        const other = workspace.shadowRoot!.querySelector<HTMLElement>('[data-panel="b"]')!;
        other.focus();
        if (input === 'pointer') {
          const next = press(workspace, '[data-panel="b"]');
          next('pointermove', 0, 60);
          await vi.waitFor(() => expect(phase(workspace)).toBe('detached'));
          await new Promise(resolve => setTimeout(resolve, 140));
          expect(phase(workspace)).toBe('detached');
          next('pointercancel', 0, 60);
        } else {
          other.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, composed: true }));
          await new Promise(resolve => setTimeout(resolve, 140));
          expect(phase(workspace)).toBeUndefined();
          expect(workspace.shadowRoot!.activeElement).toBe(other);
        }
        expect(workspace.value).toBe(saved);
        expect(changed).not.toHaveBeenCalled();
      }
    );
  });

  describe('pane grips', () => {
    it('omits a singleton grip while retaining the grouped pane grip', async () => {
      const workspace = await setupGrouped();
      const tabs = (id: string) =>
        workspace.shadowRoot!.querySelector<HTMLElement>(`[data-panel="${id}"]`)!.closest('.tabs')!;
      const singleton = tabs('b');
      expect(singleton.querySelector('[data-drag-group]')).toBeNull();
      expect(workspace.shadowRoot!.querySelector('[data-panel="b"]')!.getBoundingClientRect().left).toBe(
        workspace.querySelector('#b')!.getBoundingClientRect().left
      );
      expect(tabs('a').querySelector('[data-drag-group]')).not.toBeNull();
    });

    it('retains the grouped pane grip when its companion is closed', async () => {
      const workspace = await setupGrouped();
      workspace.value = JSON.stringify({ ...JSON.parse(workspace.value), closed: ['companion'] });
      await elementIsStable(workspace);
      const tabs = workspace.shadowRoot!.querySelector('[data-panel="a"]')!.closest('.tabs')!;
      expect(tabs.querySelector('[data-drag-group]')).not.toBeNull();
    });

    it('preserves committed pane grips while previewing a tab join', async () => {
      const workspace = await setupGrouped();
      const source = workspace.shadowRoot!.querySelector('[data-panel="companion"]')!.getBoundingClientRect();
      const target = workspace.shadowRoot!.querySelector('[data-panel="b"]')!.getBoundingClientRect();
      const move = press(workspace, '[data-panel="companion"]');
      move('pointermove', target.x + target.width / 2 - source.x - source.width / 2, target.y - source.y);
      await elementIsStable(workspace);
      expect(
        workspace.shadowRoot!.querySelector('[data-destination-ghost]')!.getAttribute('data-destination-kind')
      ).toBe('tab');
      const sourceTabs = workspace.shadowRoot!.querySelector('[data-panel="a"]')!.closest('.tabs')!;
      const targetTabs = workspace.shadowRoot!.querySelector('[data-panel="b"]')!.closest('.tabs')!;
      expect(targetTabs.querySelector('[data-drag-group]')).toBeNull();
      expect(sourceTabs.querySelector('[data-drag-group]')).not.toBeNull();
      workspace.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await elementIsStable(workspace);
    });
  });

  describe('animation', () => {
    it('animates tab controls only during rearrangement, leaving direct layout changes immediate', async () => {
      const workspace = await setup();
      const control = workspace.shadowRoot!.querySelector<HTMLElement>('[data-panel="a"]')!;
      expect(getComputedStyle(control).transitionDuration).toBe('0s');
      const width = control.closest('.tabs')!.getBoundingClientRect().width;
      workspace.style.width = '700px';
      await vi.waitFor(() => expect(control.closest('.tabs')!.getBoundingClientRect().width).toBeGreaterThan(width));
      await elementIsStable(workspace);
      expect(getComputedStyle(control).transitionDuration).toBe('0s');
      const move = press(workspace);
      move('pointermove', 10);
      await elementIsStable(workspace);
      expect(workspace.shadowRoot!.querySelector('[internal-host]')!.hasAttribute('data-rearranging')).toBe(true);
      move('pointerup', 0);
      await elementIsStable(workspace);
      expect(getComputedStyle(control).transitionDuration).toBe('0s');
    });

    it('coordinates a workspace duration override through projected labels without changing saved state', async () => {
      const workspace = await setup();
      const changed = vi.fn();
      workspace.addEventListener('workspacechange', changed);
      const initial = workspace.value;
      const move = press(workspace);
      move('pointermove', 10);
      await elementIsStable(workspace);
      const root = workspace.shadowRoot!;
      const moving = [
        root.querySelector('.tabs')!,
        root.querySelector('[role="tab"]')!,
        root.querySelector('.tab-actions')!,
        root.querySelector('[data-destination-ghost]')!,
        workspace.querySelector('#b')!,
        workspace.querySelector('#b')!.shadowRoot!.querySelector('.label')!
      ];
      for (const [duration, expected] of [
        ['240ms', '0.24s'],
        ['0ms', '0s']
      ] as const) {
        workspace.style.setProperty('--animation-duration', duration);
        for (const element of moving)
          for (const actual of getComputedStyle(element).transitionDuration.split(','))
            expect(actual.trim()).toBe(expected);
      }
      move('pointerup', 0);
      await elementIsStable(workspace);
      expect(workspace.value).toBe(initial);
      expect(changed).not.toHaveBeenCalled();
    });
  });
});

function pointer(type: string, clientX: number, clientY: number) {
  return new PointerEvent(type, {
    clientX,
    clientY,
    pointerId: 5,
    isPrimary: true,
    button: 0,
    buttons: type === 'pointerup' ? 0 : 1,
    bubbles: true,
    composed: true,
    cancelable: true
  });
}
