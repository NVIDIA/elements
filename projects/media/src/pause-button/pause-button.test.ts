// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFixture, elementIsStable, emulateClick, removeFixture, untilEvent } from '@internals/testing';
import { mediaCommands } from '../internal/media-command.js';
import { createMediaState, mediaStateChange, type MediaState } from '../internal/media-state.js';
import { MediaPauseButton } from './pause-button.js';
import './define.js';

type MediaStateTarget = HTMLElement & { mediaState: MediaState };

describe(MediaPauseButton.metadata.tag, () => {
  let fixture: HTMLElement;
  let button: MediaPauseButton;
  let target: MediaStateTarget;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-media-pause-button commandfor="target" name="paused" value="true"></nve-media-pause-button>
      <div id="target"></div>
    `);
    button = getElement(fixture, MediaPauseButton.metadata.tag);
    target = getElement(fixture, '#target');
    setMediaState(target, { paused: true });
    await elementIsStable(button);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(MediaPauseButton.metadata.tag)).toBeDefined();
    expect(getInternals(button).role).toBe('button');
  });

  it('should dispatch the playback command to the target', async () => {
    const event = untilEvent<Event & { command: string; source: HTMLElement }>(target, 'command');
    await emulateClick(button);
    const command = await event;

    expect(command.command).toBe(mediaCommands.togglePlayback);
    expect(command.source).toBe(button);
  });

  it('should toggle checked state on user activation', async () => {
    expect(button.checked).toBe(true);

    emulateClick(button);
    await elementIsStable(button);
    expect(button.checked).toBe(false);

    emulateClick(button);
    await elementIsStable(button);
    expect(button.checked).toBe(true);
  });

  it('should sync checked state from target playback state', async () => {
    const input = vi.fn();
    const change = vi.fn();
    button.addEventListener('input', input);
    button.addEventListener('change', change);
    expect(button.checked).toBe(true);

    setMediaState(target, { paused: false });
    await elementIsStable(button);
    expect(button.checked).toBe(false);

    setMediaState(target, { ended: true, paused: false });
    await elementIsStable(button);
    expect(button.checked).toBe(true);
    expect(input).not.toHaveBeenCalled();
    expect(change).not.toHaveBeenCalled();
  });

  it('should use i18n strings for the default accessible name', async () => {
    expect(getInternals(button).ariaLabel).toBe('play media');

    button.i18n = { pauseMedia: 'stop recording', playMedia: 'start recording' };
    await elementIsStable(button);
    expect(getInternals(button).ariaLabel).toBe('start recording');

    button.checked = false;
    await elementIsStable(button);
    expect(getInternals(button).ariaLabel).toBe('stop recording');
  });

  it('should resolve commandForElement targets', async () => {
    button.commandForElement = null;
    button.commandForElement = target;
    await elementIsStable(button);

    const event = untilEvent<Event & { command: string; source: HTMLElement }>(target, 'command');
    await emulateClick(button);
    const command = await event;

    expect(command.command).toBe(mediaCommands.togglePlayback);
    expect(command.source).toBe(button);
  });

  it('should retarget and remove media state listeners', async () => {
    const nextTarget: MediaStateTarget = Object.assign(document.createElement('div'), {
      mediaState: createMediaState({ paused: false })
    });
    fixture.append(nextTarget);
    button.commandForElement = null;
    button.commandForElement = nextTarget;
    await elementIsStable(button);

    expect(button.checked).toBe(false);

    setMediaState(target, { paused: true });
    expect(button.checked).toBe(false);

    setMediaState(nextTarget, { paused: true });
    expect(button.checked).toBe(true);

    button.remove();
    setMediaState(nextTarget, { paused: false });
    expect(button.checked).toBe(true);
  });

  it('should no-op for missing or empty commands', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    let count = 0;
    target.addEventListener('command', () => (count += 1));

    button.commandForElement = null;
    await elementIsStable(button);
    await emulateClick(button);

    button.commandForElement = document.createElement('div');
    await elementIsStable(button);
    await emulateClick(button);

    button.commandForElement = null;
    button.setAttribute('commandfor', 'missing');
    await elementIsStable(button);
    await emulateClick(button);

    button.setAttribute('commandfor', 'target');
    button.command = '';
    await elementIsStable(button);
    await emulateClick(button);

    expect(count).toBe(0);
    expect(warn).toHaveBeenCalledWith('commandForElement', 'missing', 'not found');
    warn.mockRestore();
  });

  it('should submit checkbox-style form data', async () => {
    button.checked = false;
    await elementIsStable(button);
    const formFixture = await createFixture(html`
      <form>
        <nve-media-pause-button name="paused" value="true" checked></nve-media-pause-button>
      </form>
    `);
    const form = getElement<HTMLFormElement>(formFixture, 'form');

    expect(new FormData(form).get('paused')).toBe('true');
    getElement<MediaPauseButton>(form, MediaPauseButton.metadata.tag).checked = false;
    await elementIsStable(getElement(form, MediaPauseButton.metadata.tag));
    expect(new FormData(form).get('paused')).toBe(null);
    removeFixture(formFixture);
  });

  it('should not dispatch commands when disabled or readonly', async () => {
    let count = 0;
    target.addEventListener('command', () => (count += 1));

    button.disabled = true;
    await elementIsStable(button);
    expect(getInternals(button).ariaDisabled).toBe('true');
    expect(button.tabIndex).toBe(-1);
    await emulateClick(button);

    button.disabled = false;
    button.readOnly = true;
    await elementIsStable(button);
    expect(getInternals(button).role).toBe('none');
    expect(getInternals(button).ariaDisabled).toBe(null);
    await emulateClick(button);

    expect(count).toBe(0);
  });

  it('should support keyboard activation and default-prevented clicks', async () => {
    let count = 0;
    target.addEventListener('command', () => (count += 1));

    button.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, code: 'ArrowLeft' }));
    button.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, code: 'Enter' }));
    const click = new MouseEvent('click', { bubbles: true, cancelable: true });
    click.preventDefault();
    button.dispatchEvent(click);

    expect(count).toBe(1);
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
