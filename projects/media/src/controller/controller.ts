// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { PropertyValues } from 'lit';
import { html, LitElement } from 'lit';
import { audit, useStyles } from '@nvidia-elements/core/internal';
import {
  isMediaCommand,
  mediaCommands,
  type MediaCommand,
  type MediaCommandEvent,
  type MediaCommandSource
} from '../internal/media-command.js';
import { createMediaState, mediaStatesEqual, type MediaState } from '../internal/media-state.js';
import styles from './controller.css?inline';

const mediaEventTypes = [
  'durationchange',
  'ended',
  'loadedmetadata',
  'pause',
  'play',
  'ratechange',
  'seeked',
  'seeking',
  'timeupdate',
  'volumechange'
] as const;

/**
 * @element nve-media-controller
 * @description Wraps consumer-owned audio or video and applies media commands from external controls.
 * @documentation https://nvidia.github.io/elements/docs/media/controller/
 * @since 0.0.0
 * @entrypoint \@nvidia-elements/media/controller
 * @command --play - Play the slotted media element.
 * @command --pause - Pause the slotted media element.
 * @command --toggle-play - Toggle play and pause.
 * @command --mute - Mute the media element.
 * @command --unmute - Unmute the media element.
 * @command --toggle-mute - Toggle media muted state.
 * @command --seek - Move playback to the source valueAsNumber.
 * @command --seek-start - Move playback to zero seconds.
 * @command --seek-end - Move playback to the finite duration.
 * @command --set-volume - Set media volume to the source valueAsNumber.
 * @command --set-playback-rate - Set media playback rate to the source valueAsNumber.
 * @command --enter-fullscreen - Request full-screen mode on the controller.
 * @command --exit-fullscreen - Exit full-screen mode.
 * @command --toggle-fullscreen - Toggle full-screen mode.
 * @property mediaState - The latest immutable media and full-screen state snapshot.
 * @event media-state-change - Dispatched with the complete state snapshot when the controller media state changes.
 * @slot - The controlled video or audio element and supporting controls or content.
 * @aria https://developer.mozilla.org/en-US/docs/Web/API/Invoker_Commands_API
 */
@audit()
export class MediaController extends LitElement {
  static styles = useStyles([styles]);

  static readonly metadata = {
    tag: 'nve-media-controller',
    version: '0.0.0'
  };

  static formAssociated = true;

  #media: HTMLMediaElement | null = null;

  #currentTime = 0;

  #fullscreen = false;

  #mediaState = createMediaState();

  #commandHandlers = new Map<MediaCommand, (source: MediaCommandSource | null) => void>([
    [mediaCommands.play, () => this.#play()],
    [mediaCommands.pause, () => this.#pause()],
    [mediaCommands.togglePlayback, () => this.#togglePlayback()],
    [mediaCommands.mute, () => this.#setMuted(true)],
    [mediaCommands.unmute, () => this.#setMuted(false)],
    [mediaCommands.toggleMuted, () => this.#toggleMuted()],
    [mediaCommands.seek, source => this.#seekToSourceValue(source)],
    [mediaCommands.seekToStart, () => this.#setCurrentTime(0)],
    [mediaCommands.seekToEnd, () => this.#seekToEnd()],
    [mediaCommands.seekBackward, source => this.#seekBySourceValue(source, -1, mediaCommands.seekBackward)],
    [mediaCommands.seekForward, source => this.#seekBySourceValue(source, 1, mediaCommands.seekForward)],
    [mediaCommands.setVolume, source => this.#setVolumeFromSource(source)],
    [mediaCommands.setPlaybackRate, source => this.#setPlaybackRateFromSource(source)],
    [mediaCommands.enterFullscreen, () => this.#enterFullscreen()],
    [mediaCommands.exitFullscreen, () => this.#exitFullscreen()],
    [mediaCommands.toggleFullscreen, () => this.#toggleFullscreen()]
  ]);

  render() {
    return html`
      <div internal-host>
        <slot @slotchange=${this.#syncMediaSlot}></slot>
      </div>
    `;
  }

  /** The latest immutable media and full-screen state snapshot. */
  get mediaState(): MediaState {
    return this.#mediaState;
  }

  get value(): MediaState {
    return this.mediaState;
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('command', this.#onCommand as EventListener);
    globalThis.document?.addEventListener('fullscreenchange', this.#syncFullscreen);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('command', this.#onCommand as EventListener);
    globalThis.document?.removeEventListener('fullscreenchange', this.#syncFullscreen);
    this.#setMedia(null);
  }

  firstUpdated(changedProperties: PropertyValues<this>) {
    super.firstUpdated(changedProperties);
    this.#syncMediaSlot();
  }

  #onCommand = (event: MediaCommandEvent) => {
    if (!isMediaCommand(event.command)) {
      console.warn('nve-media-controller unsupported command', event.command);
      return;
    }

    this.#commandHandlers.get(event.command)?.(event.source ?? null);
  };

  #syncMediaSlot = () => {
    const slot = this.renderRoot.querySelector<HTMLSlotElement>('slot');
    const media = (slot?.assignedElements({ flatten: true }) ?? []).filter(isSupportedMediaElement);
    if (media.length > 1) {
      console.warn('nve-media-controller multiple media element');
    }
    this.#setMedia(media[0] ?? null);
  };

  #setMedia(media: HTMLMediaElement | null) {
    if (media === this.#media) {
      this.#syncMediaState();
      return;
    }

    this.#media && mediaEventTypes.forEach(type => this.#media?.removeEventListener(type, this.#syncMediaState));
    this.#media = media;
    this.#media && mediaEventTypes.forEach(type => this.#media?.addEventListener(type, this.#syncMediaState));
    this.#syncMediaState();
  }

  #syncMediaState = () => {
    this.#setMediaState(createMediaState({ ...getMediaState(this.#media), fullscreen: this.#fullscreen }));
  };

  #syncFullscreen = () => {
    this.#fullscreen = globalThis.document?.fullscreenElement === this;
    this.#syncMediaState();
  };

  #setMediaState(state: MediaState) {
    this.#currentTime = state.currentTime;
    setBooleanAttribute(this, 'paused', state.paused);
    setBooleanAttribute(this, 'muted', state.muted);
    setBooleanAttribute(this, 'ended', state.ended);
    setBooleanAttribute(this, 'seeking', state.seeking);
    setBooleanAttribute(this, 'fullscreen', state.fullscreen);
    setNumberAttribute(this, 'current-time', state.currentTime);
    setNumberAttribute(this, 'duration', state.duration);
    setNumberAttribute(this, 'volume', state.volume);
    setNumberAttribute(this, 'playback-rate', state.playbackRate);

    if (mediaStatesEqual(this.#mediaState, state)) {
      return;
    }

    this.#mediaState = state;
    this.dispatchEvent(new CustomEvent('media-state-change', { detail: state }));
  }

  #play() {
    const media = this.#getMedia();
    media && void media.play().catch(error => console.warn('nve-media-controller play failed', error));
  }

  #pause() {
    this.#getMedia()?.pause();
  }

  #togglePlayback() {
    if (this.#getMedia()?.paused) {
      this.#play();
    } else {
      this.#pause();
    }
  }

  #setMuted(muted: boolean) {
    const media = this.#getMedia();
    if (media) {
      media.muted = muted;
      this.#syncMediaState();
    }
  }

  #toggleMuted() {
    const media = this.#getMedia();
    if (media) {
      media.muted = !media.muted;
      this.#syncMediaState();
    }
  }

  #seekToSourceValue(source: MediaCommandSource | null) {
    const value = getSourceNumber(source);
    Number.isFinite(value) ? this.#setCurrentTime(value) : this.#warnInvalidCommandValue(mediaCommands.seek);
  }

  #seekBySourceValue(source: MediaCommandSource | null, direction: -1 | 1, command: MediaCommand) {
    const value = getSourceNumber(source);
    Number.isFinite(value)
      ? this.#setCurrentTime(this.#getCurrentTime() + value * direction)
      : this.#warnInvalidCommandValue(command);
  }

  #seekToEnd() {
    Number.isFinite(this.#media?.duration)
      ? this.#setCurrentTime(this.#media?.duration ?? 0)
      : this.#warnInvalidCommandValue(mediaCommands.seekToEnd);
  }

  #setCurrentTime(value: number) {
    const media = this.#getMedia();
    if (media && Number.isFinite(value)) {
      media.currentTime = clamp(value, 0, Number.isFinite(media.duration) ? media.duration : Number.POSITIVE_INFINITY);
      this.#syncMediaState();
    }
  }

  #getCurrentTime() {
    return Number.isFinite(this.#media?.currentTime) ? (this.#media?.currentTime ?? 0) : this.#currentTime;
  }

  #setVolumeFromSource(source: MediaCommandSource | null) {
    const value = getSourceNumber(source);
    Number.isFinite(value) ? this.#setVolume(value) : this.#warnInvalidCommandValue(mediaCommands.setVolume);
  }

  #setVolume(value: number) {
    const media = this.#getMedia();
    if (media) {
      media.volume = clamp(value, 0, 1);
      this.#syncMediaState();
    }
  }

  #setPlaybackRateFromSource(source: MediaCommandSource | null) {
    const value = getSourceNumber(source);
    Number.isFinite(value) && value > 0
      ? this.#setPlaybackRate(value)
      : this.#warnInvalidCommandValue(mediaCommands.setPlaybackRate);
  }

  #setPlaybackRate(value: number) {
    const media = this.#getMedia();
    if (media) {
      media.playbackRate = value;
      this.#syncMediaState();
    }
  }

  #enterFullscreen() {
    void this.requestFullscreen?.().catch(error => console.warn('nve-media-controller fullscreen failed', error));
  }

  #exitFullscreen() {
    const document = globalThis.document;
    if (document?.fullscreenElement === this) {
      void document.exitFullscreen().catch(error => console.warn('nve-media-controller fullscreen exit failed', error));
    }
  }

  #toggleFullscreen() {
    this.#fullscreen ? this.#exitFullscreen() : this.#enterFullscreen();
  }

  #getMedia() {
    if (!this.#media) {
      console.warn('nve-media-controller missing media element');
    }
    return this.#media;
  }

  #warnInvalidCommandValue(command: MediaCommand) {
    console.warn('nve-media-controller invalid command value', command);
  }
}

function isSupportedMediaElement(element: Element): element is HTMLMediaElement {
  return Boolean(globalThis.HTMLMediaElement && element instanceof globalThis.HTMLMediaElement);
}

function getMediaState(media: HTMLMediaElement | null) {
  if (!media) {
    return {
      paused: true,
      muted: false,
      ended: false,
      seeking: false,
      currentTime: 0,
      duration: 0,
      volume: 1,
      playbackRate: 1
    };
  }

  return {
    paused: media.paused,
    muted: media.muted,
    ended: media.ended,
    seeking: media.seeking,
    currentTime: getFiniteNumber(media.currentTime, 0),
    duration: getFiniteNumber(media.duration, 0),
    volume: getFiniteNumber(media.volume, 1),
    playbackRate: getFiniteNumber(media.playbackRate, 1)
  };
}

function setBooleanAttribute(element: HTMLElement, attribute: string, value: boolean) {
  element.toggleAttribute(attribute, value);
}

function setNumberAttribute(element: HTMLElement, attribute: string, value: number) {
  element.setAttribute(attribute, `${value}`);
}

function getFiniteNumber(value: number, fallback: number) {
  return Number.isFinite(value) ? value : fallback;
}

function getSourceNumber(source: MediaCommandSource | null) {
  const value = source?.valueAsNumber ?? source?.value;
  return Number(value);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
