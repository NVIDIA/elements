// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { Workspace } from './workspace.js';
import type { DragHandle } from '@nvidia-elements/core/drag-handle';
import type { WorkspaceLayout } from './workspace-layout.utils.js';
import './define.js';

const arrangement = JSON.stringify({
  version: 1,
  closed: [],
  root: {
    type: 'split',
    axis: 'horizontal',
    weights: [1, 1],
    children: [
      { type: 'pane', panels: ['a', 'b'], active: 'a' },
      { type: 'pane', panels: ['c', 'd'], active: 'c' }
    ]
  }
});

describe(`${Workspace.metadata.tag} interactions`, () => {
  let fixture: HTMLElement | undefined;

  afterEach(() => {
    if (fixture) removeFixture(fixture);
  });

  async function setup(value = arrangement) {
    fixture = await createFixture(html`
      <nve-workspace style="width:806px;height:320px" rearrangeable closable resizable .value=${value}>
        <nve-workspace-panel id="a"><span slot="label">Alpha</span><input value="retained" /></nve-workspace-panel>
        <nve-workspace-panel id="b"><span slot="label">Beta</span>Content B</nve-workspace-panel>
        <nve-workspace-panel id="c"><span slot="label">Gamma</span>Content C</nve-workspace-panel>
        <nve-workspace-panel id="d"><span slot="label">Delta</span>Content D</nve-workspace-panel>
      </nve-workspace>
    `);
    const workspace = fixture.querySelector<Workspace>('nve-workspace')!;
    await elementIsStable(workspace);
    return workspace;
  }

  function control<T extends HTMLElement = HTMLButtonElement>(workspace: Workspace, selector: string): T {
    const element = workspace.shadowRoot!.querySelector<T>(selector);
    expect(element, selector).not.toBeNull();
    return element!;
  }

  function snapshot(workspace: Workspace): WorkspaceLayout {
    return JSON.parse(workspace.value);
  }

  async function move(
    workspace: Workspace,
    source: string,
    destination: { target: string; position?: string; group?: boolean }
  ) {
    const { target, position = 'tab', group = false } = destination;
    control(workspace, `[data-move="${source}"]`).click();
    await elementIsStable(workspace);
    if (group) {
      control(workspace, '[data-move-group]').click();
      await elementIsStable(workspace);
    }
    const operation = control<HTMLSelectElement>(workspace, '[data-operation]');
    operation.value = position === 'tab' ? 'tab' : 'split';
    operation.dispatchEvent(new Event('change', { bubbles: true }));
    await elementIsStable(workspace);
    const targetControl = control<HTMLSelectElement>(workspace, '[data-target]');
    targetControl.value = target;
    targetControl.dispatchEvent(new Event('change', { bubbles: true }));
    if (position !== 'tab') {
      const positionControl = control<HTMLSelectElement>(workspace, '[data-position]');
      positionControl.value = position;
      positionControl.dispatchEvent(new Event('change', { bubbles: true }));
    }
    await elementIsStable(workspace);
    control(workspace, '[data-apply]').click();
    await elementIsStable(workspace);
  }

  it('should split a tab from its own group and retain supplied content and labels', async () => {
    const workspace = await setup();
    const panel = workspace.querySelector('#a')!;
    const input = panel.querySelector('input')!;
    const label = panel.querySelector('[slot="label"]')!;
    input.value = 'edited';
    const change = vi.fn();
    workspace.addEventListener('workspacechange', change);
    await move(workspace, 'a', { target: 'b', position: 'bottom' });
    const root = snapshot(workspace).root;
    expect(root?.type).toBe('split');
    if (root?.type !== 'split') return;
    expect(root.children[0]).toEqual({
      type: 'split',
      axis: 'vertical',
      weights: [0.5, 0.5],
      children: [
        { type: 'pane', panels: ['b'], active: 'b' },
        { type: 'pane', panels: ['a'], active: 'a' }
      ]
    });
    expect(panel.querySelector('input')).toBe(input);
    expect(panel.querySelector('[slot="label"]')).toBe(label);
    expect(input.value).toBe('edited');
    expect(change).toHaveBeenCalledOnce();
    expect(change.mock.calls[0]![0].detail).toEqual({ value: workspace.value, cause: 'interaction' });
  });

  it('should merge a whole group in its original order and focus its first tab', async () => {
    const workspace = await setup();
    await move(workspace, 'a', { target: 'c', group: true });
    expect(snapshot(workspace).root).toEqual({ type: 'pane', panels: ['c', 'd', 'a', 'b'], active: 'a' });
    expect(workspace.shadowRoot!.activeElement).toBe(control(workspace, '[data-panel="a"]'));
    expect(control(workspace, '[data-panel="a"]').closest('[role="tablist"]')).not.toBeNull();
  });

  it('should move a whole group including its saved delayed panel identities', async () => {
    const initial: WorkspaceLayout = JSON.parse(arrangement);
    if (initial.root?.type !== 'split' || initial.root.children[0]?.type !== 'pane') throw new Error('Invalid fixture');
    initial.root.children[0].panels.push('missing');
    const workspace = await setup(JSON.stringify(initial));
    await move(workspace, 'a', { target: 'c', group: true });
    expect(snapshot(workspace).root).toEqual({ type: 'pane', panels: ['c', 'd', 'a', 'b', 'missing'], active: 'a' });
  });

  it('should reorder with click controls and keep boundary no-ops silent', async () => {
    const workspace = await setup();
    const change = vi.fn();
    workspace.addEventListener('workspacechange', change);
    control(workspace, '[data-move="a"]').click();
    await elementIsStable(workspace);
    control(workspace, '[data-before]').click();
    await elementIsStable(workspace);
    expect(change).not.toHaveBeenCalled();
    control(workspace, '[data-after]').click();
    await elementIsStable(workspace);
    const root = snapshot(workspace).root;
    expect(root?.type === 'split' && root.children[0]).toEqual({ type: 'pane', panels: ['b', 'a'], active: 'a' });
    expect(change).toHaveBeenCalledOnce();
  });

  it('should recover focus on hide and retain input through application snapshot restoration', async () => {
    const workspace = await setup();
    const panel = workspace.querySelector<HTMLElement>('#a')!;
    const input = panel.querySelector('input')!;
    const saved = workspace.value;
    const change = vi.fn();
    workspace.addEventListener('workspacechange', change);
    input.value = 'edited';
    input.focus();
    control(workspace, '[data-close="a"]').click();
    await elementIsStable(workspace);
    expect(panel.isConnected).toBe(true);
    expect(panel.hidden).toBe(false);
    expect(panel.matches(':state(workspace-presented)')).toBe(false);
    expect(getComputedStyle(panel).display).toBe('none');
    expect(workspace.shadowRoot!.activeElement).toBe(control(workspace, '[data-panel="b"]'));
    expect(snapshot(workspace).closed).toEqual(['a']);
    expect(workspace.shadowRoot!.querySelector('.recovery, [data-reopen]')).toBeNull();
    expect(change).toHaveBeenCalledOnce();
    expect(snapshot(workspace).root).toEqual(JSON.parse(saved).root);
    workspace.value = JSON.stringify({ ...snapshot(workspace), closed: [] });
    await elementIsStable(workspace);
    expect(panel.hidden).toBe(false);
    expect(panel.matches(':state(workspace-presented)')).toBe(true);
    expect(panel.querySelector('input')).toBe(input);
    expect(input.value).toBe('edited');
    expect(change).toHaveBeenCalledOnce();
  });

  it('should retain missing identities and selected preference while a panel is removed and restored', async () => {
    const workspace = await setup();
    const before = workspace.value;
    const panel = workspace.querySelector('#a')!;
    const change = vi.fn();
    workspace.addEventListener('workspacechange', change);
    panel.remove();
    await vi.waitFor(() => expect(workspace.shadowRoot!.querySelector('[data-panel="a"]')).toBeNull());
    expect(control(workspace, '[data-panel="b"]').getAttribute('aria-selected')).toBe('true');
    expect(workspace.value).toBe(before);
    workspace.append(panel);
    await vi.waitFor(() => expect(control(workspace, '[data-panel="a"]').getAttribute('aria-selected')).toBe('true'));
    expect(workspace.value).toBe(before);
    expect(change).not.toHaveBeenCalled();
  });

  it('should append a new panel once with a content cause while hidden identities remain hidden', async () => {
    const workspace = await setup();
    control(workspace, '[data-close="a"]').click();
    await elementIsStable(workspace);
    const change = vi.fn();
    workspace.addEventListener('workspacechange', change);
    const panel = document.createElement('nve-workspace-panel');
    panel.id = 'new-panel';
    panel.textContent = 'New content';
    workspace.append(panel);
    await vi.waitFor(() => expect(change).toHaveBeenCalledOnce());
    await elementIsStable(workspace);
    expect(snapshot(workspace).closed).toEqual(['a']);
    expect(workspace.shadowRoot!.querySelector('[data-panel="a"]')).toBeNull();
    expect(control(workspace, '[data-panel="new-panel"]')).toBeDefined();
    expect(change.mock.calls[0]![0].detail).toEqual({ value: workspace.value, cause: 'content' });
    panel.remove();
    await elementIsStable(workspace);
    workspace.append(panel);
    await elementIsStable(workspace);
    expect(change).toHaveBeenCalledOnce();
  });

  it('should keep delayed hidden panels hidden when restoring an all-hidden canonical layout', async () => {
    const workspace = await setup();
    const change = vi.fn();
    workspace.addEventListener('workspacechange', change);
    workspace.value = JSON.stringify({
      version: 1,
      root: { type: 'pane', panels: ['a', 'b', 'c', 'd', 'later'], active: 'later' },
      closed: ['a', 'b', 'c', 'd', 'later']
    });
    await elementIsStable(workspace);
    const panel = document.createElement('nve-workspace-panel');
    panel.id = 'later';
    workspace.append(panel);
    await elementIsStable(workspace);
    expect(snapshot(workspace).closed).toContain('later');
    expect(workspace.shadowRoot!.querySelector('.recovery, [data-reopen]')).toBeNull();
    expect(panel.hidden).toBe(false);
    expect(panel.matches(':state(workspace-presented)')).toBe(false);
    expect(getComputedStyle(panel).display).toBe('none');
    expect(workspace.shadowRoot!.querySelector('[role="tab"]')).toBeNull();
    expect(change).not.toHaveBeenCalled();
  });

  it('should keep group grips drag-only on click', async () => {
    const workspace = await setup();
    const value = workspace.value;
    const grip = control<DragHandle>(workspace, '[data-drag-group="a"]');
    grip.click();
    await elementIsStable(workspace);
    expect(grip.pressed).toBe(false);
    expect(control(workspace, '[data-actions]').matches(':popover-open')).toBe(false);
    expect(workspace.value).toBe(value);
  });

  it('should dismiss the native chooser and restore focus', async () => {
    const workspace = await setup();
    const value = workspace.value;
    const trigger = control(workspace, '[data-move="a"]');
    trigger.focus();
    trigger.click();
    await elementIsStable(workspace);
    const dropdown = control(workspace, '[data-actions]');
    await vi.waitFor(() => expect(dropdown.matches(':popover-open')).toBe(true));
    expect(dropdown.getAttribute('popover')).toBe('auto');
    control(workspace, '[data-cancel]').click();
    await vi.waitFor(() => expect(dropdown.matches(':popover-open')).toBe(false));
    await elementIsStable(workspace);
    expect(workspace.shadowRoot!.activeElement).toBe(trigger);
    expect(workspace.value).toBe(value);
  });

  it('should disable move controls independently of close and resize controls', async () => {
    const workspace = await setup();
    const value = workspace.value;
    workspace.rearrangeable = false;
    await elementIsStable(workspace);
    expect(workspace.shadowRoot!.querySelector('[data-move]')).toBeNull();
    expect(workspace.shadowRoot!.querySelector('[data-close]')).not.toBeNull();
    expect(workspace.shadowRoot!.querySelector('nve-resize-handle')).not.toBeNull();
    expect(workspace.value).toBe(value);
  });
});
