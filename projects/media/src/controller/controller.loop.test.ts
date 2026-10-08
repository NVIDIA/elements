// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFixture, elementIsStable, emulateClick, removeFixture } from '@internals/testing';
import { mediaCommands, type MediaCommand, type MediaCommandEvent } from '../internal/media-command.js';
import { mediaStateChange } from '../internal/media-state.js';
import { MediaLoopButton } from '../loop-button/loop-button.js';
import { MediaController } from './controller.js';
import '../loop-button/define.js';
import './define.js';

describe.each(['video', 'audio'] as const)(`${MediaController.metadata.tag} %s looping`, tag => {
  let fixture: HTMLElement;
  let controller: MediaController;
  let media: HTMLMediaElement;
  let button: MediaLoopButton;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-media-controller id="loop-controller">
        ${tag === 'video' ? html`<video loop></video>` : html`<audio loop></audio>`}
      </nve-media-controller>
      <nve-media-loop-button commandfor="loop-controller"></nve-media-loop-button>
    `);
    controller = getElement<MediaController>(fixture, MediaController.metadata.tag);
    media = getElement<HTMLMediaElement>(controller, tag);
    button = getElement<MediaLoopButton>(fixture, MediaLoopButton.metadata.tag);
    await elementIsStable(controller);
    await elementIsStable(button);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    removeFixture(fixture);
  });

  it('should expose the initial native loop setting', () => {
    expect(media.loop).toBe(true);
    expect(controller.mediaState.loop).toBe(true);
    expect(Object.isFrozen(controller.mediaState)).toBe(true);
    expect(controller.hasAttribute('loop')).toBe(true);
    expect(button.pressed).toBe(true);
  });

  it('should apply explicit and toggle commands without changing playback', async () => {
    const play = vi.spyOn(media, 'play');
    const pause = vi.spyOn(media, 'pause');
    const time = media.currentTime;
    const listener = vi.fn();
    controller.addEventListener(mediaStateChange, listener);
    dispatchCommand(controller, mediaCommands.disableLoop);
    expect(media.loop).toBe(false);
    expect(controller.mediaState.loop).toBe(false);
    expect(controller.hasAttribute('loop')).toBe(false);
    expect(listener).toHaveBeenCalledOnce();
    await elementIsStable(button);
    expect(button.pressed).toBe(false);
    expect(listener).toHaveBeenCalledOnce();

    dispatchCommand(controller, mediaCommands.disableLoop);
    expect(listener).toHaveBeenCalledOnce();
    dispatchCommand(controller, mediaCommands.enableLoop);
    expect(media.loop).toBe(true);
    dispatchCommand(controller, mediaCommands.toggleLoop);
    expect(media.loop).toBe(false);
    dispatchCommand(controller, mediaCommands.toggleLoop);
    expect(media.loop).toBe(true);
    await elementIsStable(button);
    expect(button.pressed).toBe(true);
    expect(listener).toHaveBeenCalledTimes(4);
    expect(media.currentTime).toBe(time);
    expect(play).not.toHaveBeenCalled();
    expect(pause).not.toHaveBeenCalled();
  });

  it('should toggle native looping through the button', async () => {
    await emulateClick(button);
    await elementIsStable(button);
    expect(media.loop).toBe(false);
    expect(button.pressed).toBe(false);
    await emulateClick(button);
    await elementIsStable(button);
    expect(media.loop).toBe(true);
    expect(button.pressed).toBe(true);
  });

  it('should sync direct native property and attribute changes while paused', async () => {
    expect(media.paused).toBe(true);
    const listener = vi.fn();
    controller.addEventListener(mediaStateChange, listener);
    media.loop = false;
    await elementIsStable(button);
    expect(controller.mediaState.loop).toBe(false);
    expect(button.pressed).toBe(false);
    expect(controller.hasAttribute('loop')).toBe(false);
    expect(listener).toHaveBeenCalledOnce();

    media.setAttribute('loop', '');
    await elementIsStable(button);
    expect(controller.mediaState.loop).toBe(true);
    expect(button.pressed).toBe(true);
    expect(listener).toHaveBeenCalledTimes(2);
    media.setAttribute('loop', '');
    media.setAttribute('preload', 'none');
    await elementIsStable(button);
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('should read replacement media state and stop observing the previous media', async () => {
    const previous = media;
    const replacement = document.createElement(tag);
    media.replaceWith(replacement);
    await elementIsStable(controller);
    await elementIsStable(button);
    expect(controller.mediaState.loop).toBe(false);
    expect(button.pressed).toBe(false);

    const listener = vi.fn();
    controller.addEventListener(mediaStateChange, listener);
    previous.loop = false;
    await elementIsStable(controller);
    expect(listener).not.toHaveBeenCalled();
    replacement.loop = true;
    await elementIsStable(button);
    expect(controller.mediaState.loop).toBe(true);
    expect(button.pressed).toBe(true);
    expect(listener).toHaveBeenCalledOnce();
  });

  it('should release observers when disconnected and bind them on reconnection', async () => {
    button.commandForElement = controller;
    await elementIsStable(button);
    controller.remove();
    expect(controller.mediaState.loop).toBe(false);
    const listener = vi.fn();
    controller.addEventListener(mediaStateChange, listener);
    media.loop = false;
    media.loop = true;
    const replacement = document.createElement(tag);
    replacement.loop = true;
    media.replaceWith(replacement);
    await elementIsStable(button);
    expect(listener).not.toHaveBeenCalled();
    fixture.prepend(controller);
    await elementIsStable(controller);
    await elementIsStable(button);
    expect(controller.mediaState.loop).toBe(true);
    expect(button.pressed).toBe(true);
    replacement.loop = false;
    await elementIsStable(button);
    expect(controller.mediaState.loop).toBe(false);
    expect(button.pressed).toBe(false);
  });

  it('should warn and ignore loop commands when media is missing', async () => {
    media.remove();
    await elementIsStable(controller);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    dispatchCommand(controller, mediaCommands.enableLoop);
    dispatchCommand(controller, mediaCommands.disableLoop);
    dispatchCommand(controller, mediaCommands.toggleLoop);
    expect(controller.mediaState.loop).toBe(false);
    expect(warn).toHaveBeenCalledTimes(3);
    expect(warn).toHaveBeenCalledWith('nve-media-controller missing media element');
  });
});

function getElement<T extends Element>(root: ParentNode, selector: string): T {
  const element = root.querySelector<T>(selector);
  if (!element) {
    throw new Error(`Missing element: ${selector}`);
  }
  return element;
}

function dispatchCommand(controller: MediaController, command: MediaCommand) {
  const event = new Event('command') as MediaCommandEvent;
  Object.defineProperty(event, 'command', { value: command });
  controller.dispatchEvent(event);
}
