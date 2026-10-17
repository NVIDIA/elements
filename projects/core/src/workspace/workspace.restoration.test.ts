// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import type { Workspace } from './workspace.js';
import type { ResizeHandle } from '@nvidia-elements/core/resize-handle';
import { parseLayout } from './utils/workspace-layout.utils.js';
import './define.js';

const arrangement = (weights: number[]) =>
  JSON.stringify({
    version: 1,
    closed: [],
    root: {
      type: 'split',
      axis: 'horizontal',
      weights,
      children: [
        { type: 'group', panels: ['a', 'companion'], active: 'a' },
        { type: 'group', panels: ['b'], active: 'b' }
      ]
    }
  });

describe('workspace animated restoration', () => {
  let fixture: HTMLElement | undefined;

  afterEach(() => {
    if (fixture) removeFixture(fixture);
    fixture = undefined;
    vi.restoreAllMocks();
  });

  async function setup() {
    fixture =
      await createFixture(html`<nve-workspace rearrangeable groupable resizable closable .value=${arrangement([1, 1])} style="width:800px;height:320px">
      <nve-workspace-panel id="a"><nve-workspace-panel-header>Alpha</nve-workspace-panel-header><input value="retained"></nve-workspace-panel>
      <nve-workspace-panel id="companion"><nve-workspace-panel-header>Companion</nve-workspace-panel-header>Companion content</nve-workspace-panel>
      <nve-workspace-panel id="b"><nve-workspace-panel-header>Beta</nve-workspace-panel-header>Beta content</nve-workspace-panel>
    </nve-workspace>`);
    const workspace = fixture.querySelector<Workspace>('nve-workspace')!;
    await elementIsStable(workspace);
    await vi.waitFor(() => expect(workspace.querySelector('#a')!.getBoundingClientRect().width).toBeGreaterThan(300));
    return workspace;
  }

  async function motion(workspace: Workspace) {
    const panel = workspace.querySelector('#a')!;
    await vi.waitFor(() => expect(panel.getAnimations().length).toBeGreaterThan(0));
    const animation = panel.getAnimations()[0]!;
    animation.pause();
    return animation;
  }

  async function resize(workspace: Workspace, movement = 60) {
    const handle = workspace.shadowRoot!.querySelector<ResizeHandle>('nve-resize-handle')!;
    vi.spyOn(handle, 'setPointerCapture').mockImplementation(() => {});
    handle.dispatchEvent(pointer('pointerdown', 0));
    handle.dispatchEvent(pointer('pointermove', movement));
    await elementIsStable(workspace);
    return handle;
  }

  function escape() {
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
  }

  it('commits the target silently while retaining content and animating geometry', async () => {
    const workspace = await setup();
    const input = workspace.querySelector('input')!;
    input.value = 'edited';
    const changed = vi.fn();
    workspace.addEventListener('workspacechange', changed);
    const oldWidth = workspace.querySelector('#a')!.getBoundingClientRect().width;
    const target = arrangement([1, 3]);
    workspace.animateTo(target, { duration: 500 });
    expect(workspace.value).toBe(JSON.stringify(parseLayout(target)));
    const animation = await motion(workspace);
    animation.currentTime = 0;
    expect(workspace.querySelector('#a')!.getBoundingClientRect().width).toBeCloseTo(oldWidth, 1);
    animation.finish();
    await vi.waitFor(() => expect(workspace.querySelector('#a')!.getAnimations()).toHaveLength(0));
    expect(workspace.querySelector('input')).toBe(input);
    expect(input.value).toBe('edited');
    expect(changed).not.toHaveBeenCalled();
  });

  it('samples the CSS duration and falls back from invalid duration options', async () => {
    const workspace = await setup();
    workspace.style.setProperty('--animation-duration', 'calc(0.2s + 50ms)');
    workspace.animateTo(arrangement([1, 3]), { duration: Number.NaN });
    const animation = await motion(workspace);
    expect(animation.effect!.getTiming().duration).toBe(250);
  });

  it('retargets from displayed geometry for a full new duration and ignores repeated targets', async () => {
    const workspace = await setup();
    workspace.animateTo(arrangement([1, 3]), { duration: 400 });
    const first = await motion(workspace);
    first.currentTime = 200;
    const width = workspace.querySelector('#a')!.getBoundingClientRect().width;
    const target = arrangement([3, 1]);
    workspace.animateTo(target, { duration: 600 });
    const next = await motion(workspace);
    expect(next).not.toBe(first);
    next.currentTime = 0;
    expect(workspace.querySelector('#a')!.getBoundingClientRect().width).toBeCloseTo(width, 1);
    expect(next.effect!.getTiming().duration).toBe(600);
    workspace.animateTo(target, { duration: 900 });
    expect(workspace.querySelector('#a')!.getAnimations()[0]).toBe(next);
    expect(next.effect!.getTiming().duration).toBe(600);
  });

  it('rejects invalid restoration before interrupting existing motion', async () => {
    const workspace = await setup();
    workspace.animateTo(arrangement([1, 3]), { duration: 500 });
    const animation = await motion(workspace);
    const value = workspace.value;
    expect(() => workspace.animateTo('{')).toThrow();
    expect(workspace.value).toBe(value);
    expect(workspace.querySelector('#a')!.getAnimations()[0]).toBe(animation);
  });

  it('settles animation immediately on ordinary value assignment', async () => {
    const workspace = await setup();
    workspace.animateTo(arrangement([1, 3]), { duration: 500 });
    await motion(workspace);
    workspace.value = arrangement([3, 1]);
    await elementIsStable(workspace);
    expect(workspace.querySelector('#a')!.getAnimations()).toHaveLength(0);
  });

  it('restores immediately when duration is zero', async () => {
    const workspace = await setup();
    workspace.animateTo(arrangement([1, 3]), { duration: 0 });
    await elementIsStable(workspace);
    expect(workspace.querySelector('#a')!.getAnimations()).toHaveLength(0);
  });

  it('restores immediately for reduced motion', async () => {
    const workspace = await setup();
    const original = window.matchMedia.bind(window);
    vi.spyOn(window, 'matchMedia').mockImplementation(query => {
      const result = original(query);
      if (query === '(prefers-reduced-motion: reduce)') Object.defineProperty(result, 'matches', { value: true });
      return result;
    });
    workspace.animateTo(arrangement([1, 3]));
    await elementIsStable(workspace);
    expect(workspace.querySelector('#a')!.getAnimations()).toHaveLength(0);
  });

  it('restores disconnected workspaces without starting motion', async () => {
    const detached = await setup();
    detached.remove();
    detached.animateTo(arrangement([3, 1]));
    expect(detached.value).toBe(JSON.stringify(parseLayout(arrangement([3, 1]))));
    expect(detached.getAnimations()).toHaveLength(0);
  });

  it('accepts restoration before the first render without starting motion', () => {
    const detached = document.createElement('nve-workspace');
    detached.animateTo(arrangement([3, 1]));
    expect(detached.value).toBe(JSON.stringify(parseLayout(arrangement([3, 1]))));
    expect(detached.getAnimations()).toHaveLength(0);
  });

  it('aligns retained header labels and tab controls when extracting into a new group', async () => {
    const workspace = await setup();
    const target = JSON.stringify({
      version: 1,
      closed: [],
      root: {
        type: 'split',
        axis: 'horizontal',
        weights: [1, 1, 1],
        children: ['a', 'companion', 'b'].map(id => ({ type: 'group', panels: [id], active: id }))
      }
    });
    const oldTab = workspace
      .shadowRoot!.querySelector('[data-panel="companion"]')!
      .parentElement!.getBoundingClientRect();
    const header = workspace.querySelector('#companion nve-workspace-panel-header')!;
    const oldLabel = header.shadowRoot!.querySelector('.label')!.getBoundingClientRect();
    workspace.animateTo(target, { duration: 500 });
    await motion(workspace);
    const panel = workspace.querySelector('#companion')!;
    const wrapper = workspace.shadowRoot!.querySelector('[data-panel="companion"]')!.parentElement!;
    const group = wrapper.closest('.group-chrome')!;
    const label = header.shadowRoot!.querySelector('.label')!;
    for (const element of [panel, wrapper, group, ...header.shadowRoot!.querySelectorAll('*')])
      for (const animation of element.getAnimations()) {
        animation.pause();
        animation.currentTime = 0;
      }
    expect(wrapper.getBoundingClientRect().x).toBeCloseTo(oldTab.x, 1);
    expect(label.getBoundingClientRect().x).toBeCloseTo(oldLabel.x, 1);
    for (const element of [panel, wrapper, group, ...header.shadowRoot!.querySelectorAll('*')])
      for (const animation of element.getAnimations()) animation.currentTime = 250;
    expect(label.getBoundingClientRect().x).toBeCloseTo(wrapper.getBoundingClientRect().x, 1);
    expect(workspace.querySelector('#companion nve-workspace-panel-header')).toBe(header);
  });

  it('animates the allocated divider wrapper together with its adjacent groups', async () => {
    const workspace = await setup();
    const old = workspace.shadowRoot!.querySelector('.gutter')!.getBoundingClientRect();
    workspace.animateTo(arrangement([1, 3]), { duration: 500 });
    await motion(workspace);
    const gutter = workspace.shadowRoot!.querySelector('.gutter')!;
    const animation = gutter.getAnimations()[0]!;
    expect(animation).toBeDefined();
    animation.pause();
    animation.currentTime = 0;
    expect(gutter.getBoundingClientRect().x).toBeCloseTo(old.x, 1);
  });

  it('settles motion before selection and ignores new owned resize and drag presses', async () => {
    const workspace = await setup();
    workspace.animateTo(arrangement([1, 3]), { duration: 500 });
    await motion(workspace);
    const tab = workspace.shadowRoot!.querySelector<HTMLElement>('[data-panel="a"]')!;
    const press = new PointerEvent('pointerdown', {
      bubbles: true,
      composed: true,
      cancelable: true,
      isPrimary: true,
      button: 0
    });
    tab.dispatchEvent(press);
    expect(workspace.shadowRoot!.querySelector('[data-destination-ghost]')).toBeNull();
    const handle = workspace.shadowRoot!.querySelector('[data-boundary]')!;
    const key = new KeyboardEvent('keydown', {
      bubbles: true,
      composed: true,
      cancelable: true,
      key: 'ArrowRight',
      code: 'ArrowRight'
    });
    handle.dispatchEvent(key);
    expect(key.defaultPrevented).toBe(true);
    workspace.shadowRoot!.querySelector<HTMLElement>('[data-panel="companion"]')!.click();
    await elementIsStable(workspace);
    expect(workspace.querySelector('#a')!.getAnimations()).toHaveLength(0);
    expect(workspace.value).toContain('"active":"companion"');
  });

  it('releases the start guard after completion without disabling command availability', async () => {
    const workspace = await setup();
    workspace.animateTo(arrangement([1, 3]), { duration: 500 });
    await motion(workspace);
    expect(workspace.isCommandAvailable('--close', { value: 'a' })).toBe(true);
    const roots = [
      document,
      workspace.shadowRoot!,
      ...[...workspace.querySelectorAll('nve-workspace-panel-header')].map(header => header.shadowRoot!)
    ];
    const animations = [...new Set(roots.flatMap(root => root.getAnimations()))];
    for (const animation of animations) animation.finish();
    await Promise.allSettled(animations.map(animation => animation.finished));
    const handle = workspace.shadowRoot!.querySelector('[data-boundary]')!;
    const key = new KeyboardEvent('keydown', {
      bubbles: true,
      composed: true,
      cancelable: true,
      key: 'ArrowRight',
      code: 'ArrowRight'
    });
    handle.dispatchEvent(key);
    await elementIsStable(workspace);
    expect(key.defaultPrevented).toBe(false);
  });

  it('settles restoration when the allocated viewport changes', async () => {
    const workspace = await setup();
    workspace.animateTo(arrangement([1, 3]), { duration: 500 });
    const animation = await motion(workspace);
    const target = workspace.value;
    workspace.style.width = '900px';
    await vi.waitFor(() => expect(animation.playState).toBe('idle'));
    expect(workspace.value).toBe(target);
  });

  it('settles restoration before reconciling newly supplied panels', async () => {
    const workspace = await setup();
    workspace.animateTo(arrangement([1, 3]), { duration: 500 });
    const animation = await motion(workspace);
    const panel = document.createElement('nve-workspace-panel');
    panel.id = 'added';
    workspace.append(panel);
    await vi.waitFor(() => expect(animation.playState).toBe('idle'));
    expect(workspace.value).toContain('added');
  });

  it('releases all motion on disconnection', async () => {
    const workspace = await setup();
    workspace.animateTo(arrangement([1, 3]), { duration: 500 });
    const animation = await motion(workspace);
    workspace.remove();
    expect(animation.playState).toBe('idle');
  });

  describe('resize cancellation', () => {
    it('animates displayed geometry back without changing value or announcing a change', async () => {
      const workspace = await setup();
      const panel = workspace.querySelector('#a')!;
      const width = panel.getBoundingClientRect().width;
      const value = workspace.value;
      const changed = vi.fn();
      workspace.addEventListener('workspacechange', changed);
      const handle = await resize(workspace);
      const preview = panel.getBoundingClientRect().width;
      expect(preview).toBeCloseTo(width + 60);
      escape();
      expect(workspace.value).toBe(value);
      const animation = await motion(workspace);
      expect(animation.effect!.getTiming().duration).toBe(150);
      animation.currentTime = 0;
      expect(panel.getBoundingClientRect().width).toBeCloseTo(preview, 1);
      animation.currentTime = 75;
      expect(panel.getBoundingClientRect().width).toBeGreaterThan(width);
      expect(panel.getBoundingClientRect().width).toBeLessThan(preview);
      expect(workspace.value).toBe(value);
      expect(changed).not.toHaveBeenCalled();
      handle.dispatchEvent(pointer('pointerup', 60));
      expect(workspace.value).toBe(value);
      expect(changed).not.toHaveBeenCalled();
      const blocked = pointer('pointerdown', 0);
      handle.dispatchEvent(blocked);
      expect(blocked.defaultPrevented).toBe(true);
      animation.finish();
      await vi.waitFor(() => expect(panel.getAnimations()).toHaveLength(0));
      expect(panel.getBoundingClientRect().width).toBeCloseTo(width, 1);
      expect(workspace.value).toBe(value);
      expect(changed).not.toHaveBeenCalled();
      handle.dispatchEvent(pointer('pointermove', 90));
      handle.dispatchEvent(pointer('pointerup', 90));
      await elementIsStable(workspace);
      expect(workspace.value).toBe(value);
      expect(changed).not.toHaveBeenCalled();
    });

    it('lets immediate value restoration interrupt the return and ignore late pointer release', async () => {
      const workspace = await setup();
      const changed = vi.fn();
      workspace.addEventListener('workspacechange', changed);
      const handle = await resize(workspace);
      escape();
      const animation = await motion(workspace);
      const target = arrangement([3, 1]);
      workspace.value = target;
      await elementIsStable(workspace);
      expect(animation.playState).toBe('idle');
      handle.dispatchEvent(pointer('pointerup', 90));
      await elementIsStable(workspace);
      expect(workspace.value).toBe(JSON.stringify(parseLayout(target)));
      expect(workspace.querySelector('#a')!.getAnimations()).toHaveLength(0);
      expect(changed).not.toHaveBeenCalled();
    });

    it('retargets a return through animateTo even when its target equals canonical value', async () => {
      const workspace = await setup();
      const panel = workspace.querySelector('#a')!;
      const value = workspace.value;
      const changed = vi.fn();
      workspace.addEventListener('workspacechange', changed);
      const handle = await resize(workspace);
      escape();
      const first = await motion(workspace);
      first.currentTime = 50;
      const displayed = panel.getBoundingClientRect().width;
      workspace.animateTo(value, { duration: 400 });
      const next = await motion(workspace);
      expect(next).not.toBe(first);
      expect(first.playState).toBe('idle');
      next.currentTime = 0;
      expect(panel.getBoundingClientRect().width).toBeCloseTo(displayed, 1);
      expect(next.effect!.getTiming().duration).toBe(400);
      handle.dispatchEvent(pointer('pointerup', 60));
      await elementIsStable(workspace);
      expect(next.playState).toBe('paused');
      expect(workspace.value).toBe(value);
      expect(changed).not.toHaveBeenCalled();
    });

    it('returns immediately for reduced motion without changing canonical state', async () => {
      const workspace = await setup();
      const value = workspace.value;
      const width = workspace.querySelector('#a')!.getBoundingClientRect().width;
      const changed = vi.fn();
      workspace.addEventListener('workspacechange', changed);
      const handle = await resize(workspace);
      const original = window.matchMedia.bind(window);
      vi.spyOn(window, 'matchMedia').mockImplementation(query => {
        const result = original(query);
        if (query === '(prefers-reduced-motion: reduce)') Object.defineProperty(result, 'matches', { value: true });
        return result;
      });
      escape();
      await elementIsStable(workspace);
      expect(workspace.querySelector('#a')!.getAnimations()).toHaveLength(0);
      expect(workspace.querySelector('#a')!.getBoundingClientRect().width).toBeCloseTo(width, 1);
      handle.dispatchEvent(pointer('pointerup', 60));
      await elementIsStable(workspace);
      expect(workspace.value).toBe(value);
      expect(changed).not.toHaveBeenCalled();
    });

    it('does not create return animations without resize movement', async () => {
      const workspace = await setup();
      const value = workspace.value;
      const handle = await resize(workspace, 0);
      escape();
      await elementIsStable(workspace);
      expect(workspace.querySelector('#a')!.getAnimations()).toHaveLength(0);
      handle.dispatchEvent(pointer('pointerup', 0));
      await elementIsStable(workspace);
      expect(workspace.value).toBe(value);
    });

    it('releases return motion on disconnect and permits a fresh resize after reconnecting', async () => {
      const workspace = await setup();
      const parent = workspace.parentElement!;
      const value = workspace.value;
      const changed = vi.fn();
      workspace.addEventListener('workspacechange', changed);
      const handle = await resize(workspace);
      escape();
      const animation = await motion(workspace);
      workspace.remove();
      expect(animation.playState).toBe('idle');
      handle.dispatchEvent(pointer('pointerup', 60));
      parent.append(workspace);
      await elementIsStable(workspace);
      expect(workspace.value).toBe(value);
      expect(changed).not.toHaveBeenCalled();
      const next = workspace.shadowRoot!.querySelector<ResizeHandle>('nve-resize-handle')!;
      next.dispatchEvent(pointer('pointerdown', 0));
      next.dispatchEvent(pointer('pointermove', 20));
      next.dispatchEvent(pointer('pointerup', 20));
      await elementIsStable(workspace);
      expect(workspace.value).not.toBe(value);
      expect(changed).toHaveBeenCalledOnce();
    });
  });
});

function pointer(type: string, clientX: number) {
  return new PointerEvent(type, {
    clientX,
    clientY: 80,
    pointerId: 8,
    isPrimary: true,
    button: 0,
    buttons: type === 'pointerup' ? 0 : 1,
    bubbles: true,
    composed: true,
    cancelable: true
  });
}
