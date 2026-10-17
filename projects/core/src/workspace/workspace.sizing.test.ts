// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import type { Workspace } from './workspace.js';
import type { WorkspacePanel } from './workspace-panel.js';
import './define.js';

const rows = JSON.stringify({
  version: 1,
  closed: [],
  root: {
    type: 'split',
    axis: 'vertical',
    weights: [1, 1],
    children: ['a', 'b'].map(id => ({ type: 'group', panels: [id], active: id }))
  }
});

describe('workspace measured sizing', () => {
  let fixture: HTMLElement;

  afterEach(() => {
    removeFixture(fixture);
    vi.restoreAllMocks();
  });

  async function setup(value = '') {
    fixture = await createFixture(html`
      <nve-workspace rearrangeable closable .value=${value} style="width:260px;height:180px">
        <nve-workspace-panel id="a">
          <nve-workspace-panel-header>Alpha</nve-workspace-panel-header>
          <input value="persistent" />
        </nve-workspace-panel>
        <nve-workspace-panel id="b"> <nve-workspace-panel-header>Beta</nve-workspace-panel-header>Beta content</nve-workspace-panel>
      </nve-workspace>
    `);
    const workspace = fixture.querySelector<Workspace>('nve-workspace')!;
    await elementIsStable(workspace);
    return workspace;
  }

  it('fills a start-aligned column while honoring an explicit width', async () => {
    const workspace = await setup();
    fixture.style.cssText = 'display:flex;flex-direction:column;align-items:start;width:600px';
    workspace.style.removeProperty('width');
    await vi.waitFor(() => expect(workspace.offsetWidth).toBe(600));
    fixture.style.width = '480px';
    await vi.waitFor(() => expect(workspace.offsetWidth).toBe(480));
    workspace.style.width = '260px';
    await vi.waitFor(() => expect(workspace.offsetWidth).toBe(260));
    expect(workspace.offsetHeight).toBe(180);
  });

  it('responds to direct requirement changes without changing canonical state or application nodes', async () => {
    const workspace = await setup(rows);
    const a = workspace.querySelector<WorkspacePanel>('#a')!;
    const b = workspace.querySelector<WorkspacePanel>('#b')!;
    expect(a.minWidth).toBe(0);
    expect(a.minHeight).toBe(0);
    const saved = workspace.value;
    const input = a.querySelector('input')!;
    const change = vi.fn();
    workspace.addEventListener('workspacechange', change);
    a.minHeight = 110;
    b.minHeight = 110;
    await vi.waitFor(() => expect(workspace.shadowRoot!.querySelector<HTMLElement>('.canvas')!.offsetHeight).toBe(226));
    expect(a.getAttribute('min-height')).toBe('110');
    workspace.style.height = '300px';
    await vi.waitFor(() => expect(workspace.shadowRoot!.querySelector<HTMLElement>('.canvas')!.offsetHeight).toBe(300));
    expect(workspace.value).toBe(saved);
    expect(change).not.toHaveBeenCalled();
    expect(a.querySelector('input')).toBe(input);
  });

  it('settles fractional container sizing without scrollbar-driven updates', async () => {
    const workspace = await setup();
    const viewport = workspace.shadowRoot!.querySelector<HTMLElement>('.viewport')!;
    const canvas = workspace.shadowRoot!.querySelector<HTMLElement>('.canvas')!;
    const scrollbars = document.createElement('style');
    scrollbars.textContent = '.viewport::-webkit-scrollbar { display: block; width: 15px; height: 15px; }';
    workspace.shadowRoot!.append(scrollbars);
    const requestUpdate = workspace.requestUpdate.bind(workspace);
    let updates = 0;
    vi.spyOn(workspace, 'requestUpdate').mockImplementation((...args) => {
      // Disconnect a runaway fixture so the regression fails without freezing the runner.
      if (++updates === 25) workspace.remove();
      return requestUpdate(...args);
    });
    workspace.style.width = '260.625px';
    workspace.value = JSON.stringify({
      version: 1,
      closed: ['b'],
      root: { type: 'group', panels: ['a', 'b'], active: 'b' }
    });
    const saved = workspace.value;
    const changed = vi.fn();
    workspace.addEventListener('workspacechange', changed);
    await elementIsStable(workspace);
    expect(workspace.isConnected).toBe(true);
    expect(updates).toBeLessThan(25);
    expect(canvas.offsetWidth).toBe(viewport.clientWidth);
    expect(canvas.offsetHeight).toBe(viewport.clientHeight);
    expect(viewport.scrollWidth).toBe(viewport.clientWidth);
    expect(viewport.scrollHeight).toBe(viewport.clientHeight);
    expect(workspace.value).toBe(saved);
    expect(changed).not.toHaveBeenCalled();
  });

  it('admits a repairing join and rejects another vertical split while constrained', async () => {
    const workspace = await setup(rows);
    for (const panel of workspace.querySelectorAll<WorkspacePanel>('nve-workspace-panel')) panel.minHeight = 110;
    await vi.waitFor(() => expect(workspace.shadowRoot!.querySelector<HTMLElement>('.canvas')!.offsetHeight).toBe(226));
    const changed = vi.fn();
    workspace.addEventListener('workspacechange', changed);
    const source = document.createElement('button');
    Object.assign(source, { placement: { operation: 'join', target: 'b' } });
    workspace.querySelector('#a')!.dispatchEvent(new CommandEvent('command', { command: '--place', source }));
    await elementIsStable(workspace);
    expect(workspace.shadowRoot!.querySelectorAll('nve-tabs.tab-track')).toHaveLength(1);
    expect(changed).toHaveBeenCalledOnce();
    const joined = workspace.value;
    Object.assign(source, { placement: { operation: 'split', target: 'b', position: 'top' } });
    workspace.querySelector('#a')!.dispatchEvent(new CommandEvent('command', { command: '--place', source }));
    await elementIsStable(workspace);
    expect(workspace.value).toBe(joined);
    expect(changed).toHaveBeenCalledOnce();
  });
});
