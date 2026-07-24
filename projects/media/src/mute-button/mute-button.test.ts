// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFixture, elementIsStable, emulateClick, removeFixture, untilEvent } from '@internals/testing';
import { mediaCommands } from '../internal/media-command.js';
import { createMediaState, mediaStateChange, type MediaState } from '../internal/media-state.js';
import { MediaMuteButton } from './mute-button.js';
import './define.js';

type MediaStateTarget = HTMLElement & { mediaState: MediaState };

describe(MediaMuteButton.metadata.tag, () => {
  let fixture: HTMLElement;
  let button: MediaMuteButton;
  let target: MediaStateTarget;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-media-mute-button commandfor="target" name="muted" value="true"></nve-media-mute-button>
      <div id="target"></div>
    `);
    button = getElement(fixture, MediaMuteButton.metadata.tag);
    target = getElement(fixture, '#target');
    setMediaState(target, { muted: false });
    await elementIsStable(button);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(MediaMuteButton.metadata.tag)).toBeDefined();
  });

  it('should dispatch the muted command to the target', async () => {
    const event = untilEvent<Event & { command: string }>(target, 'command');
    await emulateClick(button);
    expect((await event).command).toBe(mediaCommands.toggleMuted);
  });

  it('should ignore missing target state', async () => {
    button.commandForElement = null;
    await elementIsStable(button);

    expect(button.checked).toBe(false);
  });

  it('should sync checked state from the target controller', async () => {
    const input = vi.fn();
    const change = vi.fn();
    button.addEventListener('input', input);
    button.addEventListener('change', change);

    setMediaState(target, { muted: true });
    await elementIsStable(button);
    expect(button.checked).toBe(true);

    setMediaState(target, { muted: false });
    await elementIsStable(button);
    expect(button.checked).toBe(false);
    expect(input).not.toHaveBeenCalled();
    expect(change).not.toHaveBeenCalled();
  });

  it('should use i18n strings for the default accessible name', async () => {
    expect(getInternals(button).ariaLabel).toBe('mute media');

    button.i18n = { muteMedia: 'silence recording', unmuteMedia: 'restore recording' };
    await elementIsStable(button);
    expect(getInternals(button).ariaLabel).toBe('silence recording');

    button.checked = true;
    await elementIsStable(button);
    expect(getInternals(button).ariaLabel).toBe('restore recording');
  });

  it('should validate required checked state', async () => {
    button.required = true;
    button.checked = false;
    await elementIsStable(button);

    expect(button.checkValidity()).toBe(false);
    button.checked = true;
    await elementIsStable(button);
    expect(button.checkValidity()).toBe(true);
  });

  it('should expose form control APIs and restore toggle state', async () => {
    const formFixture = await createFixture(html`
      <form>
        <nve-media-mute-button name="muted" value="true" checked required></nve-media-mute-button>
      </form>
    `);
    const form = getElement<HTMLFormElement>(formFixture, 'form');
    const formButton = getElement<MediaMuteButton>(form, MediaMuteButton.metadata.tag);
    await elementIsStable(formButton);

    expect(formButton.form).toBe(form);
    expect(formButton.willValidate).toBe(true);
    expect(formButton.validity.valid).toBe(true);
    expect(formButton.validationMessage).toBe('');
    expect(new FormData(form).get('muted')).toBe('true');

    formButton.checked = false;
    await elementIsStable(formButton);
    expect(formButton.reportValidity()).toBe(false);

    formButton.formStateRestoreCallback('true');
    expect(formButton.checked).toBe(true);
    formButton.formStateRestoreCallback(null);
    expect(formButton.checked).toBe(false);

    formButton.formResetCallback();
    expect(formButton.checked).toBe(true);

    formButton.disabled = true;
    await elementIsStable(formButton);
    expect(new FormData(form).get('muted')).toBe(null);

    removeFixture(formFixture);
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
