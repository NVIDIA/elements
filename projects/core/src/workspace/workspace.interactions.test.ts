// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { Workspace } from './workspace.js';
import type { DragHandle } from '@nvidia-elements/core/drag-handle';
import type { WorkspaceLayout } from './utils/workspace-layout.utils.js';
import './define.js';

const arrangement = JSON.stringify({
  version: 1,
  closed: [],
  root: {
    type: 'split',
    axis: 'horizontal',
    weights: [1, 1],
    children: [
      { type: 'group', panels: ['a', 'b'], active: 'a' },
      { type: 'group', panels: ['c', 'd'], active: 'c' }
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
      <nve-workspace style="width:806px;height:320px" groupable rearrangeable closable resizable .value=${value}>
        <nve-workspace-panel id="a"><nve-workspace-panel-header>Alpha</nve-workspace-panel-header><input value="retained" /></nve-workspace-panel>
        <nve-workspace-panel id="b"><nve-workspace-panel-header>Beta</nve-workspace-panel-header>Content B</nve-workspace-panel>
        <nve-workspace-panel id="c"><nve-workspace-panel-header>Gamma</nve-workspace-panel-header>Content C</nve-workspace-panel>
        <nve-workspace-panel id="d"><nve-workspace-panel-header>Delta</nve-workspace-panel-header>Content D</nve-workspace-panel>
      </nve-workspace>
    `);
    const workspace = fixture.querySelector<Workspace>('nve-workspace')!;
    await elementIsStable(workspace);
    return workspace;
  }

  function control<T extends HTMLElement = HTMLElement>(workspace: Workspace, selector: string): T {
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
    const sourceElement = document.createElement('button');
    const placement =
      position === 'tab'
        ? { operation: 'join', target, source: group ? 'group' : 'panel' }
        : { operation: 'split', target, position, source: group ? 'group' : 'panel' };
    Object.assign(sourceElement, { placement });
    workspace
      .querySelector(`#${source}`)!
      .dispatchEvent(new CommandEvent('command', { command: '--place', source: sourceElement }));
    await elementIsStable(workspace);
  }

  it('should split a tab from its own group and retain supplied content and labels', async () => {
    const workspace = await setup();
    const panel = workspace.querySelector('#a')!;
    const input = panel.querySelector('input')!;
    const label = panel.querySelector('nve-workspace-panel-header')!;
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
        { type: 'group', panels: ['b'], active: 'b' },
        { type: 'group', panels: ['a'], active: 'a' }
      ]
    });
    expect(panel.querySelector('input')).toBe(input);
    expect(panel.querySelector('nve-workspace-panel-header')).toBe(label);
    expect(input.value).toBe('edited');
    expect(change).toHaveBeenCalledOnce();
    expect(change.mock.calls[0]![0].detail).toEqual({ value: workspace.value, cause: 'interaction' });
  });

  it('should merge a whole group in its original order and focus its first tab', async () => {
    const workspace = await setup();
    await move(workspace, 'a', { target: 'c', group: true });
    expect(snapshot(workspace).root).toEqual({ type: 'group', panels: ['c', 'd', 'a', 'b'], active: 'a' });
    expect(workspace.shadowRoot!.activeElement).toBe(control(workspace, '[data-panel="a"]'));
    expect(control(workspace, '[data-panel="a"]').closest('nve-tabs')).not.toBeNull();
  });

  it('should move a whole group including its saved delayed panel identities', async () => {
    const initial: WorkspaceLayout = JSON.parse(arrangement);
    if (initial.root?.type !== 'split' || initial.root.children[0]?.type !== 'group')
      throw new Error('Invalid fixture');
    initial.root.children[0].panels.push('missing');
    const workspace = await setup(JSON.stringify(initial));
    await move(workspace, 'a', { target: 'c', group: true });
    expect(snapshot(workspace).root).toEqual({ type: 'group', panels: ['c', 'd', 'a', 'b', 'missing'], active: 'a' });
  });

  it.each(['Enter', 'Space'])('should close an inactive tab with %s without activating it', async key => {
    const workspace = await setup();
    const tab = control(workspace, '[data-panel="b"]');
    const close = control(workspace, '[data-close="b"]');
    const click = vi.fn();
    const change = vi.fn();
    tab.addEventListener('click', click);
    workspace.addEventListener('workspacechange', change);
    close.focus();

    await userEvent.keyboard(`{${key}>}`);
    expect(tab.matches(':state(active)')).toBe(false);
    await userEvent.keyboard(`{/${key}}`);
    await elementIsStable(workspace);

    expect(click).not.toHaveBeenCalled();
    expect(change).toHaveBeenCalledOnce();
    expect(snapshot(workspace).closed).toEqual(['b']);
    expect(workspace.querySelector('#a')!.getAttribute('aria-hidden')).toBe('false');
    expect(workspace.querySelector('#a')!.shadowRoot!.activeElement).toBe(
      workspace.querySelector('#a')!.shadowRoot!.querySelector('.body')
    );
  });

  it('should recover focus on close and retain input through application snapshot restoration', async () => {
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
    expect(workspace.querySelector('#b')!.shadowRoot!.activeElement).toBe(
      workspace.querySelector('#b')!.shadowRoot!.querySelector('.body')
    );
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
    expect(workspace.querySelector('#b')!.getAttribute('aria-hidden')).toBe('false');
    expect(workspace.querySelector('#b')!.getAttribute('role')).toBe('group');
    expect(workspace.value).toBe(before);
    workspace.append(panel);
    await vi.waitFor(() => expect(control(workspace, '[data-panel="a"]').hasAttribute('selected')).toBe(true));
    expect(workspace.value).toBe(before);
    expect(change).not.toHaveBeenCalled();
  });

  it('should append a new panel once with a content cause while closed identities remain closed', async () => {
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

  it('should keep delayed closed panels closed when restoring an all-closed layout', async () => {
    const workspace = await setup();
    const change = vi.fn();
    workspace.addEventListener('workspacechange', change);
    workspace.value = JSON.stringify({
      version: 1,
      root: { type: 'group', panels: ['a', 'b', 'c', 'd', 'later'], active: 'later' },
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
    expect(workspace.shadowRoot!.querySelector('nve-tabs-item[data-panel]')).toBeNull();
    expect(change).not.toHaveBeenCalled();
  });

  it('should keep group grips drag-only on click', async () => {
    const workspace = await setup();
    const value = workspace.value;
    const grip = control<DragHandle>(workspace, '[data-drag-group="a"]');
    grip.click();
    await elementIsStable(workspace);
    expect(grip.pressed).toBe(false);
    expect(workspace.value).toBe(value);
  });

  it('should disable dragging independently of close and resize controls', async () => {
    const workspace = await setup();
    const value = workspace.value;
    workspace.rearrangeable = false;
    await elementIsStable(workspace);
    expect(workspace.shadowRoot!.querySelector('[data-drag-group]')).toBeNull();
    expect(workspace.shadowRoot!.querySelector('[data-close]')).not.toBeNull();
    expect(workspace.shadowRoot!.querySelector('nve-resize-handle')).not.toBeNull();
    expect(workspace.value).toBe(value);
  });
});
