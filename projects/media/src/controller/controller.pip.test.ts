// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFixture, elementIsStable, emulateClick, removeFixture } from '@internals/testing';
import { mediaCommands } from '../internal/media-command.js';
import { isMediaState } from '../internal/media-state.js';
import type { MediaPipButton } from '../pip-button/pip-button.js';
import { MediaController } from './controller.js';
import '../pip-button/define.js';
import '../mute-button/define.js';
import './define.js';

describe(MediaController.metadata.tag + ' picture-in-picture', () => {
  let fixture: HTMLElement;
  let controller: MediaController;
  let video: HTMLVideoElement;
  let button: MediaPipButton;
  let active: Element | null;
  let request: ReturnType<typeof vi.fn<() => Promise<PictureInPictureWindow>>>;
  let exit: ReturnType<typeof vi.fn<() => Promise<void>>>;

  beforeEach(async () => {
    active = null;
    vi.spyOn(document, 'pictureInPictureEnabled', 'get').mockReturnValue(true);
    vi.spyOn(document, 'pictureInPictureElement', 'get').mockImplementation(() => active);
    fixture = await createFixture(html`
      <nve-media-controller id="pip-controller">
        <video></video>
        <nve-media-pip-button commandfor="pip-controller"></nve-media-pip-button>
      </nve-media-controller>
    `);
    controller = getElement(fixture, MediaController.metadata.tag);
    video = getElement(fixture, 'video');
    button = getElement(fixture, 'nve-media-pip-button');
    setupVideo(video);
    request = vi.spyOn(video, 'requestPictureInPicture').mockImplementation(async () => {
      active = video;
      video.dispatchEvent(new Event('enterpictureinpicture'));
      return createPipWindow();
    });
    exit = vi.spyOn(document, 'exitPictureInPicture').mockImplementation(async () => {
      const previous = active;
      active = null;
      previous?.dispatchEvent(new Event('leavepictureinpicture'));
    });
    video.dispatchEvent(new Event('loadedmetadata'));
    await elementIsStable(controller);
    await elementIsStable(button);
  });

  afterEach(() => {
    removeFixture(fixture);
    vi.restoreAllMocks();
  });

  it('should toggle video PiP through the button and mirror confirmed state', async () => {
    expect(controller.mediaState.pipAvailable).toBe(true);
    expect(controller.hasAttribute('pip-available')).toBe(true);
    await emulateClick(button);
    await vi.waitFor(() => expect(button.pressed).toBe(true));
    expect(request).toHaveBeenCalledOnce();
    expect(controller.mediaState.pip).toBe(true);
    expect(controller.hasAttribute('pip')).toBe(true);
    expect(Object.isFrozen(controller.mediaState)).toBe(true);

    await emulateClick(button);
    await vi.waitFor(() => expect(button.pressed).toBe(false));
    expect(exit).toHaveBeenCalledOnce();
    expect(controller.hasAttribute('pip')).toBe(false);
  });

  it('should keep media controls synchronized when the PiP enabled API is absent', async () => {
    Object.defineProperty(document, 'pictureInPictureEnabled', { value: undefined, configurable: true });
    const muteButton = document.createElement('nve-media-mute-button');
    muteButton.setAttribute('commandfor', 'pip-controller');
    controller.append(muteButton);
    await elementIsStable(muteButton);

    video.muted = true;
    video.dispatchEvent(new Event('volumechange'));
    await elementIsStable(muteButton);
    await elementIsStable(button);

    expect(controller.mediaState.pipAvailable).toBe(false);
    expect(isMediaState(controller.mediaState)).toBe(true);
    expect(button.disabled).toBe(true);
    expect(muteButton.checked).toBe(true);
  });

  it('should support explicit enter and exit commands without altering playback', async () => {
    const play = vi.spyOn(video, 'play');
    const pause = vi.spyOn(video, 'pause');
    dispatchCommand(controller, mediaCommands.enterPip);
    await vi.waitFor(() => expect(request).toHaveBeenCalledOnce());
    await Promise.resolve();
    await Promise.resolve();
    dispatchCommand(controller, mediaCommands.enterPip);
    expect(request).toHaveBeenCalledOnce();
    dispatchCommand(controller, mediaCommands.exitPip);
    await vi.waitFor(() => expect(exit).toHaveBeenCalledOnce());
    expect(play).not.toHaveBeenCalled();
    expect(pause).not.toHaveBeenCalled();
  });

  it('should sync native entry and window closing events', async () => {
    active = video;
    video.dispatchEvent(new Event('enterpictureinpicture'));
    await elementIsStable(button);
    expect(button.pressed).toBe(true);
    active = null;
    video.dispatchEvent(new Event('leavepictureinpicture'));
    await elementIsStable(button);
    expect(button.pressed).toBe(false);
  });

  it('should only exit its own video and request entry when another video owns PiP', async () => {
    active = document.createElement('video');
    dispatchCommand(controller, mediaCommands.exitPip);
    expect(exit).not.toHaveBeenCalled();
    dispatchCommand(controller, mediaCommands.togglePip);
    expect(request).toHaveBeenCalledOnce();
    expect(exit).not.toHaveBeenCalled();
  });

  it.each(['policy disabled', 'API missing', 'exit API missing', 'metadata unloaded', 'no video track'])(
    'should disable entry when %s',
    async reason => {
      const unavailable: Record<string, () => void> = {
        'policy disabled': () => {
          vi.spyOn(document, 'pictureInPictureEnabled', 'get').mockReturnValue(false);
        },
        'API missing': () => {
          Object.defineProperty(video, 'requestPictureInPicture', { value: undefined, configurable: true });
        },
        'exit API missing': () => {
          Object.defineProperty(document, 'exitPictureInPicture', { value: undefined, configurable: true });
        },
        'metadata unloaded': () => {
          vi.spyOn(video, 'readyState', 'get').mockReturnValue(0);
        },
        'no video track': () => {
          vi.spyOn(video, 'videoWidth', 'get').mockReturnValue(0);
        }
      };
      unavailable[reason]?.();
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      video.dispatchEvent(new Event('emptied'));
      await elementIsStable(button);
      expect(controller.mediaState.pipAvailable).toBe(false);
      expect(button.disabled).toBe(true);
      dispatchCommand(controller, mediaCommands.enterPip);
      expect(request).not.toHaveBeenCalled();
      expect(warn).toHaveBeenCalledWith('nve-media-controller picture-in-picture unavailable');
    }
  );

  it('should observe native disabling and retain the ability to exit active PiP', async () => {
    video.disablePictureInPicture = true;
    await vi.waitFor(() => expect(button.disabled).toBe(true));
    expect(controller.mediaState.pipAvailable).toBe(false);
    video.disablePictureInPicture = false;
    await vi.waitFor(() => expect(button.disabled).toBe(false));
    active = video;
    video.dispatchEvent(new Event('enterpictureinpicture'));
    video.disablePictureInPicture = true;
    await elementIsStable(button);
    expect(button.disabled).toBe(false);
    dispatchCommand(controller, mediaCommands.exitPip);
    expect(exit).toHaveBeenCalledOnce();
  });

  it('should handle audio and absent media without PiP methods', async () => {
    const audio = document.createElement('audio');
    video.replaceWith(audio);
    await vi.waitFor(() => expect(controller.mediaState.pipAvailable).toBe(false));
    dispatchCommand(controller, mediaCommands.enterPip);
    dispatchCommand(controller, mediaCommands.exitPip);
    expect(request).not.toHaveBeenCalled();
    audio.remove();
    await elementIsStable(controller);
    expect(controller.mediaState.pip).toBe(false);
    expect(controller.mediaState.pipAvailable).toBe(false);
  });

  it.each(['enter', 'exit'])('should warn on rejected %s requests without optimistic state changes', async action => {
    const error = new DOMException('denied', 'NotAllowedError');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    if (action === 'enter') {
      request.mockRejectedValue(error);
      dispatchCommand(controller, mediaCommands.enterPip);
    } else {
      active = video;
      video.dispatchEvent(new Event('enterpictureinpicture'));
      exit.mockRejectedValue(error);
      dispatchCommand(controller, mediaCommands.exitPip);
    }
    await vi.waitFor(() => expect(warn).toHaveBeenCalled());
    expect(warn).toHaveBeenCalledWith(
      action === 'enter'
        ? 'nve-media-controller picture-in-picture failed'
        : 'nve-media-controller picture-in-picture exit failed',
      error
    );
    expect(controller.mediaState.pip).toBe(action === 'exit');
  });

  it('should recover from synchronous API exceptions', () => {
    const error = new Error('synchronous failure');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    request.mockImplementationOnce(() => {
      throw error;
    });
    dispatchCommand(controller, mediaCommands.enterPip);
    expect(warn).toHaveBeenCalledWith('nve-media-controller picture-in-picture failed', error);
    dispatchCommand(controller, mediaCommands.enterPip);
    expect(request).toHaveBeenCalledTimes(2);
  });

  it('should ignore duplicate commands while entry is pending and resync after completion', async () => {
    let resolve: ((value: PictureInPictureWindow) => void) | undefined;
    request.mockImplementationOnce(
      () =>
        new Promise(result => {
          resolve = result;
        })
    );
    dispatchCommand(controller, mediaCommands.enterPip);
    dispatchCommand(controller, mediaCommands.togglePip);
    dispatchCommand(controller, mediaCommands.exitPip);
    expect(request).toHaveBeenCalledOnce();
    expect(controller.mediaState.pip).toBe(false);
    active = video;
    resolve?.(createPipWindow());
    await vi.waitFor(() => expect(controller.mediaState.pip).toBe(true));
  });

  it('should detach observers and prevent stale completion after replacing the video', async () => {
    let resolve: ((value: PictureInPictureWindow) => void) | undefined;
    request.mockImplementationOnce(
      () =>
        new Promise(result => {
          resolve = result;
        })
    );
    dispatchCommand(controller, mediaCommands.enterPip);
    const replacement = document.createElement('video');
    video.replaceWith(replacement);
    await vi.waitFor(() => expect(controller.mediaState.pipAvailable).toBe(false));
    const snapshot = controller.mediaState;
    active = video;
    video.dispatchEvent(new Event('enterpictureinpicture'));
    video.disablePictureInPicture = true;
    resolve?.(createPipWindow());
    await Promise.resolve();
    await Promise.resolve();
    expect(controller.mediaState).toBe(snapshot);
    expect(controller.mediaState.pip).toBe(false);
  });

  it('should sync existing PiP when reconnecting and ignore events while disconnected', async () => {
    controller.remove();
    const snapshot = controller.mediaState;
    active = video;
    video.dispatchEvent(new Event('enterpictureinpicture'));
    expect(controller.mediaState).toBe(snapshot);
    fixture.append(controller);
    await elementIsStable(controller);
    await elementIsStable(button);
    expect(controller.mediaState.pip).toBe(true);
    expect(button.pressed).toBe(true);
  });

  it('should read the video shadow root rather than a retargeted document element', async () => {
    const host = document.createElement('div');
    fixture.append(host);
    const root = host.attachShadow({ mode: 'open' });
    root.append(controller);
    vi.spyOn(root, 'pictureInPictureElement', 'get').mockImplementation(() => active);
    active = video;
    vi.spyOn(document, 'pictureInPictureElement', 'get').mockReturnValue(host);
    video.dispatchEvent(new Event('enterpictureinpicture'));
    await elementIsStable(controller);
    expect(controller.mediaState.pip).toBe(true);
    dispatchCommand(controller, mediaCommands.exitPip);
    expect(exit).toHaveBeenCalledOnce();
  });

  it('should avoid redundant state events and react to video resize', () => {
    const change = vi.fn();
    controller.addEventListener('media-state-change', change);
    video.dispatchEvent(new Event('loadedmetadata'));
    expect(change).not.toHaveBeenCalled();
    vi.spyOn(video, 'videoWidth', 'get').mockReturnValue(0);
    video.dispatchEvent(new Event('resize'));
    expect(change).toHaveBeenCalledOnce();
    expect(controller.mediaState.pipAvailable).toBe(false);
  });
});

function setupVideo(video: HTMLVideoElement) {
  vi.spyOn(video, 'readyState', 'get').mockReturnValue(HTMLMediaElement.HAVE_METADATA);
  vi.spyOn(video, 'videoWidth', 'get').mockReturnValue(640);
}

function dispatchCommand(controller: MediaController, command: string) {
  controller.dispatchEvent(new CommandEvent('command', { command }));
}

function getElement<T extends Element>(root: ParentNode, selector: string) {
  const element = root.querySelector<T>(selector);
  expect(element).toBeTruthy();
  return element as T;
}

function createPipWindow(): PictureInPictureWindow {
  return Object.assign(new EventTarget(), { width: 640, height: 360, onresize: null });
}
