// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export interface MediaState {
  readonly currentTime: number;
  readonly duration: number;
  readonly ended: boolean;
  readonly fullscreen: boolean;
  readonly muted: boolean;
  readonly paused: boolean;
  readonly playbackRate: number;
  readonly seeking: boolean;
  readonly volume: number;
}

export type MediaStateChangeEvent = CustomEvent<MediaState>;

export const mediaStateChange = 'media-state-change';

const booleanStateKeys = ['ended', 'fullscreen', 'muted', 'paused', 'seeking'] as const;

const numberStateKeys = ['currentTime', 'duration', 'playbackRate', 'volume'] as const;

const defaultMediaState: MediaState = {
  currentTime: 0,
  duration: 0,
  ended: false,
  fullscreen: false,
  muted: false,
  paused: true,
  playbackRate: 1,
  seeking: false,
  volume: 1
};

export function createMediaState(state: Partial<MediaState> = {}): MediaState {
  return Object.freeze({ ...defaultMediaState, ...state });
}

export function isMediaState(value: unknown): value is MediaState {
  return (
    isRecord(value) &&
    booleanStateKeys.every(key => typeof value[key] === 'boolean') &&
    numberStateKeys.every(key => typeof value[key] === 'number')
  );
}

export function mediaStatesEqual(a: MediaState, b: MediaState) {
  return (
    a.currentTime === b.currentTime &&
    a.duration === b.duration &&
    a.ended === b.ended &&
    a.fullscreen === b.fullscreen &&
    a.muted === b.muted &&
    a.paused === b.paused &&
    a.playbackRate === b.playbackRate &&
    a.seeking === b.seeking &&
    a.volume === b.volume
  );
}

export function getTargetMediaState(target: HTMLElement | null): MediaState | null {
  if (!target || !('mediaState' in target)) {
    return null;
  }

  return isMediaState(target.mediaState) ? target.mediaState : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object';
}
