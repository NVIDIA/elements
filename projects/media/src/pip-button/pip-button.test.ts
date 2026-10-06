// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFixture, elementIsStable, emulateClick, removeFixture, untilEvent } from '@internals/testing';
import { mediaCommands } from '../internal/media-command.js';
import { createMediaState, mediaStateChange, type MediaState } from '../internal/media-state.js';
import { MediaPipButton } from './pip-button.js';
import './define.js';

type MediaStateTarget = HTMLElement & { mediaState: MediaState };

describe(MediaPipButton.metadata.tag, () => {
  let fixture: HTMLElement;
  let button: MediaPipButton;
  let target: MediaStateTarget;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-media-pip-button commandfor="target"></nve-media-pip-button>
      <div id="target"></div>
    `);
    button = getElement(fixture, MediaPipButton.metadata.tag);
    target = getElement(fixture, '#target');
    setMediaState(target, { pipAvailable: true });
    await elementIsStable(button);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define a command-only button with the picture-in-picture icon', () => {
    expect(customElements.get(MediaPipButton.metadata.tag)).toBe(MediaPipButton);
    expect(button.type).toBe('button');
    expect(button.shadowRoot?.querySelector('nve-icon')?.getAttribute('name')).toBe('picture-in-picture');
    expect(button.disabled).toBe(false);
    expect(getInternals(button).role).toBe('button');
    expect(button.tabIndex).toBe(0);
  });

  it('should send the toggle command without changing pressed state optimistically', async () => {
    const event = untilEvent<Event & { command: string; source: HTMLElement }>(target, 'command');
    await emulateClick(button);
    expect((await event).command).toBe(mediaCommands.togglePip);
    expect(button.pressed).toBe(false);
  });

  it.each(['Enter', 'Space'])('should activate with the %s key', async key => {
    const command = vi.fn();
    target.addEventListener('command', command);
    button.dispatchEvent(new KeyboardEvent('keyup', { code: key, bubbles: true }));
    expect(command).toHaveBeenCalledOnce();
  });

  it('should mirror active PiP in pressed state and accessible name', async () => {
    expect(getInternals(button).ariaLabel).toBe('enter picture in picture');
    setMediaState(target, { pip: true, pipAvailable: true });
    await elementIsStable(button);
    expect(button.pressed).toBe(true);
    expect(button.hasAttribute('pressed')).toBe(true);
    expect(getInternals(button).ariaPressed).toBe('true');
    expect(getInternals(button).ariaLabel).toBe('exit picture in picture');

    setMediaState(target, { pipAvailable: true });
    await elementIsStable(button);
    expect(getInternals(button).ariaPressed).toBe('false');
    expect(getInternals(button).ariaLabel).toBe('enter picture in picture');
  });

  it('should remain visible but disable focus and commands while unavailable', async () => {
    const command = vi.fn();
    target.addEventListener('command', command);
    setMediaState(target, {});
    await elementIsStable(button);

    expect(button.disabled).toBe(true);
    expect(button.hidden).toBe(false);
    expect(getComputedStyle(button).display).toBe('inline-flex');
    expect(button.hasAttribute('disabled')).toBe(false);
    expect(button.matches(':state(disabled)')).toBe(true);
    expect(getInternals(button).ariaDisabled).toBe('true');
    expect(button.tabIndex).toBe(-1);
    await emulateClick(button);
    button.dispatchEvent(new KeyboardEvent('keyup', { code: 'Enter', bubbles: true }));
    expect(command).not.toHaveBeenCalled();

    setMediaState(target, { pipAvailable: true });
    await elementIsStable(button);
    expect(button.disabled).toBe(false);
    expect(button.tabIndex).toBe(0);
  });

  it('should preserve consumer disabling across availability changes', async () => {
    button.disabled = true;
    setMediaState(target, {});
    await elementIsStable(button);
    setMediaState(target, { pipAvailable: true });
    await elementIsStable(button);
    expect(button.disabled).toBe(true);
    expect(button.hasAttribute('disabled')).toBe(true);

    button.removeAttribute('disabled');
    await elementIsStable(button);
    expect(button.disabled).toBe(false);
    setMediaState(target, {});
    button.disabled = false;
    await elementIsStable(button);
    expect(button.disabled).toBe(true);
    expect(button.hasAttribute('disabled')).toBe(false);
  });

  it('should allow exiting active PiP when entry becomes unavailable', async () => {
    setMediaState(target, { pip: true });
    await elementIsStable(button);
    expect(button.disabled).toBe(false);
    const event = untilEvent<Event & { command: string }>(target, 'command');
    await emulateClick(button);
    expect((await event).command).toBe(mediaCommands.togglePip);
  });

  it('should reset state when the target is missing or has no media state', async () => {
    setMediaState(target, { pip: true });
    await elementIsStable(button);
    button.removeAttribute('commandfor');
    await elementIsStable(button);
    expect(button.disabled).toBe(true);
    expect(button.pressed).toBe(false);

    button.commandForElement = document.createElement('div');
    await elementIsStable(button);
    expect(button.disabled).toBe(true);
  });

  it('should retarget and ignore the previous controller', async () => {
    const nextTarget = Object.assign(document.createElement('div'), {
      mediaState: createMediaState({ pipAvailable: true, pip: true })
    });
    fixture.append(nextTarget);
    button.commandForElement = nextTarget;
    await elementIsStable(button);
    expect(button.pressed).toBe(true);

    setMediaState(target, {});
    await elementIsStable(button);
    expect(button.pressed).toBe(true);
    expect(button.disabled).toBe(false);
  });

  it('should reset on disconnect and sync current state on reconnect', async () => {
    setMediaState(target, { pipAvailable: true, pip: true });
    await elementIsStable(button);
    button.remove();
    expect(button.pressed).toBe(false);
    expect(button.disabled).toBe(true);
    setMediaState(target, { pipAvailable: true });
    fixture.append(button);
    await elementIsStable(button);
    expect(button.pressed).toBe(false);
    expect(button.disabled).toBe(false);
  });

  it('should use i18n overrides and honor an explicit accessible name', async () => {
    button.i18n = { enterPip: 'open floating video', exitPip: 'return video' };
    await elementIsStable(button);
    expect(getInternals(button).ariaLabel).toBe('open floating video');
    setMediaState(target, { pip: true });
    await elementIsStable(button);
    expect(getInternals(button).ariaLabel).toBe('return video');
    button.setAttribute('aria-label', 'custom video control');
    expect(button.getAttribute('aria-label')).toBe('custom video control');

    button.i18n = { enterPip: undefined, exitPip: undefined };
    await elementIsStable(button);
    expect(getInternals(button).ariaLabel).toBe(null);
  });

  it('should accept custom icon content', async () => {
    const custom = document.createElement('span');
    custom.textContent = 'custom';
    button.append(custom);
    await elementIsStable(button);
    expect(button.shadowRoot?.querySelector('slot')?.assignedElements()).toEqual([custom]);
  });

  it('should not submit a form by default', async () => {
    const form = document.createElement('form');
    fixture.append(form);
    form.append(button);
    const submit = vi.fn((event: Event) => event.preventDefault());
    form.addEventListener('submit', submit);
    await elementIsStable(button);
    await emulateClick(button);
    expect(submit).not.toHaveBeenCalled();
    expect([...new FormData(form)]).toEqual([]);
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
