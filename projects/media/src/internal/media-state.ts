// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/** A contiguous span of media time in seconds. */
export interface MediaTimeSpan {
  readonly start: number;
  readonly end: number;
}

export interface MediaState {
  /** Ordered, disjoint spans of media time that the browser has buffered. */
  readonly buffered: readonly MediaTimeSpan[];
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

const emptyMediaTimeSpans: readonly MediaTimeSpan[] = Object.freeze([]);

const defaultMediaState: MediaState = {
  buffered: emptyMediaTimeSpans,
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
  const buffered = freezeMediaTimeSpans(state.buffered ?? defaultMediaState.buffered);
  return Object.freeze({ ...defaultMediaState, ...state, buffered });
}

export function isMediaState(value: unknown): value is MediaState {
  return (
    isRecord(value) &&
    isMediaTimeSpans(value.buffered) &&
    booleanStateKeys.every(key => typeof value[key] === 'boolean') &&
    numberStateKeys.every(key => typeof value[key] === 'number')
  );
}

export function mediaStatesEqual(a: MediaState, b: MediaState) {
  return (
    mediaTimeSpansEqual(a.buffered, b.buffered) &&
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

export function isMediaTimeSpans(value: unknown): value is readonly MediaTimeSpan[] {
  if (!Array.isArray(value)) {
    return false;
  }

  let previousEnd = Number.NEGATIVE_INFINITY;
  for (const span of value) {
    if (
      !isRecord(span) ||
      typeof span.start !== 'number' ||
      typeof span.end !== 'number' ||
      !Number.isFinite(span.start) ||
      !Number.isFinite(span.end) ||
      span.start >= span.end ||
      span.start < previousEnd
    ) {
      return false;
    }
    previousEnd = span.end;
  }

  return true;
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

function freezeMediaTimeSpans(spans: readonly MediaTimeSpan[]): readonly MediaTimeSpan[] {
  if (spans.length === 0) {
    return emptyMediaTimeSpans;
  }

  return Object.freeze(spans.map(({ start, end }) => Object.freeze({ start, end })));
}

function mediaTimeSpansEqual(a: readonly MediaTimeSpan[], b: readonly MediaTimeSpan[]) {
  return (
    a.length === b.length && a.every((span, index) => span.start === b[index]?.start && span.end === b[index]?.end)
  );
}
