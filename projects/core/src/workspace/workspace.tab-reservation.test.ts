// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import type { Workspace } from './workspace.js';
import './define.js';

describe('workspace reserved tab presentation', () => {
  let fixture: HTMLElement;

  afterEach(() => {
    removeFixture(fixture);
    vi.restoreAllMocks();
  });

  async function setup() {
    fixture = await createFixture(html`
      <nve-workspace groupable rearrangeable closable style="width:720px;height:240px">
        ${['a', 'companion', 'b', 'b2'].map(
          id => html`
            <nve-workspace-panel id=${id}>
              <nve-workspace-panel-header>${id}${id === 'b2' ? html`<span slot="suffix" style="display:block;width:120px">Recipient actions</span>` : null}</nve-workspace-panel-header>
              <input .value=${id} />
            </nve-workspace-panel>
          `
        )}
      </nve-workspace>
    `);
    const workspace = fixture.querySelector<Workspace>('nve-workspace')!;
    workspace.value = JSON.stringify({
      version: 1,
      closed: [],
      root: {
        type: 'split',
        axis: 'horizontal',
        weights: [1, 1],
        children: [
          { type: 'group', panels: ['a', 'companion'], active: 'a' },
          { type: 'group', panels: ['b', 'b2'], active: 'b2' }
        ]
      }
    });
    await elementIsStable(workspace);
    vi.spyOn(workspace, 'setPointerCapture').mockImplementation(() => {});
    return workspace;
  }

  function button(workspace: Workspace, id: string) {
    return workspace.shadowRoot!.querySelector<HTMLElement>(`[data-panel="${id}"]`)!;
  }

  function entry(workspace: Workspace, id: string) {
    return button(workspace, id).closest<HTMLElement>('nve-tabs-item-group')!;
  }

  function move(workspace: Workspace, type: string, point: { x: number; y: number }) {
    workspace.dispatchEvent(pointer(type, point.x, point.y));
  }

  function begin(workspace: Workspace, id: string) {
    const control = button(workspace, id),
      rect = control.getBoundingClientRect();
    control.dispatchEvent(pointer('pointerdown', rect.x + rect.width / 2, rect.y + rect.height / 2));
  }

  it('reserves an empty inert tab, slides existing headers, and retains the original nonfirst recipient body', async () => {
    const workspace = await setup(),
      saved = workspace.value,
      input = workspace.querySelector('#a input');
    const change = vi.fn();
    workspace.addEventListener('workspacechange', change);
    const original = button(workspace, 'b'),
      strip = original.closest('.tablist');
    const target = original.getBoundingClientRect();
    begin(workspace, 'companion');
    move(workspace, 'pointermove', { x: target.x + 8, y: target.y + target.height / 2 });
    await vi.waitFor(() =>
      expect(
        workspace.shadowRoot!.querySelector('[data-preview-allocation]')?.getAttribute('data-preview-allocation')
      ).toBe('reserved')
    );
    await elementIsStable(workspace);
    const carried = entry(workspace, 'companion');
    expect(carried.inert).toBe(true);
    expect(getComputedStyle(carried).visibility).toBe('hidden');
    expect(carried.getAttribute('aria-hidden')).toBe('true');
    expect(original.closest('.tablist')).toBe(strip);
    expect(button(workspace, 'b')).toBe(original);
    expect(button(workspace, 'b2').hasAttribute('selected')).toBe(true);
    expect(workspace.querySelector('#b2')!.shadowRoot!.querySelector<HTMLElement>('.content')!.hidden).toBe(false);
    expect(workspace.querySelector('#companion')!.matches(':state(workspace-presented)')).toBe(false);
    expect(getComputedStyle(entry(workspace, 'b')).transitionProperty).toContain('left');
    expect(workspace.value).toBe(saved);
    expect(change).not.toHaveBeenCalled();
    expect(workspace.querySelector('#a input')).toBe(input);
    workspace.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await vi.waitFor(() => expect(workspace.shadowRoot!.querySelector('[data-destination-ghost]')).toBeNull());
    expect(workspace.value).toBe(saved);
  });

  it('holds the accepted slot across refresh and small real pointer movements, then silently returns an inactive tab', async () => {
    const workspace = await setup();
    const saved = workspace.value,
      change = vi.fn();
    workspace.addEventListener('workspacechange', change);
    const target = button(workspace, 'b').getBoundingClientRect();
    begin(workspace, 'companion');
    move(workspace, 'pointermove', { x: target.x + 8, y: target.y + target.height / 2 });
    await vi.waitFor(() =>
      expect(
        workspace.shadowRoot!.querySelector('[data-destination-ghost]')?.getAttribute('data-destination-kind')
      ).toBe('tab')
    );
    const original = entry(workspace, 'a').getBoundingClientRect();
    move(workspace, 'pointermove', { x: original.right - 4, y: original.y + original.height / 2 });
    await nextFrame();
    await elementIsStable(workspace);
    const slot = entry(workspace, 'companion').getBoundingClientRect();
    const destination = entry(workspace, 'companion').getAttribute('style');
    const strip = button(workspace, 'a').closest('.tablist')!;
    strip.dispatchEvent(new Event('scroll'));
    await nextFrame();
    await elementIsStable(workspace);
    expect(entry(workspace, 'companion').getAttribute('style')).toBe(destination);
    for (const dx of [-1, 1]) {
      move(workspace, 'pointermove', { x: slot.x + slot.width / 2 + dx, y: slot.y + slot.height / 2 });
      await nextFrame();
      await elementIsStable(workspace);
      expect(entry(workspace, 'companion').getAttribute('style')).toBe(destination);
    }
    move(workspace, 'pointerup', { x: slot.x + slot.width / 2, y: slot.y + slot.height / 2 });
    await elementIsStable(workspace);
    expect(workspace.value).toBe(saved);
    expect(change).not.toHaveBeenCalled();
    expect(button(workspace, 'a').hasAttribute('selected')).toBe(true);
  });

  it('updates a held reservation clipping independently of placement feasibility during native scroll', async () => {
    const workspace = await setup();
    const extra = Array.from({ length: 12 }, (_, index) => `extra-${index}`);
    for (const id of extra) {
      const panel = document.createElement('nve-workspace-panel');
      panel.id = id;
      workspace.append(panel);
    }
    workspace.value = JSON.stringify({
      version: 1,
      closed: [],
      root: {
        type: 'split',
        axis: 'horizontal',
        weights: [1, 1],
        children: [
          { type: 'group', panels: ['a', 'companion'], active: 'a' },
          { type: 'group', panels: ['b', 'b2', ...extra], active: 'b2' }
        ]
      }
    });
    await elementIsStable(workspace);
    const target = button(workspace, 'b').getBoundingClientRect();
    begin(workspace, 'companion');
    move(workspace, 'pointermove', { x: target.x + 8, y: target.y + target.height / 2 });
    await vi.waitFor(() =>
      expect(
        workspace.shadowRoot!.querySelector('[data-preview-allocation]')?.getAttribute('data-preview-allocation')
      ).toBe('reserved')
    );
    const strip = button(workspace, 'b').closest<HTMLElement>('.tablist')!;
    const saved = workspace.value;
    strip.scrollLeft = strip.scrollWidth;
    strip.dispatchEvent(new Event('scroll'));
    await nextFrame();
    await elementIsStable(workspace);
    expect(strip.scrollLeft).toBeGreaterThan(0);
    const ghost = workspace.shadowRoot!.querySelector<HTMLElement>('[data-destination-ghost]')!;
    expect(ghost.hasAttribute('data-cue-clipped')).toBe(true);
    expect(getComputedStyle(ghost).visibility).toBe('hidden');
    expect(workspace.value).toBe(saved);
    strip.scrollLeft = 0;
    strip.dispatchEvent(new Event('scroll'));
    await nextFrame();
    await elementIsStable(workspace);
    expect(ghost.hasAttribute('data-cue-clipped')).toBe(false);
    expect(getComputedStyle(ghost).visibility).toBe('visible');
    workspace.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await vi.waitFor(() => expect(workspace.shadowRoot!.querySelector('[data-destination-ghost]')).toBeNull());
    expect(strip.scrollLeft).toBe(0);
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

function nextFrame() {
  return new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
}
