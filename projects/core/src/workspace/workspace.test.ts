// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { Workspace } from './workspace.js';
import type { ResizeHandle } from '@nvidia-elements/core/resize-handle';
import { WorkspaceRearrangeController } from './controllers/workspace-rearrange.controller.js';
import { WorkspaceResizeController } from './controllers/workspace-resize.controller.js';
import { WorkspaceFullscreenController } from './controllers/workspace-fullscreen.controller.js';
import './define.js';

const arrangement = JSON.stringify({
  version: 1,
  closed: [],
  root: {
    type: 'split',
    axis: 'horizontal',
    weights: [1, 1, 1],
    children: ['a', 'b', 'c'].map(id => ({ type: 'group', panels: [id], active: id }))
  }
});

describe(Workspace.metadata.tag, () => {
  let fixture: HTMLElement | undefined;

  afterEach(() => {
    if (fixture) removeFixture(fixture);
    fixture = undefined;
    vi.restoreAllMocks();
  });

  async function setup() {
    fixture = await createFixture(html`
      <nve-workspace style="width:912px;height:250px" resizable .value=${arrangement}>
        <nve-workspace-panel id="a" min-width="120"
          ><nve-workspace-panel-header>A</nve-workspace-panel-header><input value="retained"
        /></nve-workspace-panel>
        <nve-workspace-panel id="b" min-width="250"><nve-workspace-panel-header>B</nve-workspace-panel-header>Content B</nve-workspace-panel>
        <nve-workspace-panel id="c" min-width="120"><nve-workspace-panel-header>C</nve-workspace-panel-header>Content C</nve-workspace-panel>
      </nve-workspace>
    `);
    const workspace = fixture.querySelector<Workspace>('nve-workspace')!;
    await elementIsStable(workspace);
    await vi.waitFor(() => expect(workspace.querySelector('#a')!.getBoundingClientRect().width).toBeCloseTo(300));
    return workspace;
  }

  async function setupTabbedResize() {
    const workspace = await setup();
    workspace.value = JSON.stringify({
      version: 1,
      closed: [],
      root: {
        type: 'split',
        axis: 'horizontal',
        weights: [1, 1],
        children: [
          { type: 'group', panels: ['a', 'b'], active: 'b' },
          { type: 'group', panels: ['c'], active: 'c' }
        ]
      }
    });
    await elementIsStable(workspace);
    const handle = workspace.shadowRoot!.querySelector<ResizeHandle>('nve-resize-handle')!;
    const tabs = workspace.shadowRoot!.querySelector<HTMLElement>('nve-tabs.tab-track')!;
    return { workspace, handle, tabs };
  }

  it('keeps grouping opt-in and reflects explicit changes', async () => {
    const workspace = await setup();
    expect(workspace.groupable).toBe(false);
    expect(workspace.hasAttribute('groupable')).toBe(false);
    workspace.groupable = true;
    await elementIsStable(workspace);
    expect(workspace.hasAttribute('groupable')).toBe(true);
    workspace.removeAttribute('groupable');
    await elementIsStable(workspace);
    expect(workspace.groupable).toBe(false);
  });

  describe('layout restoration and container sizing', () => {
    it('should reject invalid restoration without replacing a valid arrangement', async () => {
      const workspace = await setup();
      const value = workspace.value;
      expect(() => {
        workspace.value = '{"version":2}';
      }).toThrow();
      expect(workspace.value).toBe(value);
    });

    it('should preserve the saved preference and focused supplied input through constrained container sizing', async () => {
      const workspace = await setup();
      const value = workspace.value;
      const change = vi.fn();
      workspace.addEventListener('workspacechange', change);
      const input = workspace.querySelector('input')!;
      input.value = 'edited';
      input.focus();
      workspace.style.width = '350px';
      await vi.waitFor(() => expect(workspace.querySelector('#a')!.getBoundingClientRect().width).toBeCloseTo(120));
      expect(document.activeElement).toBe(input);
      expect(input.parentElement).toBe(workspace.querySelector('#a'));
      expect(input.value).toBe('edited');
      expect(workspace.value).toBe(value);
      workspace.style.width = '912px';
      await vi.waitFor(() => expect(workspace.querySelector('#a')!.getBoundingClientRect().width).toBeCloseTo(300));
      expect(change).not.toHaveBeenCalled();
    });
  });

  describe('selection and supplied content', () => {
    it('should keep authored label and content nodes through regrouping and keyboard selection', async () => {
      const workspace = await setup();
      const panel = workspace.querySelector('#a')!;
      const label = panel.querySelector('nve-workspace-panel-header')!;
      const input = panel.querySelector('input')!;
      input.value = 'edited';
      workspace.value = JSON.stringify({
        version: 1,
        closed: [],
        root: { type: 'group', panels: ['a', 'b', 'c'], active: 'a' }
      });
      await elementIsStable(workspace);
      const tab = workspace.shadowRoot!.querySelector<HTMLElement>('[data-panel="a"]')!;
      tab.focus();
      tab.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowRight', code: 'ArrowRight', bubbles: true, composed: true })
      );
      await elementIsStable(workspace);
      expect(workspace.shadowRoot!.activeElement).toBe(workspace.shadowRoot!.querySelector('[data-panel="b"]'));
      expect(workspace.shadowRoot!.querySelector('[data-panel="b"]')!.hasAttribute('selected')).toBe(true);
      expect(panel.querySelector('nve-workspace-panel-header')).toBe(label);
      expect(panel.querySelector('input')).toBe(input);
      expect(input.parentElement).toBe(panel);
      expect(input.value).toBe('edited');
      expect(panel.shadowRoot!.querySelector('.content')!.hasAttribute('hidden')).toBe(true);
    });

    it('should announce changed selection once and keep selected clicks and Home silent', async () => {
      const workspace = await setup();
      workspace.value = JSON.stringify({
        version: 1,
        closed: [],
        root: { type: 'group', panels: ['a', 'b', 'c'], active: 'a' }
      });
      await elementIsStable(workspace);
      const change = vi.fn();
      workspace.addEventListener('workspacechange', change);
      const first = workspace.shadowRoot!.querySelector<HTMLElement>('[data-panel="a"]')!;
      first.click();
      first.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', code: 'Home', bubbles: true, composed: true }));
      await elementIsStable(workspace);
      expect(change).not.toHaveBeenCalled();
      const next = workspace.shadowRoot!.querySelector<HTMLElement>('[data-panel="b"]')!;
      next.click();
      await elementIsStable(workspace);
      expect(next.hasAttribute('selected')).toBe(true);
      expect(change).toHaveBeenCalledOnce();
      next.click();
      await elementIsStable(workspace);
      expect(change).toHaveBeenCalledOnce();
    });
  });

  it('pairs controller document listeners across adoption while the host is disconnected', () => {
    const registered = vi.spyOn(Workspace.prototype, 'addController');
    const workspace = document.createElement('nve-workspace');
    const controllers = registered.mock.calls
      .map(([controller]) => controller)
      .filter(
        (
          controller
        ): controller is WorkspaceRearrangeController | WorkspaceResizeController | WorkspaceFullscreenController =>
          controller instanceof WorkspaceRearrangeController ||
          controller instanceof WorkspaceResizeController ||
          controller instanceof WorkspaceFullscreenController
      );
    try {
      expect(controllers).toHaveLength(3);
      const added = vi.spyOn(document, 'addEventListener');
      for (const controller of controllers) controller.hostConnected();
      const registrations = [...added.mock.calls];
      expect(registrations.map(([type]) => type).sort()).toEqual([
        'fullscreenchange',
        'fullscreenerror',
        'keydown',
        'keydown',
        'pointerdown'
      ]);
      const removed = vi.spyOn(document, 'removeEventListener');
      const destination = document.implementation.createHTMLDocument();
      destination.adoptNode(workspace);
      for (const controller of controllers) controller.hostDisconnected();
      for (const registration of registrations) expect(removed).toHaveBeenCalledWith(...registration);
      const next = vi.spyOn(destination, 'addEventListener');
      for (const controller of controllers) controller.hostConnected();
      for (const registration of registrations) expect(next).toHaveBeenCalledWith(...registration);
    } finally {
      for (const controller of controllers) controller.hostDisconnected();
    }
  });

  describe('resizing and interruption', () => {
    it('should keep a resize gesture without movement silent', async () => {
      const workspace = await setup();
      const value = workspace.value;
      const change = vi.fn();
      workspace.addEventListener('workspacechange', change);
      const handle = workspace.shadowRoot!.querySelector<ResizeHandle>('nve-resize-handle')!;
      vi.spyOn(handle, 'setPointerCapture').mockImplementation(() => {});
      handle.dispatchEvent(pointer('pointerdown', 0));
      handle.dispatchEvent(pointer('pointerup', 0));
      await elementIsStable(workspace);
      expect(workspace.value).toBe(value);
      expect(change).not.toHaveBeenCalled();
    });

    it.each(['resizable', 'rearrangeable', 'groupable', 'closable'] as const)(
      'should retain the admitted handle and geometry when %s changes before movement',
      async capability => {
        const { workspace, handle } = await setupTabbedResize();
        workspace.rearrangeable = true;
        workspace.groupable = true;
        workspace.closable = true;
        await elementIsStable(workspace);
        const value = workspace.value;
        const change = vi.fn();
        workspace.addEventListener('workspacechange', change);
        const before = workspace.querySelector('#b')!.getBoundingClientRect();
        const header = workspace.shadowRoot!.querySelector('.tabs')!.getBoundingClientRect().height;
        vi.spyOn(handle, 'setPointerCapture').mockImplementation(() => {});
        handle.dispatchEvent(pointer('pointerdown', 0));
        workspace[capability] = false;
        await elementIsStable(workspace);
        expect(workspace.shadowRoot!.querySelector('nve-resize-handle')).toBe(handle);
        expect(workspace.shadowRoot!.querySelector('.tabs')!.getBoundingClientRect().height).toBe(header);
        if (capability === 'resizable') {
          const start = pointer('pointerdown', 0);
          handle.dispatchEvent(start);
          expect(start.defaultPrevented).toBe(true);
          const key = new KeyboardEvent('keydown', {
            key: 'ArrowRight',
            bubbles: true,
            composed: true,
            cancelable: true
          });
          handle.shadowRoot!.querySelector('input')!.dispatchEvent(key);
          expect(key.defaultPrevented).toBe(true);
        }
        handle.dispatchEvent(pointer('pointermove', 30));
        await elementIsStable(workspace);
        expect(workspace.querySelector('#b')!.getBoundingClientRect().width).toBeCloseTo(before.width + 30);
        handle.dispatchEvent(pointer('pointerup', 50));
        await elementIsStable(workspace);
        expect(workspace.value).not.toBe(value);
        expect(change).toHaveBeenCalledOnce();
        if (capability === 'resizable') expect(workspace.shadowRoot!.querySelector('nve-resize-handle')).toBeNull();
      }
    );

    it('should capture resize policy at admission and use the latest policy for the next gesture', async () => {
      const workspace = await setup();
      const handle = workspace.shadowRoot!.querySelector<ResizeHandle>('nve-resize-handle')!;
      vi.spyOn(handle, 'setPointerCapture').mockImplementation(() => {});
      handle.dispatchEvent(pointer('pointerdown', 0));
      workspace.resizePolicy = 'propagate';
      await elementIsStable(workspace);
      handle.dispatchEvent(pointer('pointermove', 100));
      await elementIsStable(workspace);
      expect(workspace.querySelector('#a')!.getBoundingClientRect().width).toBeCloseTo(350);
      expect(workspace.querySelector('#c')!.getBoundingClientRect().width).toBeCloseTo(300);
      handle.dispatchEvent(pointer('pointerup', 100));
      await elementIsStable(workspace);
      handle.dispatchEvent(pointer('pointerdown', 0));
      handle.dispatchEvent(pointer('pointermove', 20));
      handle.dispatchEvent(pointer('pointerup', 20));
      await elementIsStable(workspace);
      expect(workspace.querySelector('#a')!.getBoundingClientRect().width).toBeCloseTo(370);
      expect(workspace.querySelector('#c')!.getBoundingClientRect().width).toBeCloseTo(280);
    });

    it('should preserve a visible resize preview across capability-driven chrome changes', async () => {
      const { workspace, handle } = await setupTabbedResize();
      workspace.closable = true;
      workspace.rearrangeable = true;
      await elementIsStable(workspace);
      const before = workspace.querySelector('#b')!.getBoundingClientRect().width;
      vi.spyOn(handle, 'setPointerCapture').mockImplementation(() => {});
      handle.dispatchEvent(pointer('pointerdown', 0));
      handle.dispatchEvent(pointer('pointermove', 20));
      await elementIsStable(workspace);
      workspace.closable = false;
      workspace.rearrangeable = false;
      workspace.resizable = false;
      await elementIsStable(workspace);
      expect(workspace.shadowRoot!.querySelector('nve-resize-handle')).toBe(handle);
      expect(workspace.shadowRoot!.querySelector('[data-close]')).not.toBeNull();
      expect(workspace.querySelector('#b')!.getBoundingClientRect().width).toBeCloseTo(before + 20);
      handle.dispatchEvent(pointer('pointermove', 40));
      await elementIsStable(workspace);
      expect(workspace.querySelector('#b')!.getBoundingClientRect().width).toBeCloseTo(before + 40);
      handle.dispatchEvent(pointer('pointerup', 40));
      await elementIsStable(workspace);
      expect(workspace.shadowRoot!.querySelector('nve-resize-handle')).toBeNull();
      expect(workspace.shadowRoot!.querySelector('[data-close]')).toBeNull();
    });

    it('should suppress indicator animation through pointer resizing and restore selection timing after commit', async () => {
      const { workspace, handle, tabs } = await setupTabbedResize();
      const value = workspace.value;
      expect(getComputedStyle(tabs, '::after').transitionDuration).toBe('0.15s');
      vi.spyOn(handle, 'setPointerCapture').mockImplementation(() => {});
      handle.dispatchEvent(pointer('pointerdown', 0));
      handle.dispatchEvent(pointer('pointermove', 40));
      await elementIsStable(workspace);
      expect(getComputedStyle(tabs, '::after').transitionDuration).toBe('0s');
      handle.dispatchEvent(pointer('pointerup', 60));
      await workspace.updateComplete;
      expect(getComputedStyle(tabs, '::after').transitionDuration).toBe('0s');
      expect(workspace.value).not.toBe(value);
      await vi.waitFor(() => expect(getComputedStyle(tabs, '::after').transitionDuration).toBe('0.15s'));
      workspace.querySelector('#a')!.dispatchEvent(new CommandEvent('command', { command: '--select' }));
      await elementIsStable(workspace);
      expect(tabs.querySelector('[data-panel="a"]')!.hasAttribute('selected')).toBe(true);
      expect(getComputedStyle(tabs, '::after').transitionDuration).toBe('0.15s');
    });

    it('should suppress indicator animation for keyboard resizing', async () => {
      const { workspace, handle, tabs } = await setupTabbedResize();
      const value = workspace.value;
      handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, composed: true }));
      handle.valueAsNumber += 10;
      handle.dispatchEvent(new Event('input', { bubbles: true }));
      handle.dispatchEvent(new Event('change', { bubbles: true }));
      await workspace.updateComplete;
      expect(getComputedStyle(tabs, '::after').transitionDuration).toBe('0s');
      expect(workspace.value).not.toBe(value);
      await vi.waitFor(() => expect(getComputedStyle(tabs, '::after').transitionDuration).toBe('0.15s'));
    });

    it('should release committed presentation when a change listener restores another arrangement', async () => {
      const { workspace, handle } = await setupTabbedResize();
      const restored = JSON.stringify({
        version: 1,
        closed: [],
        root: { type: 'group', panels: ['a', 'b', 'c'], active: 'a' }
      });
      workspace.addEventListener(
        'workspacechange',
        () => {
          workspace.value = restored;
        },
        { once: true }
      );
      vi.spyOn(handle, 'setPointerCapture').mockImplementation(() => {});
      handle.dispatchEvent(pointer('pointerdown', 0));
      handle.dispatchEvent(pointer('pointermove', 30));
      handle.dispatchEvent(pointer('pointerup', 30));
      await elementIsStable(workspace);
      expect(JSON.parse(workspace.value)).toEqual(JSON.parse(restored));
      expect(workspace.shadowRoot!.querySelector('nve-resize-handle')).toBeNull();
      expect(workspace.shadowRoot!.querySelectorAll('nve-tabs-item[data-panel]')).toHaveLength(3);
    });

    it('should suppress indicator animation while restoring cancelled resize geometry', async () => {
      const { workspace, handle, tabs } = await setupTabbedResize();
      const value = workspace.value;
      vi.spyOn(handle, 'setPointerCapture').mockImplementation(() => {});
      handle.dispatchEvent(pointer('pointerdown', 0));
      handle.dispatchEvent(pointer('pointermove', 40));
      await elementIsStable(workspace);
      handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, composed: true }));
      await workspace.updateComplete;
      expect(getComputedStyle(tabs, '::after').transitionDuration).toBe('0s');
      expect(workspace.value).toBe(value);
      handle.dispatchEvent(pointer('pointerup', 40));
      await vi.waitFor(() => expect(getComputedStyle(tabs, '::after').transitionDuration).toBe('0.15s'));
    });

    it('should accumulate resize movement across rendered frames then discard Escape and the remaining pointer sequence', async () => {
      const workspace = await setup();
      const value = workspace.value;
      const change = vi.fn();
      workspace.addEventListener('workspacechange', change);
      const handle = workspace.shadowRoot!.querySelector<ResizeHandle>('nve-resize-handle')!;
      vi.spyOn(handle, 'setPointerCapture').mockImplementation(() => {});
      handle.dispatchEvent(pointer('pointerdown', 0));
      handle.dispatchEvent(pointer('pointermove', 20));
      await elementIsStable(workspace);
      handle.dispatchEvent(pointer('pointermove', 40));
      await elementIsStable(workspace);
      expect(workspace.querySelector('#a')!.getBoundingClientRect().width).toBeCloseTo(340);
      expect(workspace.querySelector('#c')!.getBoundingClientRect().width).toBeCloseTo(300);
      handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, composed: true }));
      handle.dispatchEvent(pointer('pointermove', 60));
      handle.dispatchEvent(pointer('pointerup', 60));
      await elementIsStable(workspace);
      expect(workspace.value).toBe(value);
      await vi.waitFor(() => expect(workspace.querySelector('#a')!.getBoundingClientRect().width).toBeCloseTo(300));
      expect(change).not.toHaveBeenCalled();
    });

    it('should cancel an active resize when Escape is pressed outside the workspace', async () => {
      const workspace = await setup();
      const value = workspace.value;
      const change = vi.fn();
      workspace.addEventListener('workspacechange', change);
      const handle = workspace.shadowRoot!.querySelector<ResizeHandle>('nve-resize-handle')!;
      vi.spyOn(handle, 'setPointerCapture').mockImplementation(() => {});
      handle.dispatchEvent(pointer('pointerdown', 0));
      handle.dispatchEvent(pointer('pointermove', 30));
      await elementIsStable(workspace);
      expect(workspace.querySelector('#a')!.getBoundingClientRect().width).toBeCloseTo(330);

      const escape = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
      document.dispatchEvent(escape);
      handle.dispatchEvent(pointer('pointermove', 50));
      handle.dispatchEvent(pointer('pointerup', 50));
      await elementIsStable(workspace);
      expect(escape.defaultPrevented).toBe(true);
      expect(workspace.value).toBe(value);
      await vi.waitFor(() => expect(workspace.querySelector('#a')!.getBoundingClientRect().width).toBeCloseTo(300));
      expect(change).not.toHaveBeenCalled();
    });

    it('should leave consumed Escape to a nested control and release ownership after cancellation', async () => {
      const workspace = await setup();
      const handle = workspace.shadowRoot!.querySelector<ResizeHandle>('nve-resize-handle')!;
      const control = workspace.querySelector('input')!;
      const consume = (event: KeyboardEvent) => event.preventDefault();
      control.addEventListener('keydown', consume);
      vi.spyOn(handle, 'setPointerCapture').mockImplementation(() => {});
      const idle = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
      document.dispatchEvent(idle);
      expect(idle.defaultPrevented).toBe(false);
      handle.dispatchEvent(pointer('pointerdown', 0));
      handle.dispatchEvent(pointer('pointermove', 30));
      await elementIsStable(workspace);
      control.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
      await elementIsStable(workspace);
      expect(workspace.querySelector('#a')!.getBoundingClientRect().width).toBeCloseTo(330);
      control.removeEventListener('keydown', consume);
      const cancel = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
      control.dispatchEvent(cancel);
      expect(cancel.defaultPrevented).toBe(true);
      const released = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
      document.dispatchEvent(released);
      expect(released.defaultPrevented).toBe(false);
      handle.dispatchEvent(pointer('pointerup', 30));
      await elementIsStable(workspace);
      await vi.waitFor(() => expect(workspace.querySelector('#a')!.getBoundingClientRect().width).toBeCloseTo(300));
      const range = handle.shadowRoot!.querySelector('input')!;
      range.addEventListener('keydown', consume);
      range.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, composed: true, cancelable: true })
      );
      range.valueAsNumber += 10;
      range.dispatchEvent(new Event('input', { bubbles: true }));
      range.dispatchEvent(new Event('change', { bubbles: true }));
      await elementIsStable(workspace);
      expect(workspace.querySelector('#a')!.getBoundingClientRect().width).toBeCloseTo(310);
    });

    it('should reject resize keys while a cancelled pointer is still awaiting release', async () => {
      const workspace = await setup();
      const value = workspace.value;
      const handle = workspace.shadowRoot!.querySelector<ResizeHandle>('nve-resize-handle')!;
      vi.spyOn(handle, 'setPointerCapture').mockImplementation(() => {});
      handle.dispatchEvent(pointer('pointerdown', 0));
      handle.dispatchEvent(pointer('pointermove', 30));
      await elementIsStable(workspace);
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
      const key = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, composed: true, cancelable: true });
      handle.shadowRoot!.querySelector('input')!.dispatchEvent(key);
      expect(key.defaultPrevented).toBe(true);
      handle.dispatchEvent(pointer('pointermove', 60));
      handle.dispatchEvent(pointer('pointerup', 60));
      await elementIsStable(workspace);
      expect(workspace.value).toBe(value);
    });

    it.each(['width', 'gap'] as const)('should cancel resizing when the actual %s changes', async metric => {
      const workspace = await setup();
      const value = workspace.value;
      const handle = workspace.shadowRoot!.querySelector<ResizeHandle>('nve-resize-handle')!;
      vi.spyOn(handle, 'setPointerCapture').mockImplementation(() => {});
      handle.dispatchEvent(pointer('pointerdown', 0));
      handle.dispatchEvent(pointer('pointermove', 30));
      await elementIsStable(workspace);
      if (metric === 'width') workspace.style.width = '1000px';
      else workspace.style.setProperty('--gap', '12px');
      await vi.waitFor(() => expect(workspace.querySelector('#a')!.getBoundingClientRect().width).not.toBeCloseTo(330));
      handle.dispatchEvent(pointer('pointermove', 50));
      handle.dispatchEvent(pointer('pointerup', 50));
      await elementIsStable(workspace);
      expect(workspace.value).toBe(value);
    });

    it('should roll back an interrupted pointer resize without announcing a commit', async () => {
      const workspace = await setup();
      const value = workspace.value;
      const change = vi.fn();
      workspace.addEventListener('workspacechange', change);
      const handle = workspace.shadowRoot!.querySelector<ResizeHandle>('nve-resize-handle')!;
      vi.spyOn(handle, 'setPointerCapture').mockImplementation(() => {});
      handle.dispatchEvent(pointer('pointerdown', 0));
      handle.dispatchEvent(pointer('pointermove', 30));
      await elementIsStable(workspace);
      expect(workspace.querySelector('#a')!.getBoundingClientRect().width).toBeCloseTo(330);
      handle.dispatchEvent(pointer('pointercancel', 30));
      await elementIsStable(workspace);
      expect(workspace.value).toBe(value);
      expect(workspace.querySelector('#a')!.getBoundingClientRect().width).toBeCloseTo(300);
      expect(change).not.toHaveBeenCalled();
    });

    it('should preserve external restoration during an active pointer resize and ignore the remaining gesture', async () => {
      const workspace = await setup();
      const change = vi.fn();
      workspace.addEventListener('workspacechange', change);
      const handle = workspace.shadowRoot!.querySelector<ResizeHandle>('nve-resize-handle')!;
      vi.spyOn(handle, 'setPointerCapture').mockImplementation(() => {});
      handle.dispatchEvent(pointer('pointerdown', 0));
      handle.dispatchEvent(pointer('pointermove', 30));
      await elementIsStable(workspace);
      expect(workspace.querySelector('#a')!.getBoundingClientRect().width).toBeCloseTo(330);
      workspace.value = arrangement.replace('[1,1,1]', '[2,1,1]');
      const restored = workspace.value;
      await elementIsStable(workspace);
      const restoredWidth = workspace.querySelector('#a')!.getBoundingClientRect().width;
      const restoredThirdWidth = workspace.querySelector('#c')!.getBoundingClientRect().width;
      handle.dispatchEvent(pointer('pointermove', 50));
      handle.dispatchEvent(pointer('pointerup', 50));
      await elementIsStable(workspace);
      expect(workspace.value).toBe(restored);
      expect(workspace.querySelector('#a')!.getBoundingClientRect().width).toBeCloseTo(restoredWidth);
      expect(change).not.toHaveBeenCalled();
      handle.dispatchEvent(pointer('pointerdown', 0));
      handle.dispatchEvent(pointer('pointerup', 0));
      await elementIsStable(workspace);
      expect(workspace.value).toBe(restored);
      expect(change).not.toHaveBeenCalled();
      handle.dispatchEvent(pointer('pointerdown', 0));
      handle.dispatchEvent(pointer('pointermove', -10));
      handle.dispatchEvent(pointer('pointerup', -10));
      await elementIsStable(workspace);
      expect(workspace.querySelector('#a')!.getBoundingClientRect().width).toBeCloseTo(restoredWidth - 10);
      expect(workspace.querySelector('#b')!.getBoundingClientRect().width).toBeCloseTo(260);
      expect(workspace.querySelector('#c')!.getBoundingClientRect().width).toBe(restoredThirdWidth);
      expect(change).toHaveBeenCalledOnce();
    });

    it('should discard a disconnected resize session and allow a fresh resize after reconnection', async () => {
      const workspace = await setup();
      const parent = workspace.parentElement!;
      const value = workspace.value;
      const change = vi.fn();
      workspace.addEventListener('workspacechange', change);
      const handle = workspace.shadowRoot!.querySelector<ResizeHandle>('nve-resize-handle')!;
      vi.spyOn(handle, 'setPointerCapture').mockImplementation(() => {});
      handle.dispatchEvent(pointer('pointerdown', 0));
      handle.dispatchEvent(pointer('pointermove', 30));
      await elementIsStable(workspace);
      expect(workspace.querySelector('#a')!.getBoundingClientRect().width).toBeCloseTo(330);

      workspace.remove();
      parent.append(workspace);
      await elementIsStable(workspace);
      expect(workspace.value).toBe(value);
      expect(workspace.querySelector('#a')!.getBoundingClientRect().width).toBeCloseTo(300);
      expect(change).not.toHaveBeenCalled();

      const next = workspace.shadowRoot!.querySelector<ResizeHandle>('nve-resize-handle')!;
      if (next !== handle) vi.spyOn(next, 'setPointerCapture').mockImplementation(() => {});
      next.dispatchEvent(pointer('pointerdown', 0));
      next.dispatchEvent(pointer('pointermove', 20));
      next.dispatchEvent(pointer('pointerup', 20));
      await elementIsStable(workspace);
      expect(workspace.querySelector('#a')!.getBoundingClientRect().width).toBeCloseTo(320);
      expect(change).toHaveBeenCalledOnce();
    });
  });
});

function pointer(type: string, clientX: number) {
  return new PointerEvent(type, {
    clientX,
    clientY: 50,
    pointerId: 4,
    isPrimary: true,
    button: 0,
    buttons: type === 'pointerup' ? 0 : 1,
    bubbles: true,
    composed: true,
    cancelable: true
  });
}
