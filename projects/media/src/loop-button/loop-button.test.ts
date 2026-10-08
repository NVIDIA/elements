// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { createFixture, elementIsStable, emulateClick, removeFixture, untilEvent } from '@internals/testing';
import { mediaCommands } from '../internal/media-command.js';
import { createMediaState, mediaStateChange, type MediaState } from '../internal/media-state.js';
import { MediaLoopButton } from './loop-button.js';
import './define.js';

type MediaStateTarget = HTMLElement & { mediaState: MediaState };

describe(MediaLoopButton.metadata.tag, () => {
  let fixture: HTMLElement;
  let button: MediaLoopButton;
  let target: MediaStateTarget;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-media-loop-button commandfor="target"></nve-media-loop-button>
      <div id="target"></div>
    `);
    button = getElement<MediaLoopButton>(fixture, MediaLoopButton.metadata.tag);
    target = getElement<MediaStateTarget>(fixture, '#target');
    setMediaState(target, { loop: false });
    await elementIsStable(button);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define a command button with unpressed state', () => {
    expect(customElements.get(MediaLoopButton.metadata.tag)).toBeDefined();
    expect(button.type).toBe('button');
    expect(button.command).toBe(mediaCommands.toggleLoop);
    expect(button.pressed).toBe(false);
    expect(button._internals.ariaPressed).toBe('false');
    expect(button._internals.role).toBe('button');
  });

  it('should dispatch the loop command without optimistically changing state', async () => {
    const event = untilEvent<Event & { command: string; source: HTMLElement }>(target, 'command');
    await emulateClick(button);
    const command = await event;
    expect(command.command).toBe(mediaCommands.toggleLoop);
    expect(command.source).toBe(button);
    expect(button.pressed).toBe(false);
  });

  it('should preserve explicit commands', async () => {
    button.command = mediaCommands.enableLoop;
    await elementIsStable(button);
    const event = untilEvent<Event & { command: string }>(target, 'command');
    await emulateClick(button);
    expect((await event).command).toBe(mediaCommands.enableLoop);
  });

  it('should not submit its form by default', async () => {
    const form = document.createElement('form');
    fixture.append(form);
    form.append(button);
    const submit = vi.fn((event: SubmitEvent) => event.preventDefault());
    form.addEventListener('submit', submit);
    await elementIsStable(button);
    await emulateClick(button);
    expect(submit).not.toHaveBeenCalled();
    expect([...new FormData(form)]).toEqual([]);
  });

  it('should sync pressed, ARIA, and icon state without emitting interaction events', async () => {
    const input = vi.fn();
    const change = vi.fn();
    const command = vi.fn();
    button.addEventListener('input', input);
    button.addEventListener('change', change);
    target.addEventListener('command', command);
    expect(getElement(button.renderRoot, 'nve-icon').getAttribute('name')).toBe('looping-off');

    setMediaState(target, { loop: true });
    await elementIsStable(button);
    expect(button.pressed).toBe(true);
    expect(button.hasAttribute('pressed')).toBe(true);
    expect(button.matches(':state(pressed)')).toBe(true);
    expect(button._internals.ariaPressed).toBe('true');
    expect(getElement(button.renderRoot, 'nve-icon').getAttribute('name')).toBe('looping');

    setMediaState(target, { loop: false });
    await elementIsStable(button);
    expect(button.pressed).toBe(false);
    expect(button.hasAttribute('pressed')).toBe(false);
    expect(button.matches(':state(pressed)')).toBe(false);
    expect(button._internals.ariaPressed).toBe('false');
    expect(input).not.toHaveBeenCalled();
    expect(change).not.toHaveBeenCalled();
    expect(command).not.toHaveBeenCalled();
  });

  it('should read initial state and detach from its previous command target', async () => {
    const next = document.createElement('div');
    const nextTarget = Object.assign(next, { mediaState: createMediaState({ loop: true }) });
    fixture.append(nextTarget);
    button.commandForElement = nextTarget;
    await elementIsStable(button);
    expect(button.pressed).toBe(true);

    setMediaState(target, { loop: false });
    await elementIsStable(button);
    expect(button.pressed).toBe(true);

    button.commandForElement = null;
    button.removeAttribute('commandfor');
    await elementIsStable(button);
    expect(button.pressed).toBe(false);
    setMediaState(nextTarget, { loop: true });
    await elementIsStable(button);
    expect(button.pressed).toBe(false);
  });

  it('should clear stale state and subscribe again after reconnection', async () => {
    setMediaState(target, { loop: true });
    await elementIsStable(button);
    button.remove();
    expect(button.pressed).toBe(false);
    setMediaState(target, { loop: false });
    fixture.append(button);
    await elementIsStable(button);
    setMediaState(target, { loop: true });
    await elementIsStable(button);
    expect(button.pressed).toBe(true);
  });

  it('should ignore invalid controller snapshots', async () => {
    target.dispatchEvent(new CustomEvent(mediaStateChange, { detail: { loop: true } }));
    await elementIsStable(button);
    expect(button.pressed).toBe(false);
  });

  it.each([
    [mediaCommands.toggleLoop, 'enable looping', 'repeat recording'],
    [mediaCommands.enableLoop, 'enable looping', 'repeat recording'],
    [mediaCommands.disableLoop, 'disable looping', 'stop repeating']
  ])('should use a stable localized name for %s in both states', async (command, defaultName, localizedName) => {
    button.command = command;
    await elementIsStable(button);
    expect(button._internals.ariaLabel).toBe(defaultName);
    button.i18n = { enableLoop: 'repeat recording', disableLoop: 'stop repeating' };
    await elementIsStable(button);
    expect(button._internals.ariaLabel).toBe(localizedName);
    expect(button._internals.ariaPressed).toBe('false');
    setMediaState(target, { loop: true });
    await elementIsStable(button);
    expect(button._internals.ariaLabel).toBe(localizedName);
    expect(button._internals.ariaPressed).toBe('true');
    setMediaState(target, { loop: false });
    await elementIsStable(button);
    expect(button._internals.ariaLabel).toBe(localizedName);
    expect(button._internals.ariaPressed).toBe('false');
    button.i18n = { enableLoop: undefined, disableLoop: undefined };
    await elementIsStable(button);
    expect(button._internals.ariaLabel).toBe(null);
  });

  it('should preserve an explicit accessible name', async () => {
    button.ariaLabel = 'repeat this clip';
    setMediaState(target, { loop: true });
    await elementIsStable(button);
    await expect.element(button).toHaveAccessibleName('repeat this clip');
  });

  it('should preserve authored pressed markup and custom icon content', async () => {
    const standalone = await createFixture(html`
      <nve-media-loop-button pressed><span>repeat</span></nve-media-loop-button>
    `);
    try {
      const control = getElement<MediaLoopButton>(standalone, MediaLoopButton.metadata.tag);
      await elementIsStable(control);
      expect(control.pressed).toBe(true);
      expect(control._internals.ariaPressed).toBe('true');
      const slot = getElement<HTMLSlotElement>(control.renderRoot, 'slot');
      expect(slot.assignedElements()[0]?.textContent).toBe('repeat');
    } finally {
      removeFixture(standalone);
    }
  });

  it.each(['Enter', ' '])('should dispatch a command on the %s key', async key => {
    button.focus();
    const event = untilEvent<Event & { command: string }>(target, 'command');
    await userEvent.keyboard(key === 'Enter' ? '{Enter}' : ' ');
    expect((await event).command).toBe(mediaCommands.toggleLoop);
  });
});

function getElement<T extends Element>(root: ParentNode, selector: string): T {
  const element = root.querySelector<T>(selector);
  if (!element) {
    throw new Error(`Missing element: ${selector}`);
  }
  return element;
}

function setMediaState(target: MediaStateTarget, state: Partial<MediaState>) {
  target.mediaState = createMediaState(state);
  target.dispatchEvent(new CustomEvent(mediaStateChange, { detail: target.mediaState }));
}
