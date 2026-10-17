// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import type { Workspace } from './workspace.js';
import './define.js';

const initial = JSON.stringify({
  version: 1,
  closed: [],
  root: {
    type: 'split',
    axis: 'horizontal',
    weights: [1, 2],
    children: [
      { type: 'group', panels: ['a', 'companion'], active: 'a' },
      { type: 'group', panels: ['b'], active: 'b' }
    ]
  }
});

describe('workspace group fullscreen', () => {
  let fixture: HTMLElement;
  let native: Element | null;

  afterEach(() => {
    removeFixture(fixture);
    vi.restoreAllMocks();
  });

  async function setup() {
    fixture = await createFixture(
      html`<nve-workspace groupable rearrangeable resizable closable style="width:700px;height:300px" .value=${initial}>${['a', 'companion', 'b'].map(id => html`<nve-workspace-panel id=${id}><nve-workspace-panel-header>${id}</nve-workspace-panel-header><input .value=${id}></nve-workspace-panel>`)}</nve-workspace>`
    );
    const workspace = fixture.querySelector<Workspace>('nve-workspace')!;
    await elementIsStable(workspace);
    native = null;
    vi.spyOn(document, 'fullscreenElement', 'get').mockImplementation(() => native);
    const request = vi.spyOn(workspace, 'requestFullscreen').mockImplementation(async () => {
      native = workspace;
      document.dispatchEvent(new Event('fullscreenchange'));
    });
    const exit = vi.spyOn(document, 'exitFullscreen').mockImplementation(async () => {
      native = null;
      document.dispatchEvent(new Event('fullscreenchange'));
    });
    const saved = workspace.value;
    const changed = vi.fn();
    workspace.addEventListener('workspacechange', changed);
    return { workspace, request, exit, changed, saved };
  }

  async function invoke(workspace: Workspace, command: string, id = 'a') {
    workspace.querySelector(`#${id}`)!.dispatchEvent(new CommandEvent('command', { command }));
    await elementIsStable(workspace);
  }

  it('reports fullscreen availability without requesting browser admission', async () => {
    const { workspace, request, changed } = await setup();
    expect(workspace.isCommandAvailable('--enter-fullscreen', { value: 'a' })).toBe(true);
    expect(workspace.isCommandAvailable('--toggle-fullscreen', { value: 'a' })).toBe(true);
    expect(workspace.isCommandAvailable('--exit-fullscreen', { value: 'a' })).toBe(false);
    vi.spyOn(document, 'fullscreenEnabled', 'get').mockReturnValue(false);
    expect(workspace.isCommandAvailable('--enter-fullscreen', { value: 'a' })).toBe(false);
    expect(workspace.isCommandAvailable('--toggle-fullscreen', { value: 'a' })).toBe(false);
    expect(request).not.toHaveBeenCalled();
    expect(changed).not.toHaveBeenCalled();
  });

  it('admits a whole group synchronously without altering its arrangement and restores the current layout on browser exit', async () => {
    const { workspace, request, changed, saved } = await setup();
    const input = workspace.querySelector('#a input');
    await invoke(workspace, '--enter-fullscreen');
    expect(request).toHaveBeenCalledOnce();
    expect(workspace.isCommandAvailable('--enter-fullscreen', { value: 'a' })).toBe(false);
    expect(workspace.isCommandAvailable('--enter-fullscreen', { value: 'b' })).toBe(true);
    expect(workspace.isCommandAvailable('--exit-fullscreen', { value: 'a' })).toBe(true);
    expect(
      workspace.isCommandAvailable('--place', {
        value: 'a',
        placement: { operation: 'split', target: 'b', position: 'left' }
      })
    ).toBe(false);
    expect(workspace.shadowRoot!.querySelectorAll('[data-panel]')).toHaveLength(2);
    expect(workspace.shadowRoot!.querySelector('nve-resize-handle')).toBeNull();
    expect(workspace.shadowRoot!.querySelector('.fullscreen-exit')).not.toBeNull();
    expect(workspace.value).toBe(saved);
    expect(changed).not.toHaveBeenCalled();
    native = null;
    document.dispatchEvent(new Event('fullscreenchange'));
    await elementIsStable(workspace);
    expect(workspace.shadowRoot!.querySelectorAll('[data-panel]')).toHaveLength(3);
    expect(workspace.querySelector('#a input')).toBe(input);
    expect(workspace.value).toBe(saved);
    expect(changed).not.toHaveBeenCalled();
  });

  it('leaves the normal arrangement visible after failed admission', async () => {
    const { workspace, request, changed, saved } = await setup();
    request.mockRejectedValueOnce(new Error('Denied'));
    await invoke(workspace, '--toggle-fullscreen');
    expect(workspace.shadowRoot!.querySelectorAll('[data-panel]')).toHaveLength(3);
    expect(workspace.shadowRoot!.querySelector('.fullscreen-exit')).toBeNull();
    expect(workspace.value).toBe(saved);
    expect(changed).not.toHaveBeenCalled();
  });

  it('exits an admission that arrives after a pending request was cancelled', async () => {
    const { workspace, request, exit, changed, saved } = await setup();
    let admit: (() => void) | undefined;
    request.mockImplementationOnce(
      () =>
        new Promise<void>(resolve => {
          admit = () => {
            native = workspace;
            document.dispatchEvent(new Event('fullscreenchange'));
            resolve();
          };
        })
    );
    expect(workspace.isCommandAvailable('--enter-fullscreen', { value: 'a' })).toBe(true);
    await invoke(workspace, '--enter-fullscreen');
    expect(workspace.isCommandAvailable('--enter-fullscreen', { value: 'a' })).toBe(false);
    expect(workspace.isCommandAvailable('--exit-fullscreen', { value: 'a' })).toBe(true);
    await invoke(workspace, '--exit-fullscreen');
    expect(workspace.isCommandAvailable('--exit-fullscreen', { value: 'a' })).toBe(false);
    admit?.();
    await elementIsStable(workspace);
    expect(exit).toHaveBeenCalledOnce();
    expect(workspace.shadowRoot!.querySelector('.fullscreen-exit')).toBeNull();
    expect(workspace.value).toBe(saved);
    expect(changed).not.toHaveBeenCalled();
  });

  it('announces pending fullscreen admission and rejection independently of the arrangement', async () => {
    const { workspace, request, changed } = await setup();
    let reject: (() => void) | undefined;
    request.mockImplementationOnce(
      () =>
        new Promise<void>((_, fail) => {
          reject = () => fail(new Error('Denied'));
        })
    );
    const availability = vi.fn();
    workspace.addEventListener('commandavailabilitychange', availability);
    await invoke(workspace, '--enter-fullscreen');
    expect(availability).toHaveBeenCalled();
    expect(workspace.isCommandAvailable('--exit-fullscreen', { value: 'a' })).toBe(true);
    availability.mockClear();
    reject?.();
    await elementIsStable(workspace);
    expect(availability).toHaveBeenCalled();
    expect(workspace.isCommandAvailable('--enter-fullscreen', { value: 'a' })).toBe(true);
    expect(changed).not.toHaveBeenCalled();
  });

  it('announces logical group switches without another native fullscreen request', async () => {
    const { workspace, request, changed } = await setup();
    await invoke(workspace, '--enter-fullscreen');
    const availability = vi.fn();
    workspace.addEventListener('commandavailabilitychange', availability);
    await invoke(workspace, '--enter-fullscreen', 'b');
    expect(availability).toHaveBeenCalled();
    expect(request).toHaveBeenCalledOnce();
    expect(workspace.isCommandAvailable('--enter-fullscreen', { value: 'b' })).toBe(false);
    expect(workspace.isCommandAvailable('--enter-fullscreen', { value: 'a' })).toBe(true);
    expect(changed).not.toHaveBeenCalled();
    availability.mockClear();
    await invoke(workspace, '--exit-fullscreen', 'b');
    expect(availability).toHaveBeenCalled();
  });

  it('exits when the supplied anchor is removed while companions remain', async () => {
    const { workspace, exit } = await setup();
    await invoke(workspace, '--enter-fullscreen');
    workspace.querySelector('#a')!.remove();
    await elementIsStable(workspace);
    expect(exit).toHaveBeenCalledOnce();
    expect(workspace.shadowRoot!.querySelector('.fullscreen-exit')).toBeNull();
    expect(workspace.querySelector('#companion')).not.toBeNull();
  });

  it('keeps a surviving companion fullscreen then exits when its last view closes', async () => {
    const { workspace, exit } = await setup();
    await invoke(workspace, '--enter-fullscreen');
    await invoke(workspace, '--close');
    expect(exit).not.toHaveBeenCalled();
    expect(workspace.shadowRoot!.querySelector('[data-panel="companion"]')).not.toBeNull();
    await invoke(workspace, '--close', 'companion');
    expect(exit).toHaveBeenCalledOnce();
  });
});
