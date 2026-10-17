// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { Workspace } from './workspace.js';
import type { ResizeHandle } from '@nvidia-elements/core/resize-handle';
import './define.js';

const arrangement = JSON.stringify({
  version: 1,
  closed: [],
  root: {
    type: 'split',
    axis: 'horizontal',
    weights: [1, 1, 1],
    children: ['a', 'b', 'c'].map(id => ({ type: 'pane', panels: [id], active: id }))
  }
});

describe(Workspace.metadata.tag, () => {
  let fixture: HTMLElement | undefined;

  afterEach(() => {
    if (fixture) removeFixture(fixture);
    vi.restoreAllMocks();
  });

  async function setup() {
    fixture = await createFixture(html`
      <nve-workspace style="width:912px;height:250px" resizable .value=${arrangement}>
        <nve-workspace-panel id="a" min-width="120"
          ><span slot="label">A</span><input value="retained"
        /></nve-workspace-panel>
        <nve-workspace-panel id="b" min-width="250"><span slot="label">B</span>Content B</nve-workspace-panel>
        <nve-workspace-panel id="c" min-width="120"><span slot="label">C</span>Content C</nve-workspace-panel>
      </nve-workspace>
    `);
    const workspace = fixture.querySelector<Workspace>('nve-workspace')!;
    await elementIsStable(workspace);
    await vi.waitFor(() => expect(workspace.querySelector('#a')!.getBoundingClientRect().width).toBeCloseTo(300));
    return workspace;
  }

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
      const label = panel.querySelector('[slot="label"]')!;
      const input = panel.querySelector('input')!;
      input.value = 'edited';
      workspace.value = JSON.stringify({
        version: 1,
        closed: [],
        root: { type: 'pane', panels: ['a', 'b', 'c'], active: 'a' }
      });
      await elementIsStable(workspace);
      const tab = workspace.shadowRoot!.querySelector<HTMLButtonElement>('[data-panel="a"]')!;
      tab.focus();
      tab.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, composed: true }));
      await elementIsStable(workspace);
      expect(workspace.shadowRoot!.activeElement).toBe(workspace.shadowRoot!.querySelector('[data-panel="b"]'));
      expect(workspace.shadowRoot!.querySelector('[data-panel="b"]')!.getAttribute('aria-selected')).toBe('true');
      expect(panel.querySelector('[slot="label"]')).toBe(label);
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
        root: { type: 'pane', panels: ['a', 'b', 'c'], active: 'a' }
      });
      await elementIsStable(workspace);
      const change = vi.fn();
      workspace.addEventListener('workspacechange', change);
      const first = workspace.shadowRoot!.querySelector<HTMLButtonElement>('[data-panel="a"]')!;
      first.click();
      first.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true, composed: true }));
      await elementIsStable(workspace);
      expect(change).not.toHaveBeenCalled();
      const next = workspace.shadowRoot!.querySelector<HTMLButtonElement>('[data-panel="b"]')!;
      next.click();
      await elementIsStable(workspace);
      expect(next.getAttribute('aria-selected')).toBe('true');
      expect(change).toHaveBeenCalledOnce();
      next.click();
      await elementIsStable(workspace);
      expect(change).toHaveBeenCalledOnce();
    });
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
      expect(workspace.querySelector('#a')!.getBoundingClientRect().width).toBeCloseTo(300);
      expect(change).not.toHaveBeenCalled();
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

    it('should discard live resize geometry when resizing is disabled and ignore the detached handle', async () => {
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
      workspace.resizable = false;
      await elementIsStable(workspace);
      expect(workspace.shadowRoot!.querySelector('nve-resize-handle')).toBeNull();
      expect(workspace.querySelector('#a')!.getBoundingClientRect().width).toBeCloseTo(300);
      handle.dispatchEvent(pointer('pointermove', 50));
      handle.dispatchEvent(pointer('pointerup', 50));
      await elementIsStable(workspace);
      expect(workspace.value).toBe(value);
      expect(change).not.toHaveBeenCalled();
      workspace.resizable = true;
      await elementIsStable(workspace);
      const enabledHandle = workspace.shadowRoot!.querySelector<ResizeHandle>('nve-resize-handle')!;
      const range = enabledHandle.shadowRoot!.querySelector('input')!;
      range.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, composed: true }));
      range.valueAsNumber += 10;
      range.dispatchEvent(new Event('input', { bubbles: true }));
      range.dispatchEvent(new Event('change', { bubbles: true }));
      await elementIsStable(workspace);
      expect(workspace.querySelector('#a')!.getBoundingClientRect().width).toBeCloseTo(310);
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
    cancelable: true
  });
}
