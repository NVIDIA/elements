// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createFixture, elementIsStable, removeFixture } from '@internals/testing';

import { DashboardFullscreenController } from './fullscreen.controller.js';

class FullscreenTestHost extends LitElement {
  fullscreenable = true;
  readonly available = new Set(['a', 'b']);
  readonly cancel = vi.fn();
  readonly availability = vi.fn();
  readonly fullscreen = new DashboardFullscreenController(this, {
    hasPanel: id => this.available.has(id),
    cancelInteractions: this.cancel,
    invalidateCommandAvailability: this.availability
  });
}

const tag = 'dashboard-fullscreen-test-host';
customElements.define(tag, FullscreenTestHost);

describe('DashboardFullscreenController', () => {
  let fixture: HTMLElement | undefined;
  let host: FullscreenTestHost;
  let native: Element | null;

  beforeEach(async () => {
    fixture = await createFixture(html`<dashboard-fullscreen-test-host></dashboard-fullscreen-test-host>`);

    host = fixture.querySelector<FullscreenTestHost>(tag)!;

    native = null;
    vi.spyOn(document, 'fullscreenEnabled', 'get').mockReturnValue(true);
    const matches = host.matches;

    vi.spyOn(host, 'matches').mockImplementation(selector =>
      selector === ':fullscreen' ? native === host : matches.call(host, selector)
    );
    vi.spyOn(document, 'fullscreenElement', 'get').mockImplementation(() => native);
    vi.spyOn(host, 'requestFullscreen').mockImplementation(async () => {
      native = host;
      document.dispatchEvent(new Event('fullscreenchange'));
    });
    vi.spyOn(document, 'exitFullscreen').mockImplementation(async () => {
      native = null;
      document.dispatchEvent(new Event('fullscreenchange'));
    });
    await elementIsStable(host);
  });

  afterEach(() => {
    if (fixture) {
      removeFixture(fixture);
    }

    vi.restoreAllMocks();
  });

  it('gates entry by capability and membership without requesting native admission', () => {
    expect(host.fullscreen.canEnter('a')).toBe(true);
    expect(host.fullscreen.canEnter('missing')).toBe(false);

    host.fullscreenable = false;

    expect(host.fullscreen.canEnter('a')).toBe(false);

    host.fullscreen.enter('missing');

    expect(host.requestFullscreen).not.toHaveBeenCalled();
    expect(host.cancel).not.toHaveBeenCalled();
  });

  it('switches selected panels within one native session and retains exit after entry is disabled', async () => {
    host.fullscreen.enter('a');
    await elementIsStable(host);

    expect(host.fullscreen.targetPanelId).toBe('a');

    host.fullscreen.enter('b');

    expect(host.fullscreen.targetPanelId).toBe('b');
    expect(host.requestFullscreen).toHaveBeenCalledOnce();
    expect(host.cancel).toHaveBeenCalledTimes(2);

    host.fullscreenable = false;

    expect(host.fullscreen.canExit).toBe(true);
    expect(host.fullscreen.canEnter('a')).toBe(false);

    host.fullscreen.exit();
    await elementIsStable(host);

    expect(host.fullscreen.targetPanelId).toBeUndefined();
    expect(host.fullscreen.canExit).toBe(false);
  });

  it('rejects both entry queries and execution while native exit is pending', async () => {
    host.fullscreen.enter('a');
    await elementIsStable(host);

    const exit = Promise.withResolvers<undefined>();

    vi.mocked(document.exitFullscreen).mockImplementationOnce(async () => {
      await exit.promise;
      native = null;
      document.dispatchEvent(new Event('fullscreenchange'));
    });
    host.fullscreen.exit();

    try {
      expect(host.fullscreen.canEnter('b')).toBe(false);
      host.fullscreen.enter('b');

      expect(host.fullscreen.targetPanelId).toBe('a');
      expect(host.requestFullscreen).toHaveBeenCalledOnce();
    } finally {
      exit.resolve(undefined);
      await vi.waitFor(() => expect(host.fullscreen.canExit).toBe(false));
    }

    host.fullscreen.enter('b');
    await elementIsStable(host);

    expect(host.fullscreen.targetPanelId).toBe('b');
  });

  it('exits when its selected panel disappears rather than selecting an available replacement', async () => {
    host.fullscreen.enter('a');
    await elementIsStable(host);

    host.available.delete('a');
    host.requestUpdate();
    await elementIsStable(host);

    expect(document.exitFullscreen).toHaveBeenCalledOnce();
    expect(host.fullscreen.targetPanelId).toBeUndefined();
    expect(host.available.has('b')).toBe(true);
  });

  it('clears selection after rejected admission and allows a fresh selection', async () => {
    vi.mocked(host.requestFullscreen).mockRejectedValueOnce(new Error('Admission denied'));
    host.fullscreen.enter('a');
    await elementIsStable(host);

    expect(host.fullscreen.canExit).toBe(false);
    expect(host.fullscreen.isSelectedPanel('a')).toBe(false);
    expect(host.fullscreen.canEnter('a')).toBe(true);

    host.fullscreen.enter('b');
    await elementIsStable(host);

    expect(host.fullscreen.targetPanelId).toBe('b');
  });
});
