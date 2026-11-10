// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createFixture, elementIsStable, removeFixture } from '@internals/testing';

import { NativeFullscreenController } from './native-fullscreen.controller.js';

@customElement('native-fullscreen-controller-test-element')
class NativeFullscreenTestElement extends LitElement {
  readonly changed = vi.fn();
  readonly fullscreen = new NativeFullscreenController(this, this.changed);
}

describe('native fullscreen session', () => {
  let fixture: HTMLElement;
  let element: NativeFullscreenTestElement;
  let fullscreen: Element[];

  function setFullscreen(...elements: Element[]) {
    fullscreen = elements;
    document.dispatchEvent(new Event('fullscreenchange'));
  }

  beforeEach(async () => {
    fixture = await createFixture(
      html`<native-fullscreen-controller-test-element></native-fullscreen-controller-test-element>`
    );
    element = fixture.querySelector<NativeFullscreenTestElement>('native-fullscreen-controller-test-element')!;
    fullscreen = [];

    vi.spyOn(document, 'fullscreenEnabled', 'get').mockReturnValue(true);
    const matches = element.matches;

    vi.spyOn(element, 'matches').mockImplementation(selector =>
      selector === ':fullscreen' ? fullscreen.includes(element) : matches.call(element, selector)
    );
    vi.spyOn(document, 'fullscreenElement', 'get').mockImplementation(() => fullscreen.at(-1) ?? null);
    vi.spyOn(element, 'requestFullscreen').mockImplementation(async () => {
      setFullscreen(...fullscreen, element);
    });

    vi.spyOn(document, 'exitFullscreen').mockImplementation(async () => {
      setFullscreen(...fullscreen.slice(0, -1));
    });

    await elementIsStable(element);
  });

  afterEach(() => {
    setFullscreen();
    removeFixture(fixture);
    vi.restoreAllMocks();
  });

  it('manages a native session without requiring component capability or selection properties', async () => {
    expect(element.fullscreen.canEnter).toBe(true);

    element.fullscreen.enter();
    await elementIsStable(element);

    expect(element.fullscreen.active).toBe(true);
    expect(element.fullscreen.canExit).toBe(true);
    expect(element.requestFullscreen).toHaveBeenCalledOnce();

    element.fullscreen.exit();
    await elementIsStable(element);

    expect(document.exitFullscreen).toHaveBeenCalledOnce();
    expect(element.fullscreen.active).toBe(false);
    expect(element.fullscreen.canExit).toBe(false);
    expect(element.changed).toHaveBeenCalled();
  });

  it('leaves an application-owned native session unmanaged', async () => {
    await element.requestFullscreen();
    await elementIsStable(element);

    expect(document.fullscreenElement).toBe(element);
    expect(element.fullscreen.active).toBe(false);
    expect(element.fullscreen.canExit).toBe(false);
    expect(document.exitFullscreen).not.toHaveBeenCalled();
  });

  it('exits its managed session through the containing shadow root when the document retargets fullscreen', async () => {
    const container = document.createElement('div');

    fixture.append(container);

    const shadow = container.attachShadow({ mode: 'open' });

    shadow.append(element);
    await elementIsStable(element);

    vi.spyOn(shadow, 'fullscreenElement', 'get').mockImplementation(() =>
      fullscreen.includes(element) ? element : null
    );
    vi.spyOn(document, 'fullscreenElement', 'get').mockImplementation(() =>
      fullscreen.includes(element) ? container : null
    );

    element.fullscreen.enter();
    await elementIsStable(element);

    expect(document.fullscreenElement).toBe(container);
    expect(shadow.fullscreenElement).toBe(element);
    expect(element.fullscreen.active).toBe(true);

    element.fullscreen.exit();
    await elementIsStable(element);

    expect(document.exitFullscreen).toHaveBeenCalledOnce();
    expect(element.fullscreen.active).toBe(false);
  });

  it('releases a disconnected managed session when asynchronous browser exit completes', async () => {
    element.fullscreen.enter();
    await elementIsStable(element);

    const exit = Promise.withResolvers<undefined>();

    vi.mocked(document.exitFullscreen).mockReturnValueOnce(exit.promise);
    element.remove();

    expect(document.exitFullscreen).toHaveBeenCalledOnce();

    setFullscreen();
    exit.resolve(undefined);
    await vi.waitFor(() => expect(element.fullscreen.canExit).toBe(false));

    expect(element.fullscreen.active).toBe(false);

    fixture.append(element);
    await elementIsStable(element);

    expect(element.fullscreen.canExit).toBe(false);
    expect(element.fullscreen.canEnter).toBe(true);
  });

  it('blocks admission and coalesces repeated exit while a native exit is pending', async () => {
    element.fullscreen.enter();
    await elementIsStable(element);

    const exit = Promise.withResolvers<undefined>();

    vi.mocked(document.exitFullscreen).mockReturnValueOnce(exit.promise);
    element.fullscreen.exit();
    element.fullscreen.exit();

    try {
      expect(element.fullscreen.canEnter).toBe(false);
      expect(element.fullscreen.canExit).toBe(true);
      expect(document.exitFullscreen).toHaveBeenCalledOnce();
    } finally {
      setFullscreen();
      exit.resolve(undefined);
      await elementIsStable(element);
    }

    expect(element.fullscreen.canEnter).toBe(true);
    expect(element.fullscreen.canExit).toBe(false);
  });

  it('keeps teardown authority until exit settles after native membership has already ended', async () => {
    element.fullscreen.enter();
    await elementIsStable(element);

    const exit = Promise.withResolvers<undefined>();

    vi.mocked(document.exitFullscreen).mockImplementationOnce(async () => {
      setFullscreen();
      await exit.promise;
    });
    element.fullscreen.exit();

    try {
      expect(element.fullscreen.active).toBe(false);
      expect(element.fullscreen.canExit).toBe(true);
      expect(element.fullscreen.canEnter).toBe(false);
    } finally {
      exit.resolve(undefined);
      await vi.waitFor(() => expect(element.fullscreen.canExit).toBe(false));
    }

    expect(element.fullscreen.canEnter).toBe(true);
  });

  it('retains ownership and permits another attempt after a rejected exit', async () => {
    element.fullscreen.enter();
    await elementIsStable(element);
    vi.mocked(document.exitFullscreen).mockRejectedValueOnce(new Error('Exit denied'));

    element.fullscreen.exit();
    await vi.waitFor(() => expect(element.fullscreen.canEnter).toBe(true));

    expect(element.fullscreen.active).toBe(true);
    expect(element.fullscreen.canExit).toBe(true);

    element.fullscreen.exit();
    await vi.waitFor(() => expect(element.fullscreen.canExit).toBe(false));

    expect(document.exitFullscreen).toHaveBeenCalledTimes(2);
  });

  it('retains managed ownership when an application child enters and exits fullscreen', async () => {
    const child = document.createElement('div');

    element.append(child);
    element.fullscreen.enter();
    await elementIsStable(element);

    setFullscreen(element, child);

    expect(document.fullscreenElement).toBe(child);
    expect(element.fullscreen.active).toBe(true);
    expect(element.fullscreen.canExit).toBe(true);

    await document.exitFullscreen();

    expect(document.fullscreenElement).toBe(element);
    expect(element.fullscreen.active).toBe(true);
    expect(element.fullscreen.canExit).toBe(true);
  });

  it('exits nested owned layers while preserving an unrelated outer fullscreen member', async () => {
    const outer = document.createElement('div');
    const child = document.createElement('div');

    fixture.append(outer);
    outer.append(element);
    element.append(child);
    setFullscreen(outer);
    element.fullscreen.enter();
    await elementIsStable(element);
    setFullscreen(outer, element, child);

    element.fullscreen.exit();
    await vi.waitFor(() => expect(element.fullscreen.canExit).toBe(false));

    expect(document.exitFullscreen).toHaveBeenCalledTimes(2);
    expect(document.fullscreenElement).toBe(outer);
  });

  it('continues managed exit when a nested shadow layer retargets to the same exposed host', async () => {
    const child = document.createElement('div');

    const shadowHost = document.createElement('div');

    element.append(shadowHost);
    shadowHost.attachShadow({ mode: 'open' }).append(child);
    element.fullscreen.enter();
    await elementIsStable(element);
    setFullscreen(element, child);
    vi.spyOn(document, 'fullscreenElement', 'get').mockImplementation(() =>
      fullscreen.includes(element) ? element : null
    );

    element.fullscreen.exit();
    await vi.waitFor(() => expect(element.fullscreen.canExit).toBe(false));

    expect(document.exitFullscreen).toHaveBeenCalledTimes(2);
    expect(document.fullscreenElement).toBeNull();
  });

  it('does not unwind an unrelated topmost surface while retaining its managed host', async () => {
    const unrelated = document.createElement('div');

    fixture.append(unrelated);
    element.fullscreen.enter();
    await elementIsStable(element);
    setFullscreen(element, unrelated);

    element.fullscreen.exit();
    await elementIsStable(element);

    expect(document.exitFullscreen).not.toHaveBeenCalled();
    expect(element.fullscreen.canExit).toBe(true);
    expect(element.fullscreen.active).toBe(true);
  });

  it('cleans up admission after a pending request is cancelled', async () => {
    const admission = Promise.withResolvers<undefined>();

    vi.mocked(element.requestFullscreen).mockReturnValueOnce(admission.promise);
    element.fullscreen.enter();

    expect(element.fullscreen.canExit).toBe(true);
    expect(element.fullscreen.active).toBe(false);

    element.fullscreen.exit();
    setFullscreen(element);
    admission.resolve(undefined);
    await elementIsStable(element);

    expect(document.exitFullscreen).toHaveBeenCalledOnce();
    expect(element.fullscreen.canExit).toBe(false);
    expect(element.fullscreen.active).toBe(false);
  });
});
