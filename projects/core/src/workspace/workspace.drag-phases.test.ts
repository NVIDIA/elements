// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { getActiveElement } from '@nvidia-elements/core/internal';
import type { Workspace } from './workspace.js';
import './define.js';

const value = JSON.stringify({
  version: 1,
  closed: [],
  root: {
    type: 'split',
    axis: 'horizontal',
    weights: [1, 1],
    children: ['a', 'b'].map(id => ({ type: 'group', panels: [id], active: id }))
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
      <nve-workspace groupable rearrangeable .value=${value} style="width:600px;height:220px">
        <nve-workspace-panel id="a">
          <nve-workspace-panel-header>Alpha</nve-workspace-panel-header>
          <input value="retained" />
        </nve-workspace-panel>
        <nve-workspace-panel id="b"> <nve-workspace-panel-header>Beta</nve-workspace-panel-header>Beta</nve-workspace-panel>
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
          { type: 'group', panels: ['a', 'companion'], active: 'a' },
          { type: 'group', panels: ['b'], active: 'b' }
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
    it('keeps sibling close controls outside drag ownership', async () => {
      const workspace = await setupGrouped();
      workspace.closable = true;
      await elementIsStable(workspace);
      const saved = workspace.value;
      const move = press(workspace, '[data-close="companion"]');
      move('pointermove', 100, 100);
      await elementIsStable(workspace);
      expect(phase(workspace)).toBeUndefined();
      move('pointerup', 100, 100);
      expect(workspace.value).toBe(saved);
    });

    it.each(['data-panel', 'data-drag-group'])(
      'leaves application controls with %s outside drag ownership',
      async attribute => {
        const workspace = await setup();
        const saved = workspace.value;
        const button = document.createElement('button');
        button.setAttribute(attribute, 'a');
        button.textContent = 'Application action';
        workspace.querySelector('#a')!.append(button);
        await elementIsStable(workspace);
        const rect = button.getBoundingClientRect();
        button.dispatchEvent(pointer('pointerdown', rect.x, rect.y));
        workspace.dispatchEvent(pointer('pointerup', rect.x, rect.y));
        const click = new MouseEvent('click', { bubbles: true, composed: true, cancelable: true, detail: 1 });
        button.dispatchEvent(click);
        await elementIsStable(workspace);
        expect(click.defaultPrevented).toBe(false);
        expect(phase(workspace)).toBeUndefined();
        expect(workspace.value).toBe(saved);
      }
    );

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

    it('captures grouping and rearrangement permission at press through drop', async () => {
      const workspace = await setupGrouped();
      workspace.detachThreshold = 0;
      const initial = workspace.value;
      const move = press(workspace);
      workspace.groupable = false;
      workspace.rearrangeable = false;
      await elementIsStable(workspace);
      expect(workspace.shadowRoot!.querySelector('[data-drag-group="a"]')).not.toBeNull();
      const target = workspace.shadowRoot!.querySelector<HTMLElement>('[data-panel="b"]')!.getBoundingClientRect();
      const origin = workspace.shadowRoot!.querySelector<HTMLElement>('[data-panel="a"]')!.getBoundingClientRect();
      move('pointermove', target.x - origin.x, target.y - origin.y);
      await vi.waitFor(() => expect(phase(workspace)).toBe('detached'));
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
      move('pointerup', target.x - origin.x, target.y - origin.y);
      await elementIsStable(workspace);
      expect(workspace.value).not.toBe(initial);
      expect(
        workspace.isCommandAvailable('--place', { value: 'a', placement: { operation: 'join', target: 'b' } })
      ).toBe(false);
      const next = press(workspace);
      next('pointermove', 100, 100);
      await elementIsStable(workspace);
      expect(phase(workspace)).toBeUndefined();
    });

    it('leaves tab dragging unclaimed while preserving selection without grouping permission', async () => {
      const workspace = await setupGrouped();
      workspace.groupable = false;
      workspace.detachThreshold = 0;
      await elementIsStable(workspace);
      const initial = workspace.value;
      const inputs = vi.fn();
      workspace.addEventListener('nve-gesture-input', inputs);
      const tab = workspace.shadowRoot!.querySelector<HTMLElement>('[data-panel="companion"]')!;
      const rect = tab.getBoundingClientRect();
      const down = pointer('pointerdown', rect.x + 10, rect.y + 10);
      const move = pointer('pointermove', rect.x + 100, rect.y + 100);
      tab.dispatchEvent(down);
      workspace.dispatchEvent(move);
      workspace.dispatchEvent(pointer('pointerup', rect.x + 100, rect.y + 100));
      await elementIsStable(workspace);
      expect(inputs).not.toHaveBeenCalled();
      expect(workspace.setPointerCapture).not.toHaveBeenCalled();
      expect(down.defaultPrevented).toBe(false);
      expect(move.defaultPrevented).toBe(false);
      expect(getComputedStyle(tab).cursor).not.toBe('grab');
      expect(phase(workspace)).toBeUndefined();
      expect(workspace.value).toBe(initial);
      tab.click();
      await elementIsStable(workspace);
      expect(JSON.parse(workspace.value).root.children[0].active).toBe('companion');
    });

    it('retains a feasible group placement over an unavailable join header using captured permission', async () => {
      const workspace = await setupGrouped();
      workspace.groupable = false;
      workspace.detachThreshold = 0;
      await elementIsStable(workspace);
      const grip = workspace.shadowRoot!.querySelector<HTMLElement>('[data-drag-group="a"]')!;
      expect(getComputedStyle(grip).getPropertyValue('--cursor').trim()).toBe('grab');
      const move = press(workspace, '[data-drag-group="a"]');
      workspace.groupable = true;
      await elementIsStable(workspace);
      move('pointermove', 80, 100);
      await vi.waitFor(() => expect(phase(workspace)).toBe('detached'));
      await elementIsStable(workspace);
      const ghost = workspace.shadowRoot!.querySelector('[data-destination-ghost]')!;
      const retained = ghost.getAttribute('style');
      const header = workspace.shadowRoot!.querySelector<HTMLElement>('[data-panel="b"]')!.getBoundingClientRect();
      const x = header.x + header.width / 2;
      const y = header.y + header.height / 2;
      workspace.dispatchEvent(pointer('pointermove', x, y));
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
      await elementIsStable(workspace);
      expect(ghost.getAttribute('style')).toBe(retained);
      expect(ghost.getAttribute('data-destination-kind')).not.toBe('tab');
      expect(ghost.hasAttribute('data-drop-blocked')).toBe(false);
      expect(workspace.style.cursor).toBe('grabbing');
      workspace.dispatchEvent(pointer('pointerup', x, y));
      await elementIsStable(workspace);
      const result = JSON.parse(workspace.value);
      expect(result.root.type).toBe('split');
      expect(result.root.children.map((child: { panels: string[] }) => child.panels).sort()).toEqual([
        ['a', 'companion'],
        ['b']
      ]);
    });

    it('marks an infeasible split as blocked when panel minimums cannot fit', async () => {
      const workspace = await setupGrouped();
      workspace.detachThreshold = 0;
      workspace.querySelector('#a')!.setAttribute('min-height', '150');
      workspace.querySelector('#b')!.setAttribute('min-height', '150');
      await elementIsStable(workspace);
      const initial = workspace.value;
      press(workspace);
      const target = workspace.querySelector('#b')!.getBoundingClientRect();
      const x = target.x + target.width / 2;
      const y = target.bottom - 30;
      workspace.dispatchEvent(pointer('pointermove', x, y));
      await vi.waitFor(() => expect(phase(workspace)).toBe('detached'));
      await elementIsStable(workspace);
      expect(workspace.shadowRoot!.querySelector('[data-destination-ghost]')!.hasAttribute('data-drop-blocked')).toBe(
        true
      );
      expect(workspace.style.cursor).toBe('no-drop');
      workspace.dispatchEvent(pointer('pointerup', x, y));
      await vi.waitFor(() => expect(phase(workspace)).toBeUndefined());
      expect(workspace.value).toBe(initial);
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
        expect(workspace.shadowRoot!.querySelectorAll('[data-panel]')).toHaveLength(grouped ? 3 : 2);
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
        const strip = workspace.shadowRoot!.querySelector<HTMLElement>('.group-chrome')!.getAttribute('style');
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
            expect(workspace.shadowRoot!.querySelector('[data-panel="a"]')!.hasAttribute('selected')).toBe(true);
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
        expect(workspace.shadowRoot!.querySelector('.group-chrome')!.getAttribute('style')).toBe(strip);
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

    it.each(['a', 'b', 'c'])(
      'keeps the genuine initial %s group reservation and silent original drop',
      async source => {
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
            children: ['a', 'b', 'c'].map(id => ({ type: 'group', panels: [id], active: id }))
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
        expect(workspace.shadowRoot!.querySelectorAll('[data-seam-badge="insert"]')).toHaveLength(
          source === 'b' ? 2 : 1
        );
        move('pointerup', 0, 60);
        await elementIsStable(workspace);
        expect(workspace.value).toBe(saved);
        expect(change).not.toHaveBeenCalled();
      }
    );

    it('moves the only visible panel with its closed and unavailable group members', async () => {
      const workspace = await setupGrouped();
      workspace.groupable = false;
      const restored = JSON.parse(workspace.value);
      restored.closed = ['a'];
      restored.root.children[0].panels.push('unavailable');
      restored.root.children[0].active = 'companion';
      workspace.value = JSON.stringify(restored);
      workspace.detachThreshold = 0;
      await elementIsStable(workspace);
      const source = workspace
        .shadowRoot!.querySelector<HTMLElement>('[data-panel="companion"]')!
        .getBoundingClientRect();
      const bounds = workspace.shadowRoot!.querySelector('.viewport')!.getBoundingClientRect();
      const move = press(workspace, '[data-panel="companion"]');
      const x = bounds.right + 5 - (source.x + source.width / 2);
      move('pointermove', x, 80);
      await vi.waitFor(() => expect(phase(workspace)).toBe('detached'));
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
      move('pointermove', x, 80);
      await elementIsStable(workspace);
      move('pointerup', x, 80);
      await elementIsStable(workspace);
      const result = JSON.parse(workspace.value);
      expect(result.root.children.map((child: { panels: string[] }) => child.panels)).toEqual([
        ['b'],
        ['a', 'companion', 'unavailable']
      ]);
      expect(result.closed).toEqual(['a']);
    });

    it('refreshes a carry when its newly active recipient reveals supplied header actions', async () => {
      const initial = JSON.stringify({
        version: 1,
        closed: [],
        root: {
          type: 'split',
          axis: 'horizontal',
          weights: [1, 1],
          children: [
            { type: 'group', panels: ['a', 'companion'], active: 'companion' },
            { type: 'group', panels: ['b'], active: 'b' }
          ]
        }
      });
      fixture =
        await createFixture(html`<nve-workspace groupable rearrangeable .value=${initial} style="width:600px;height:220px">
        <nve-workspace-panel id="a"><nve-workspace-panel-header>Alpha<button slot="suffix" style="width:140px">Alpha actions</button></nve-workspace-panel-header><input value="retained"></nve-workspace-panel>
        <nve-workspace-panel id="companion"><nve-workspace-panel-header>Companion<button slot="suffix">Actions</button></nve-workspace-panel-header>Companion content</nve-workspace-panel>
        <nve-workspace-panel id="b"><nve-workspace-panel-header>Beta</nve-workspace-panel-header>Beta content</nve-workspace-panel>
      </nve-workspace>`);
      const workspace = fixture.querySelector<Workspace>('nve-workspace')!;
      await elementIsStable(workspace);
      vi.spyOn(workspace, 'setPointerCapture').mockImplementation(() => {});
      const saved = workspace.value;
      const move = press(workspace, '[data-panel="companion"]');
      move('pointermove', 60, 90);
      await vi.waitFor(() => expect(phase(workspace)).toBe('detached'));
      const suffix = workspace.querySelector('#a nve-workspace-panel-header')!.shadowRoot!.querySelector('.suffix')!;
      await vi.waitFor(() => expect(suffix.getBoundingClientRect().width).toBeGreaterThan(140));
      const strip = workspace.shadowRoot!.querySelector<HTMLElement>('[data-panel="a"]')!.closest('.tablist')!;
      expect(strip.getBoundingClientRect().width).toBeLessThan(200);
      expect(phase(workspace)).toBe('detached');
      move('pointermove', 90, 110);
      await elementIsStable(workspace);
      expect(phase(workspace)).toBe('detached');
      move('pointercancel', 90, 110);
      await vi.waitFor(() => expect(phase(workspace)).toBeUndefined());
      expect(workspace.value).toBe(saved);
    });

    it('preserves the content inset and normal label across computed-target detachment', async () => {
      const workspace = await setup();
      const panel = workspace.querySelector<HTMLElement>('#b')!;
      const content = panel.shadowRoot!.querySelector<HTMLElement>('.content')!;
      const label = panel
        .querySelector('nve-workspace-panel-header')!
        .shadowRoot!.querySelector<HTMLElement>('.label-viewport')!;
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

  describe('pointer placement focus', () => {
    it.each([
      { source: 'singleton', selector: '[data-panel="b"]' },
      { source: 'tab', selector: '[data-panel="companion"]' }
    ])('does not invent content focus after dropping a $source into a new position', async ({ selector }) => {
      const workspace = await setupGrouped();
      const active = getActiveElement();
      if (active instanceof HTMLElement) active.blur();
      const saved = workspace.value;
      const changed = vi.fn();
      workspace.addEventListener('workspacechange', changed);
      const bounds = workspace.shadowRoot!.querySelector('.viewport')!.getBoundingClientRect();
      press(workspace, selector);
      workspace.dispatchEvent(pointer('pointermove', bounds.x - 2, bounds.y + bounds.height / 2));
      await vi.waitFor(() => expect(phase(workspace)).toBe('detached'));
      workspace.dispatchEvent(pointer('pointermove', bounds.x - 2, bounds.y + bounds.height / 2));
      await elementIsStable(workspace);
      workspace.dispatchEvent(pointer('pointerup', bounds.x - 2, bounds.y + bounds.height / 2));
      await elementIsStable(workspace);
      expect(workspace.value).not.toBe(saved);
      expect(changed).toHaveBeenCalledOnce();
      expect(getActiveElement()).toBe(document.body);
      expect(workspace.shadowRoot!.activeElement).toBeNull();
      for (const panel of workspace.querySelectorAll('nve-workspace-panel'))
        expect(panel.shadowRoot!.activeElement).toBeNull();
    });

    it('recovers the actual companion focus after joining its whole group rather than the first tab', async () => {
      const workspace = await setupGrouped();
      workspace.shadowRoot!.querySelector<HTMLElement>('[data-panel="companion"]')!.focus();
      const saved = workspace.value;
      const move = press(workspace, '[data-drag-group="a"]');
      move('pointermove', 100, 100);
      await vi.waitFor(() => expect(phase(workspace)).toBe('detached'));
      await elementIsStable(workspace);
      const header = workspace.shadowRoot!.querySelector<HTMLElement>('[data-panel="b"]')!.getBoundingClientRect();
      const x = header.x + header.width / 2;
      const y = header.y + header.height / 2;
      workspace.dispatchEvent(pointer('pointermove', x, y));
      await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
      await elementIsStable(workspace);
      workspace.dispatchEvent(pointer('pointerup', x, y));
      await elementIsStable(workspace);
      expect(workspace.value).not.toBe(saved);
      expect(JSON.parse(workspace.value).root.type).toBe('group');
      expect(workspace.shadowRoot!.activeElement).toBe(workspace.shadowRoot!.querySelector('[data-panel="companion"]'));
    });
  });

  describe('cancellation', () => {
    it('honors nested Escape ownership and consumes an unhandled cancellation once', async () => {
      const workspace = await setup();
      const input = workspace.querySelector('input')!;
      const consume = (event: KeyboardEvent) => event.preventDefault();
      input.addEventListener('keydown', consume);
      const move = press(workspace);
      move('pointermove', 100, 100);
      await vi.waitFor(() => expect(phase(workspace)).toBe('detached'));
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
      await elementIsStable(workspace);
      expect(phase(workspace)).toBe('detached');
      input.removeEventListener('keydown', consume);
      const cancel = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
      input.dispatchEvent(cancel);
      expect(cancel.defaultPrevented).toBe(true);
      const released = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
      document.dispatchEvent(released);
      expect(released.defaultPrevented).toBe(false);
      await vi.waitFor(() => expect(phase(workspace)).toBeUndefined());
    });

    it.each([
      { source: 'singleton title', selector: '[data-panel="b"]' },
      { source: 'tab', selector: '[data-panel="companion"]' },
      { source: 'group grip', selector: '[data-drag-group="a"]' }
    ])('preserves existing application focus when the $source returns', async ({ selector }) => {
      const workspace = await setupGrouped();
      const outside = document.createElement('button');
      fixture.append(outside);
      outside.focus();
      const focus = vi.spyOn(outside, 'focus');
      const move = press(workspace, selector);
      move('pointermove', 0, 60);
      await vi.waitFor(() => expect(phase(workspace)).toBe('detached'));
      workspace.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
      await vi.waitFor(() => expect(phase(workspace)).toBeUndefined());
      await elementIsStable(workspace);
      expect(getActiveElement()).toBe(outside);
      expect(focus).not.toHaveBeenCalled();
      expect(workspace.shadowRoot!.activeElement).toBeNull();
    });

    it('does not invent focus after a group drag that began without a focused control', async () => {
      const workspace = await setupGrouped();
      const active = getActiveElement();
      if (active instanceof HTMLElement) active.blur();
      const move = press(workspace, '[data-drag-group="a"]');
      move('pointermove', 0, 60);
      await vi.waitFor(() => expect(phase(workspace)).toBe('detached'));
      workspace.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
      await vi.waitFor(() => expect(phase(workspace)).toBeUndefined());
      await elementIsStable(workspace);
      expect(getActiveElement()).toBe(document.body);
      expect(workspace.shadowRoot!.activeElement).toBeNull();
    });

    it('recovers the focused companion rather than the first member after a whole-group return', async () => {
      const workspace = await setupGrouped();
      workspace.shadowRoot!.querySelector<HTMLElement>('[data-panel="companion"]')!.focus();
      const move = press(workspace, '[data-drag-group="a"]');
      move('pointermove', 0, 60);
      await vi.waitFor(() => expect(phase(workspace)).toBe('detached'));
      workspace.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
      await vi.waitFor(() => expect(phase(workspace)).toBeUndefined());
      await elementIsStable(workspace);
      expect(workspace.shadowRoot!.activeElement).toBe(workspace.shadowRoot!.querySelector('[data-panel="companion"]'));
    });

    it('preserves supplied content focus without refocusing it on a no-op return', async () => {
      const workspace = await setupGrouped();
      const input = workspace.querySelector('input')!;
      input.focus();
      const focus = vi.spyOn(input, 'focus');
      const move = press(workspace, '[data-drag-group="a"]');
      move('pointermove', 10);
      await elementIsStable(workspace);
      move('pointerup', 10);
      await elementIsStable(workspace);
      expect(getActiveElement()).toBe(input);
      expect(focus).not.toHaveBeenCalled();
    });

    it('leaves focus untouched when Escape cancels a press without movement', async () => {
      const workspace = await setupGrouped();
      const tab = workspace.shadowRoot!.querySelector<HTMLElement>('[data-panel="companion"]')!;
      tab.focus();
      const focus = vi.spyOn(tab, 'focus');
      press(workspace, '[data-drag-group="a"]');
      workspace.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
      await elementIsStable(workspace);
      expect(getActiveElement()).toBe(tab);
      expect(focus).not.toHaveBeenCalled();
    });

    it.each([
      { source: 'tab', selector: '[data-panel="companion"]' },
      { source: 'group grip', selector: '[data-drag-group="a"]' }
    ])('restores focus to the $source when its drag returns', async ({ selector }) => {
      const workspace = await setupGrouped();
      workspace.shadowRoot!.querySelector<HTMLElement>(selector)!.focus();
      const move = press(workspace, selector);
      move('pointermove', 0, 60);
      await vi.waitFor(() => expect(phase(workspace)).toBe('detached'));
      workspace.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
      await vi.waitFor(() => expect(phase(workspace)).toBeUndefined());
      await elementIsStable(workspace);
      expect(workspace.shadowRoot!.activeElement).toBe(workspace.shadowRoot!.querySelector(selector));
    });

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
        workspace.querySelector('input')!.focus();
        const move = press(workspace);
        move('pointermove', 0, 60);
        await vi.waitFor(() => expect(phase(workspace)).toBe('detached'));
        workspace.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        move('pointerup', 0, 60);
        await workspace.updateComplete;
        expect(phase(workspace)).toBe('returning-detached');
        const panel = workspace.querySelector('#b')!;
        const other = panel.shadowRoot!.querySelector<HTMLElement>('.body')!;
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
          expect(panel.shadowRoot!.activeElement).toBe(other);
        }
        expect(workspace.value).toBe(saved);
        expect(changed).not.toHaveBeenCalled();
      }
    );
  });

  describe('group grips', () => {
    it('omits a singleton grip while retaining a multi-panel group grip', async () => {
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

    it('removes the grip and its space when a companion closes and restores them when it reopens', async () => {
      const workspace = await setupGrouped();
      workspace.value = JSON.stringify({ ...JSON.parse(workspace.value), closed: ['companion'] });
      await elementIsStable(workspace);
      const tab = workspace.shadowRoot!.querySelector<HTMLElement>('[data-panel="a"]')!;
      expect(tab.closest('.tabs')!.querySelector('[data-drag-group]')).toBeNull();
      expect(tab.getBoundingClientRect().left).toBe(workspace.querySelector('#a')!.getBoundingClientRect().left);
      expect(JSON.parse(workspace.value).root.children[0].panels).toEqual(['a', 'companion']);
      workspace.value = JSON.stringify({ ...JSON.parse(workspace.value), closed: [] });
      await elementIsStable(workspace);
      expect(
        workspace.shadowRoot!.querySelector('[data-panel="a"]')!.closest('.tabs')!.querySelector('[data-drag-group]')
      ).not.toBeNull();
    });

    it('omits the grip while a companion is unavailable and restores it when the panel returns', async () => {
      const workspace = await setupGrouped();
      const companion = workspace.querySelector('#companion')!;
      companion.remove();
      await elementIsStable(workspace);
      expect(
        workspace.shadowRoot!.querySelector('[data-panel="a"]')!.closest('.tabs')!.querySelector('[data-drag-group]')
      ).toBeNull();
      workspace.append(companion);
      await elementIsStable(workspace);
      expect(
        workspace.shadowRoot!.querySelector('[data-panel="a"]')!.closest('.tabs')!.querySelector('[data-drag-group]')
      ).not.toBeNull();
    });

    it('preserves committed group grips while previewing a tab join', async () => {
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
      expect(targetTabs.querySelector('nve-tabs')).toBeNull();
      expect(sourceTabs.querySelector('[data-drag-group]')).not.toBeNull();
      expect(sourceTabs.querySelector('nve-tabs')).not.toBeNull();
      workspace.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await elementIsStable(workspace);
    });
  });

  describe('animation', () => {
    it('animates tab controls only during rearrangement, leaving direct layout changes immediate', async () => {
      const workspace = await setup();
      const control = workspace.shadowRoot!.querySelector<HTMLElement>('.tablist .tab-entry')!;
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

    it('lets the indicator follow animated tab positions without another transition during rearrangement', async () => {
      const workspace = await setupGrouped();
      workspace.style.setProperty('--animation-duration', '400ms');
      const tabs = workspace.shadowRoot!.querySelector('nve-tabs.tab-track')!;
      expect(getComputedStyle(tabs, '::after').transitionDuration).toBe('0.15s');
      const move = press(workspace, '[data-panel="companion"]');
      move('pointermove', 10);
      await elementIsStable(workspace);
      expect(getComputedStyle(tabs, '::after').transitionDuration).toBe('0s');
      expect(getComputedStyle(tabs.querySelector('.tab-entry')!).transitionDuration).toBe('0.4s, 0.4s');
      move('pointermove', -180);
      await vi.waitFor(() => expect(phase(workspace)).toBe('detached'));
      const selected = tabs.querySelector<HTMLElement>('[selected]')!.parentElement!;
      await vi.waitFor(() => expect(parseFloat(selected.style.left)).toBeGreaterThan(0));
      for (let frame = 0; frame < 5; frame++) {
        await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
        expect(parseFloat(getComputedStyle(tabs, '::after').left)).toBeCloseTo(
          selected.getBoundingClientRect().left - tabs.getBoundingClientRect().left,
          0
        );
      }
      move('pointerup', 0);
      await elementIsStable(workspace);
      expect(getComputedStyle(tabs, '::after').transitionDuration).toBe('0.15s');
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
        root.querySelector('.group-chrome')!,
        root.querySelector('.tablist .tab-entry')!,
        root.querySelector('[data-destination-ghost]')!,
        workspace.querySelector('#b')!,
        workspace.querySelector('#b nve-workspace-panel-header')!.shadowRoot!.querySelector('.label')!
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
