// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFixture, elementIsStable, emulateClick, removeFixture, untilEvent } from '@internals/testing';
import { mediaCommands } from '../internal/media-command.js';
import { createMediaState, mediaStateChange, type MediaState } from '../internal/media-state.js';
import { MediaFullscreenButton } from './fullscreen-button.js';
import './define.js';

type MediaStateTarget = HTMLElement & { mediaState: MediaState };

describe(MediaFullscreenButton.metadata.tag, () => {
  let fixture: HTMLElement;
  let button: MediaFullscreenButton;
  let target: MediaStateTarget;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-media-fullscreen-button commandfor="target"></nve-media-fullscreen-button>
      <div id="target"></div>
    `);
    button = getElement(fixture, MediaFullscreenButton.metadata.tag);
    target = getElement(fixture, '#target');
    setMediaState(target, { fullscreen: false });
    await elementIsStable(button);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(MediaFullscreenButton.metadata.tag)).toBeDefined();
    expect(button.type).toBe('button');
  });

  it('should not submit its form by default', async () => {
    const formFixture = await createFixture(html`
      <form>
        <nve-media-fullscreen-button commandfor="form-target"></nve-media-fullscreen-button>
        <div id="form-target"></div>
      </form>
    `);
    const form = getElement<HTMLFormElement>(formFixture, 'form');
    const formButton = getElement<MediaFullscreenButton>(form, MediaFullscreenButton.metadata.tag);
    const submit = vi.fn((event: SubmitEvent) => event.preventDefault());
    form.addEventListener('submit', submit);

    await elementIsStable(formButton);
    await emulateClick(formButton);

    expect(submit).not.toHaveBeenCalled();
    removeFixture(formFixture);
  });

  it('should dispatch the full-screen command to the target', async () => {
    const event = untilEvent<Event & { command: string }>(target, 'command');
    await emulateClick(button);
    expect((await event).command).toBe(mediaCommands.toggleFullscreen);
  });

  it('should sync pressed state from target fullscreen state', async () => {
    setMediaState(target, { fullscreen: true });
    await elementIsStable(button);

    expect(button.pressed).toBe(true);
    expect(getInternals(button).ariaPressed).toBe('true');
  });

  it('should use i18n strings for the default accessible name', async () => {
    expect(getInternals(button).ariaLabel).toBe('enter full screen');

    button.i18n = { enterFullscreen: 'open full screen', exitFullscreen: 'close full screen' };
    await elementIsStable(button);
    expect(getInternals(button).ariaLabel).toBe('open full screen');

    setMediaState(target, { fullscreen: true });
    await elementIsStable(button);
    expect(getInternals(button).ariaLabel).toBe('close full screen');
  });

  it('should ignore missing target state', async () => {
    button.commandForElement = null;
    await elementIsStable(button);

    expect(button.pressed).toBe(false);
  });
});

function getElement<T extends Element>(root: ParentNode, selector: string) {
  const element = root.querySelector<T>(selector);
  expect(element).toBeTruthy();
  return element as T;
}

function getInternals(element: HTMLElement) {
  return (element as HTMLElement & { _internals: ElementInternals })._internals;
}

function setMediaState(target: MediaStateTarget, state: Partial<MediaState>) {
  target.mediaState = createMediaState(state);
  target.dispatchEvent(new CustomEvent(mediaStateChange, { detail: target.mediaState }));
}
