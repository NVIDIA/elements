// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, type ReactiveController } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createFixture, removeFixture } from '@internals/testing';

import { WorkspaceFullscreenController } from './workspace-fullscreen.controller.js';

function createHost() {
  const controllers: ReactiveController[] = [];

  return Object.assign(document.createElement('div'), {
    controllers,
    addController: vi.fn((controller: ReactiveController) => controllers.push(controller)),
    removeController: vi.fn(),
    requestUpdate: vi.fn(),
    updateComplete: Promise.resolve(true),
    fullscreenable: true
  });
}

describe('WorkspaceFullscreenController', () => {
  let fixture: HTMLElement;
  let host: ReturnType<typeof createHost>;
  let controller: WorkspaceFullscreenController;
  let native: Element | null;
  let groups: Record<string, string[]>;
  let delegate: ConstructorParameters<typeof WorkspaceFullscreenController>[1];

  beforeEach(async () => {
    fixture = await createFixture(html`<div></div>`);
    host = createHost();
    fixture.append(host);
    native = null;
    groups = { a: ['a', 'b'], b: ['a', 'b'], c: ['c'] };

    vi.spyOn(document, 'fullscreenEnabled', 'get').mockReturnValue(true);
    const matches = host.matches;

    vi.spyOn(host, 'matches').mockImplementation(selector =>
      selector === ':fullscreen' ? native === host : matches.call(host, selector)
    );
    vi.spyOn(document, 'fullscreenElement', 'get').mockImplementation(() => native);
    vi.spyOn(host, 'requestFullscreen').mockImplementation(async () => {
      native = host;
    });

    vi.spyOn(document, 'exitFullscreen').mockImplementation(async () => {
      native = null;
      document.dispatchEvent(new Event('fullscreenchange'));
    });

    delegate = {
      getGroup: id => groups[id] ?? [],
      cancelInteractions: vi.fn(),
      invalidateCommandAvailability: vi.fn()
    };

    controller = new WorkspaceFullscreenController(host, delegate);
    host.controllers.forEach(registered => registered.hostConnected?.());
  });

  afterEach(async () => {
    host.controllers.forEach(registered => registered.hostDisconnected?.());

    await Promise.all(
      vi
        .mocked(document.exitFullscreen)
        .mock.results.filter(result => result.type === 'return')
        .map(result => result.value)
    );

    vi.restoreAllMocks();
    removeFixture(fixture);
  });

  it('enters fullscreen, switches groups without another native request, and exits', async () => {
    expect(controller.canEnter('missing')).toBe(false);
    expect(controller.canEnter('a')).toBe(true);

    controller.enter('a');
    await vi.waitFor(() => expect(controller.active).toBe(true));

    expect(controller.targetPanelId).toBe('a');
    expect(controller.isSelectedGroup('b')).toBe(true);
    expect(controller.canEnter('b')).toBe(false);

    controller.enter('c');

    expect(host.requestFullscreen).toHaveBeenCalledOnce();
    expect(controller.targetPanelId).toBe('c');

    controller.exit();
    await vi.waitFor(() => expect(controller.canExit).toBe(false));
  });

  it('rejects group entry queries and execution until native exit settles', async () => {
    controller.enter('a');
    await vi.waitFor(() => expect(controller.active).toBe(true));

    const exit = Promise.withResolvers<undefined>();

    vi.mocked(document.exitFullscreen).mockImplementationOnce(async () => {
      await exit.promise;
      native = null;
      document.dispatchEvent(new Event('fullscreenchange'));
    });
    controller.exit();

    try {
      expect(controller.canEnter('c')).toBe(false);
      controller.enter('c');

      expect(controller.targetPanelId).toBe('a');
      expect(host.requestFullscreen).toHaveBeenCalledOnce();
    } finally {
      exit.resolve(undefined);
      await vi.waitFor(() => expect(controller.canExit).toBe(false));
    }

    controller.enter('c');
    await vi.waitFor(() => expect(controller.targetPanelId).toBe('c'));
  });

  it('resets state after a rejected native request', async () => {
    vi.mocked(host.requestFullscreen).mockRejectedValueOnce(new Error('denied'));

    controller.enter('a');
    await vi.waitFor(() => expect(controller.canExit).toBe(false));

    expect(controller.active).toBe(false);
  });

  it('falls back to a surviving group member when the original target disappears', async () => {
    controller.enter('a');
    await vi.waitFor(() => expect(controller.active).toBe(true));

    groups = { b: ['b'] };
    controller.hostUpdate();

    expect(controller.targetPanelId).toBe('b');

    groups = {};
    controller.hostUpdate();
    await vi.waitFor(() => expect(controller.canExit).toBe(false));
  });
});
