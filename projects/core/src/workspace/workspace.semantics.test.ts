// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import type { Workspace } from './workspace.js';
import './define.js';

const arrangement = {
  version: 1,
  closed: [],
  root: {
    type: 'split',
    axis: 'horizontal',
    weights: [1, 1],
    children: [
      { type: 'group', panels: ['a', 'b'], active: 'a' },
      { type: 'group', panels: ['c'], active: 'c' }
    ]
  }
};

describe('workspace header semantics', () => {
  let fixture: HTMLElement;

  afterEach(() => removeFixture(fixture));

  async function setup() {
    fixture =
      await createFixture(html`<nve-workspace closable style="width:600px;height:250px" .value=${JSON.stringify(arrangement)}>
      <nve-workspace-panel id="a"><nve-workspace-panel-header>Alpha<button slot="suffix">Alpha action</button></nve-workspace-panel-header><input value="retained"></nve-workspace-panel>
      <nve-workspace-panel id="b"><nve-workspace-panel-header>Beta</nve-workspace-panel-header>Beta content</nve-workspace-panel>
      <nve-workspace-panel id="c"><nve-workspace-panel-header>Gamma</nve-workspace-panel-header>Gamma content</nve-workspace-panel>
    </nve-workspace>`);
    const workspace = fixture.querySelector<Workspace>('nve-workspace')!;
    await elementIsStable(workspace);
    return workspace;
  }

  it('presents a singleton as a named group with a passive title and independent close control', async () => {
    const workspace = await setup();
    const title = workspace.shadowRoot!.querySelector<HTMLElement>('[data-panel="c"]')!;
    const panel = workspace.querySelector('#c')!;
    expect(title.localName).toBe('div');
    expect(title.hasAttribute('tabindex')).toBe(false);
    expect(title.hasAttribute('role')).toBe(false);
    expect(title.hasAttribute('aria-selected')).toBe(false);
    expect(title.closest('nve-tabs')).toBeNull();
    expect(panel.getAttribute('role')).toBe('group');
    expect(panel.getAttribute('aria-label')).toBe('Gamma');
    expect(panel.ariaLabelledByElements ?? []).toEqual([]);
    const close = workspace.shadowRoot!.querySelector<HTMLElement>('[data-close="c"]')!;
    expect(close.tabIndex).toBe(0);
    expect(close.getAttribute('slot')).toBeNull();
    workspace.groupable = true;
    workspace.rearrangeable = true;
    await elementIsStable(workspace);
    expect(workspace.shadowRoot!.querySelector('[data-panel="c"]')).toBe(title);
    expect(title.closest('nve-tabs')).toBeNull();
  });

  it('keeps pointer clicks on singleton titles passive', async () => {
    const workspace = await setup();
    workspace.rearrangeable = true;
    await elementIsStable(workspace);
    const value = workspace.value;
    const change = vi.fn();
    workspace.addEventListener('workspacechange', change);
    await userEvent.click(workspace.shadowRoot!.querySelector<HTMLElement>('[data-panel="c"]')!);
    await elementIsStable(workspace);
    expect(workspace.querySelector('#c')!.shadowRoot!.activeElement).toBeNull();
    expect(workspace.value).toBe(value);
    expect(change).not.toHaveBeenCalled();
  });

  it('retains real tab relationships for existing groups without grouping or rearrangement permission', async () => {
    const workspace = await setup();
    const tab = workspace.shadowRoot!.querySelector<HTMLElement>('nve-tabs-item[data-panel="a"]')!;
    const panel = workspace.querySelector('#a')!;
    expect(workspace.groupable).toBe(false);
    expect(workspace.rearrangeable).toBe(false);
    expect(tab.closest('nve-tabs')).not.toBeNull();
    expect(tab.ariaControlsElements).toEqual([panel]);
    expect(panel.getAttribute('role')).toBe('tabpanel');
    expect(panel.getAttribute('aria-label')).toBe('Alpha');
  });

  it('moves focus from a surviving tab to its body when an inactive companion closes', async () => {
    const workspace = await setup();
    const tab = workspace.shadowRoot!.querySelector<HTMLElement>('[data-panel="a"]')!;
    tab.focus();
    workspace.querySelector('#b')!.dispatchEvent(new CommandEvent('command', { command: '--close' }));
    await elementIsStable(workspace);
    const panel = workspace.querySelector('#a')!;
    await vi.waitFor(() => expect(panel.shadowRoot!.activeElement).toBe(panel.shadowRoot!.querySelector('.body')));
    expect(panel.getAttribute('role')).toBe('group');
    expect(panel.ariaLabelledByElements ?? []).toEqual([]);
    expect(workspace.querySelector('#b')!.ariaLabelledByElements ?? []).toEqual([]);
  });

  it('recovers focused tab semantics after silent value restoration leaves one open member', async () => {
    const workspace = await setup();
    const tab = workspace.shadowRoot!.querySelector<HTMLElement>('[data-panel="a"]')!;
    tab.focus();
    const changed = vi.fn();
    workspace.addEventListener('workspacechange', changed);
    workspace.value = JSON.stringify({ ...arrangement, closed: ['b'] });
    await elementIsStable(workspace);
    const panel = workspace.querySelector('#a')!;
    await vi.waitFor(() => expect(panel.shadowRoot!.activeElement).toBe(panel.shadowRoot!.querySelector('.body')));
    expect(panel.getAttribute('role')).toBe('group');
    expect(panel.ariaLabelledByElements ?? []).toEqual([]);
    expect(changed).not.toHaveBeenCalled();
  });

  it('recovers the same panel when a focused group is split into differently ordered singletons', async () => {
    const workspace = await setup();
    workspace.shadowRoot!.querySelector<HTMLElement>('[data-panel="a"]')!.focus();
    workspace.value = JSON.stringify({
      version: 1,
      closed: [],
      root: {
        type: 'split',
        axis: 'horizontal',
        weights: [1, 1, 1],
        children: ['b', 'a', 'c'].map(id => ({ type: 'group', panels: [id], active: id }))
      }
    });
    await elementIsStable(workspace);
    const panel = workspace.querySelector('#a')!;
    await vi.waitFor(() => expect(panel.shadowRoot!.activeElement).toBe(panel.shadowRoot!.querySelector('.body')));
    expect(workspace.querySelector('#b')!.shadowRoot!.activeElement).toBeNull();
  });

  it('retains close-control focus when its panel changes from tabbed to singleton', async () => {
    const workspace = await setup();
    workspace.shadowRoot!.querySelector<HTMLElement>('[data-close="a"]')!.focus();
    workspace.value = JSON.stringify({ ...arrangement, closed: ['b'] });
    await elementIsStable(workspace);
    expect(workspace.shadowRoot!.activeElement).toBe(workspace.shadowRoot!.querySelector('[data-close="a"]'));
  });

  it('recovers to surviving content when restoration removes the focused close control', async () => {
    const workspace = await setup();
    workspace.shadowRoot!.querySelector<HTMLElement>('[data-close="b"]')!.focus();
    workspace.value = JSON.stringify({ ...arrangement, closed: ['b'] });
    await elementIsStable(workspace);
    const panel = workspace.querySelector('#a')!;
    await vi.waitFor(() => expect(panel.shadowRoot!.activeElement).toBe(panel.shadowRoot!.querySelector('.body')));
    expect(workspace.shadowRoot!.activeElement).not.toBe(workspace.shadowRoot!.querySelector('[data-close="a"]'));
  });

  it('preserves focused application content when closing a companion and restoring its group', async () => {
    const workspace = await setup();
    const input = workspace.querySelector<HTMLInputElement>('#a input')!;
    input.focus();
    workspace.querySelector('#b')!.dispatchEvent(new CommandEvent('command', { command: '--close' }));
    await elementIsStable(workspace);
    expect(document.activeElement).toBe(input);
    workspace.value = JSON.stringify(arrangement);
    await elementIsStable(workspace);
    expect(document.activeElement).toBe(input);
    expect(workspace.querySelector('#a')!.getAttribute('role')).toBe('tabpanel');
  });

  it('preserves focused suffix controls while silently changing group presentation', async () => {
    const workspace = await setup();
    const action = workspace.querySelector<HTMLButtonElement>('#a button')!;
    action.focus();
    workspace.value = JSON.stringify({ ...arrangement, closed: ['b'] });
    await elementIsStable(workspace);
    expect(document.activeElement).toBe(action);
    workspace.value = JSON.stringify(arrangement);
    await elementIsStable(workspace);
    expect(document.activeElement).toBe(action);
  });

  it('preserves an external invoker focus when closing an inactive companion', async () => {
    const workspace = await setup();
    const invoker = document.createElement('button');
    invoker.textContent = 'Close Beta';
    fixture.append(invoker);
    invoker.focus();
    workspace.querySelector('#b')!.dispatchEvent(new CommandEvent('command', { command: '--close' }));
    await elementIsStable(workspace);
    expect(document.activeElement).toBe(invoker);
    expect(workspace.querySelector('#a')!.getAttribute('role')).toBe('group');
  });
});
