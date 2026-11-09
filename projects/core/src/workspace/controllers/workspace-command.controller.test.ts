// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFixture, removeFixture } from '@internals/testing';
import { WorkspaceCommandController } from './workspace-command.controller.js';
import type { WorkspaceLayout } from '../utils/model/layout.utils.js';
import '../define.js';

function createHost() {
  return Object.assign(document.createElement('div'), {
    addController: vi.fn(),
    removeController: vi.fn(),
    requestUpdate: vi.fn(),
    updateComplete: Promise.resolve(true),
    closable: true,
    rearrangeable: true,
    fullscreenable: true
  });
}

describe('WorkspaceCommandController', () => {
  let fixture: HTMLElement;
  let host: ReturnType<typeof createHost>;
  let controller: WorkspaceCommandController;
  let delegate: ConstructorParameters<typeof WorkspaceCommandController>[1];
  const layout: WorkspaceLayout = { version: 1, root: { type: 'group', panels: ['a', 'b'], active: 'a' }, closed: [] };
  beforeEach(async () => {
    fixture = await createFixture(html`<div></div>`);
    host = createHost();
    const panels = ['a', 'b'].map(id => Object.assign(document.createElement('nve-workspace-panel'), { id }));
    host.append(...panels);
    fixture.append(host);
    delegate = {
      getState: () => ({ panels, layout }),
      isRearrangementAllowed: () => true,
      isPlacementAvailable: () => true,
      canEnterFullscreen: () => true,
      canExitFullscreen: () => true,
      isFullscreenGroup: () => false,
      enterFullscreen: vi.fn(),
      exitFullscreen: vi.fn(),
      activatePanel: vi.fn(),
      closePanel: vi.fn(),
      placePanel: vi.fn()
    };
    controller = new WorkspaceCommandController(host, delegate);
    controller.hostConnected();
  });

  afterEach(() => {
    controller.hostDisconnected();
    removeFixture(fixture);
  });

  function command(name: string, value: string, disabled = false) {
    const source = Object.assign(document.createElement('button'), { value, disabled });
    host.dispatchEvent(
      Object.assign(new Event('command', { bubbles: true, cancelable: true }), { command: name, source })
    );
  }

  it('dispatches available selection and close commands to their delegates', () => {
    command('--select', 'b');
    command('--close', 'a');
    expect(delegate.activatePanel).toHaveBeenCalledExactlyOnceWith('b', 'select');
    expect(delegate.closePanel).toHaveBeenCalledExactlyOnceWith('a');
  });

  it('rejects commands from disabled sources', () => {
    command('--close', 'a', true);
    expect(delegate.closePanel).not.toHaveBeenCalled();
  });

  it('rejects commands targeting missing panels', () => {
    command('--close', 'missing');
    expect(delegate.closePanel).not.toHaveBeenCalled();
  });

  it('rejects selecting the already active panel', () => {
    expect(controller.isCommandAvailable('--select', { value: 'a' })).toBe(false);
    command('--select', 'a');
    expect(delegate.activatePanel).not.toHaveBeenCalled();
  });

  it('rejects closing panels when the host is not closable', () => {
    host.closable = false;
    command('--close', 'a');
    expect(delegate.closePanel).not.toHaveBeenCalled();
  });

  it('coalesces availability invalidation and removes command listeners on disconnect', () => {
    const availability = vi.fn();
    host.addEventListener('commandavailabilitychange', availability);
    controller.invalidateAvailability();
    controller.invalidateAvailability();
    controller.flushAvailability();
    controller.flushAvailability();
    expect(availability).toHaveBeenCalledOnce();
    controller.hostDisconnected();
    command('--close', 'a');
    expect(delegate.closePanel).not.toHaveBeenCalled();
  });
});
