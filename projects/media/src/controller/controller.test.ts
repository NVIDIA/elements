// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFixture, elementIsStable, emulateClick, removeFixture, untilEvent } from '@internals/testing';
import {
  mediaCommands,
  type MediaCommand,
  type MediaCommandEvent,
  type MediaCommandSource
} from '../internal/media-command.js';
import { createMediaState, mediaStateChange, type MediaStateChangeEvent } from '../internal/media-state.js';
import type { MediaPauseButton } from '../pause-button/pause-button.js';
import { MediaController } from './controller.js';
import '../pause-button/define.js';
import '../seek-button/define.js';
import './define.js';

interface NativeMediaState {
  paused: boolean;
  muted: boolean;
  ended: boolean;
  seeking: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: number;
}

describe(MediaController.metadata.tag, () => {
  let fixture: HTMLElement;
  let controller: MediaController;
  let video: HTMLVideoElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-media-controller id="controller">
        <video></video>
      </nve-media-controller>
    `);
    controller = getElement(fixture, MediaController.metadata.tag);
    video = getElement(fixture, 'video');
    await elementIsStable(controller);
  });

  afterEach(() => {
    removeFixture(fixture);
    vi.restoreAllMocks();
  });

  it('should define element', () => {
    expect(customElements.get(MediaController.metadata.tag)).toBeDefined();
  });

  it('should expose an immutable initial media state snapshot', () => {
    expect(controller.mediaState).toEqual(createMediaState());
    expect(controller.value).toBe(controller.mediaState);
    expect(Object.isFrozen(controller.mediaState)).toBe(true);
  });

  it('should reflect media state from native media events', async () => {
    const state = setupMedia(video, { paused: false, muted: true, currentTime: 12, duration: 90, volume: 0.5 });
    const stateChange = untilEvent<MediaStateChangeEvent>(controller, mediaStateChange);
    video.dispatchEvent(new Event('timeupdate'));
    const event = await stateChange;
    video.dispatchEvent(new Event('volumechange'));
    await elementIsStable(controller);

    expect(event.detail).toBe(controller.mediaState);
    expect(event.detail).toEqual(
      createMediaState({ paused: false, muted: true, currentTime: 12, duration: 90, volume: 0.5 })
    );
    expect(controller.hasAttribute('paused')).toBe(false);
    expect(controller.hasAttribute('muted')).toBe(true);
    expect(controller.getAttribute('current-time')).toBe(`${state.currentTime}`);
    expect(controller.getAttribute('duration')).toBe(`${state.duration}`);
    expect(controller.getAttribute('volume')).toBe(`${state.volume}`);
    expect(controller.getAttribute('playback-rate')).toBe(`${state.playbackRate}`);
  });

  it('should not dispatch media state events when state is unchanged', () => {
    const state = setupMedia(video, { currentTime: 12 });
    video.dispatchEvent(new Event('timeupdate'));
    const listener = vi.fn();
    controller.addEventListener(mediaStateChange, listener);

    video.dispatchEvent(new Event('timeupdate'));
    expect(listener).not.toHaveBeenCalled();

    state.currentTime = 13;
    video.dispatchEvent(new Event('timeupdate'));
    expect(listener).toHaveBeenCalledOnce();
  });

  it('should warn and no-op when media is missing', async () => {
    removeFixture(fixture);
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    fixture = await createFixture(html`<nve-media-controller></nve-media-controller>`);
    controller = getElement(fixture, MediaController.metadata.tag);
    await elementIsStable(controller);

    dispatchCommand(controller, mediaCommands.play);

    expect(spy).toHaveBeenCalledWith('nve-media-controller missing media element');
  });

  it('should warn and use the first media element when multiple media elements are slotted', async () => {
    removeFixture(fixture);
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    fixture = await createFixture(html`
      <nve-media-controller>
        <video></video>
        <audio></audio>
      </nve-media-controller>
    `);
    controller = getElement(fixture, MediaController.metadata.tag);
    await elementIsStable(controller);

    expect(spy).toHaveBeenCalledWith('nve-media-controller multiple media element');
  });

  it('should fill available inline space with slotted media and controls', async () => {
    removeFixture(fixture);
    fixture = await createFixture(html`
      <div style="inline-size: 500px">
        <nve-media-controller>
          <video style="block-size: 135px"></video>
          <div data-controls style="inline-size: 1000px; block-size: 20px"></div>
        </nve-media-controller>
      </div>
    `);
    controller = getElement(fixture, MediaController.metadata.tag);
    video = getElement(fixture, 'video');
    await elementIsStable(controller);

    const renderRoot = controller.shadowRoot as ShadowRoot;
    const host = getElement<HTMLElement>(renderRoot, '[internal-host]');
    const controls = getElement<HTMLElement>(fixture, '[data-controls]');

    expect(Math.round(controller.getBoundingClientRect().width)).toBe(500);
    expect(Math.round(host.getBoundingClientRect().width)).toBe(500);
    expect(Math.round(video.getBoundingClientRect().width)).toBe(500);
    expect(Math.round(controls.getBoundingClientRect().width)).toBe(500);
  });

  it('should render controls after the media element', async () => {
    removeFixture(fixture);
    fixture = await createFixture(html`
      <div style="inline-size: 500px">
        <nve-media-controller>
          <video style="block-size: 240px"></video>
          <div data-controls style="block-size: 20px"></div>
        </nve-media-controller>
      </div>
    `);
    controller = getElement(fixture, MediaController.metadata.tag);
    video = getElement(fixture, 'video');
    await elementIsStable(controller);

    const videoRect = video.getBoundingClientRect();
    const controlsRect = getElement<HTMLElement>(fixture, '[data-controls]').getBoundingClientRect();

    expect(Math.round(controlsRect.top)).toBeGreaterThanOrEqual(Math.round(videoRect.bottom));
  });

  it('should handle playback and muted commands', async () => {
    const state = setupMedia(video, { paused: true, muted: false });

    dispatchCommand(controller, mediaCommands.play);
    await elementIsStable(controller);
    expect(state.paused).toBe(false);
    expect(controller.hasAttribute('paused')).toBe(false);

    dispatchCommand(controller, mediaCommands.pause);
    await elementIsStable(controller);
    expect(state.paused).toBe(true);
    expect(controller.hasAttribute('paused')).toBe(true);

    dispatchCommand(controller, mediaCommands.toggleMuted);
    expect(state.muted).toBe(true);

    dispatchCommand(controller, mediaCommands.unmute);
    expect(state.muted).toBe(false);
  });

  it('should clamp seek and volume command values', () => {
    const state = setupMedia(video, { currentTime: 25, duration: 100, volume: 0.5 });

    dispatchCommand(controller, mediaCommands.seek, createSource({ valueAsNumber: 120 }));
    expect(state.currentTime).toBe(100);

    dispatchCommand(controller, mediaCommands.seekBackward, createSource({ valueAsNumber: 20 }));
    expect(state.currentTime).toBe(80);

    dispatchCommand(controller, mediaCommands.seekForward, createSource({ valueAsNumber: 30 }));
    expect(state.currentTime).toBe(100);

    dispatchCommand(controller, mediaCommands.seekToStart);
    expect(state.currentTime).toBe(0);

    dispatchCommand(controller, mediaCommands.seekToEnd);
    expect(state.currentTime).toBe(100);

    dispatchCommand(controller, mediaCommands.setVolume, createSource({ valueAsNumber: 2 }));
    expect(state.volume).toBe(1);
  });

  it('should clamp backward seek to zero when duration is unavailable', () => {
    const state = setupMedia(video, { currentTime: 5, duration: Number.NaN });

    dispatchCommand(controller, mediaCommands.seekBackward, createSource({ valueAsNumber: 10 }));

    expect(state.currentTime).toBe(0);
  });

  it('should handle playback-rate command values', () => {
    const state = setupMedia(video, { playbackRate: 1 });

    dispatchCommand(controller, mediaCommands.setPlaybackRate, createSource({ valueAsNumber: 1.5 }));

    expect(state.playbackRate).toBe(1.5);
    expect(controller.getAttribute('playback-rate')).toBe('1.5');
  });

  it('should seek by the source value from seek buttons', async () => {
    removeFixture(fixture);
    fixture = await createFixture(html`
      <nve-media-controller id="seek-controller">
        <video></video>
        <nve-media-seek-button
          id="backward"
          commandfor="seek-controller"
          action="backward"
          value="10"
        ></nve-media-seek-button>
        <nve-media-seek-button
          id="forward"
          commandfor="seek-controller"
          action="forward"
          value="7"
        ></nve-media-seek-button>
      </nve-media-controller>
    `);
    controller = getElement(fixture, MediaController.metadata.tag);
    video = getElement(fixture, 'video');
    const backward = getElement<HTMLElement>(fixture, '#backward');
    const forward = getElement<HTMLElement>(fixture, '#forward');
    const state = setupMedia(video, { currentTime: 50, duration: 100 });
    await elementIsStable(controller);
    await elementIsStable(backward);
    await elementIsStable(forward);

    await emulateClick(backward);
    expect(state.currentTime).toBe(40);

    await emulateClick(forward);
    expect(state.currentTime).toBe(47);
  });

  it('should handle toggle playback commands from pause buttons', async () => {
    removeFixture(fixture);
    fixture = await createFixture(html`
      <nve-media-controller id="pause-controller">
        <video></video>
        <nve-media-pause-button
          commandfor="pause-controller"
          name="paused"
          value="true"
          checked
        ></nve-media-pause-button>
      </nve-media-controller>
    `);
    controller = getElement(fixture, MediaController.metadata.tag);
    video = getElement(fixture, 'video');
    const button = getElement<MediaPauseButton>(fixture, 'nve-media-pause-button');
    const state = setupMedia(video, { paused: true });
    await elementIsStable(controller);
    await elementIsStable(button);

    await emulateClick(button);
    expect(state.paused).toBe(false);
    expect(controller.hasAttribute('paused')).toBe(false);
    expect(button.checked).toBe(false);

    await emulateClick(button);
    expect(state.paused).toBe(true);
    expect(controller.hasAttribute('paused')).toBe(true);
    expect(button.checked).toBe(true);
  });

  it('should reset pause buttons when playback ends', async () => {
    removeFixture(fixture);
    fixture = await createFixture(html`
      <nve-media-controller id="ended-controller">
        <video></video>
        <nve-media-pause-button commandfor="ended-controller"></nve-media-pause-button>
        <nve-media-pause-button commandfor="ended-controller"></nve-media-pause-button>
      </nve-media-controller>
    `);
    controller = getElement(fixture, MediaController.metadata.tag);
    video = getElement(fixture, 'video');
    const buttons = [...fixture.querySelectorAll<MediaPauseButton>('nve-media-pause-button')];
    const state = setupMedia(video, { paused: false });
    video.dispatchEvent(new Event('play'));
    await Promise.all(buttons.map(button => elementIsStable(button)));
    expect(buttons).toHaveLength(2);
    expect(buttons.every(button => !button.checked)).toBe(true);

    state.ended = true;
    video.dispatchEvent(new Event('ended'));
    await Promise.all(buttons.map(button => elementIsStable(button)));

    expect(controller.hasAttribute('ended')).toBe(true);
    expect(buttons.every(button => button.checked)).toBe(true);
  });

  it('should warn for unsupported commands and invalid command values', () => {
    setupMedia(video);
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    dispatchCommand(controller, '--unknown' as MediaCommand);
    dispatchCommand(controller, mediaCommands.seek, createSource({ valueAsNumber: Number.NaN }));
    dispatchCommand(controller, mediaCommands.seekBackward, createSource({ valueAsNumber: Number.NaN }));
    dispatchCommand(controller, mediaCommands.setVolume, createSource({ valueAsNumber: Number.NaN }));
    dispatchCommand(controller, mediaCommands.setPlaybackRate, createSource({ valueAsNumber: 0 }));

    expect(spy).toHaveBeenCalledWith('nve-media-controller unsupported command', '--unknown');
    expect(spy).toHaveBeenCalledWith('nve-media-controller invalid command value', mediaCommands.seek);
    expect(spy).toHaveBeenCalledWith('nve-media-controller invalid command value', mediaCommands.seekBackward);
    expect(spy).toHaveBeenCalledWith('nve-media-controller invalid command value', mediaCommands.setVolume);
    expect(spy).toHaveBeenCalledWith('nve-media-controller invalid command value', mediaCommands.setPlaybackRate);
  });

  it('should warn when finite command values cannot be applied to missing media', async () => {
    removeFixture(fixture);
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    fixture = await createFixture(html`<nve-media-controller></nve-media-controller>`);
    controller = getElement(fixture, MediaController.metadata.tag);
    await elementIsStable(controller);

    dispatchCommand(controller, mediaCommands.seek, createSource({ valueAsNumber: 10 }));
    dispatchCommand(controller, mediaCommands.setVolume, createSource({ valueAsNumber: 0.5 }));
    dispatchCommand(controller, mediaCommands.setPlaybackRate, createSource({ valueAsNumber: 1.5 }));

    expect(spy).toHaveBeenCalledWith('nve-media-controller missing media element');
  });

  it('should warn when seeking to an unavailable duration', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    setupMedia(video, { duration: Number.NaN });

    dispatchCommand(controller, mediaCommands.seekToEnd);

    expect(spy).toHaveBeenCalledWith('nve-media-controller invalid command value', mediaCommands.seekToEnd);
  });

  it('should handle full-screen commands', async () => {
    const requestFullscreen = vi.fn().mockResolvedValue(undefined);
    const exitFullscreen = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(controller, 'requestFullscreen', { value: requestFullscreen, configurable: true });
    Object.defineProperty(globalThis.document, 'exitFullscreen', { value: exitFullscreen, configurable: true });

    dispatchCommand(controller, mediaCommands.enterFullscreen);
    expect(requestFullscreen).toHaveBeenCalled();

    Object.defineProperty(globalThis.document, 'fullscreenElement', { value: controller, configurable: true });
    const stateChange = untilEvent<MediaStateChangeEvent>(controller, mediaStateChange);
    globalThis.document.dispatchEvent(new Event('fullscreenchange'));
    expect((await stateChange).detail.fullscreen).toBe(true);
    expect(controller.hasAttribute('fullscreen')).toBe(true);

    dispatchCommand(controller, mediaCommands.exitFullscreen);
    expect(exitFullscreen).toHaveBeenCalled();

    Object.defineProperty(globalThis.document, 'fullscreenElement', {
      value: document.createElement('div'),
      configurable: true
    });
    dispatchCommand(controller, mediaCommands.exitFullscreen);
    expect(exitFullscreen).toHaveBeenCalledTimes(1);

    Object.defineProperty(globalThis.document, 'fullscreenElement', { value: null, configurable: true });
    dispatchCommand(controller, mediaCommands.exitFullscreen);
    expect(exitFullscreen).toHaveBeenCalledTimes(1);
  });
});

function setupMedia(video: HTMLVideoElement, options: Partial<NativeMediaState> = {}) {
  const state: NativeMediaState = {
    paused: true,
    muted: false,
    ended: false,
    seeking: false,
    currentTime: 0,
    duration: 100,
    volume: 1,
    playbackRate: 1,
    ...options
  };

  defineMediaProperty({ video, property: 'paused', get: () => state.paused });
  defineMediaProperty({
    video,
    property: 'muted',
    get: () => state.muted,
    set: value => (state.muted = Boolean(value))
  });
  defineMediaProperty({ video, property: 'ended', get: () => state.ended });
  defineMediaProperty({ video, property: 'seeking', get: () => state.seeking });
  defineMediaProperty({
    video,
    property: 'currentTime',
    get: () => state.currentTime,
    set: value => (state.currentTime = Number(value))
  });
  defineMediaProperty({ video, property: 'duration', get: () => state.duration });
  defineMediaProperty({
    video,
    property: 'volume',
    get: () => state.volume,
    set: value => (state.volume = Number(value))
  });
  defineMediaProperty({
    video,
    property: 'playbackRate',
    get: () => state.playbackRate,
    set: value => (state.playbackRate = Number(value))
  });
  Object.defineProperty(video, 'play', {
    value: vi.fn(() => {
      state.paused = false;
      video.dispatchEvent(new Event('play'));
      return Promise.resolve();
    }),
    configurable: true
  });
  Object.defineProperty(video, 'pause', {
    value: vi.fn(() => {
      state.paused = true;
      video.dispatchEvent(new Event('pause'));
    }),
    configurable: true
  });

  return state;
}

interface MediaPropertyOptions {
  video: HTMLVideoElement;
  property: keyof HTMLMediaElement;
  get: () => unknown;
  set?: (value: unknown) => void;
}

function defineMediaProperty({ video, property, get, set }: MediaPropertyOptions) {
  Object.defineProperty(video, property, { get, set, configurable: true });
}

function dispatchCommand(controller: MediaController, command: MediaCommand, source: MediaCommandSource | null = null) {
  const event = new Event('command') as MediaCommandEvent;
  Object.defineProperties(event, {
    command: { value: command },
    source: { value: source }
  });
  controller.dispatchEvent(event);
}

function createSource(values: Partial<Pick<MediaCommandSource, 'valueAsNumber'>>) {
  return Object.assign(globalThis.document.createElement('button'), values) as MediaCommandSource;
}

function getElement<T extends Element>(root: ParentNode, selector: string) {
  const element = root.querySelector<T>(selector);
  expect(element).toBeTruthy();
  return element as T;
}
