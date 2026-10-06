// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { createMediaState, getTargetMediaState, isMediaState, mediaStatesEqual } from './media-state.js';

describe(createMediaState.name, () => {
  it('should default loop state to false', () => {
    expect(createMediaState().loop).toBe(false);
    expect(createMediaState({ loop: true }).loop).toBe(true);
  });

  it('should copy and freeze buffered time spans', () => {
    const span = { start: 0, end: 10 };
    const buffered = [span];
    const state = createMediaState({ buffered });
    span.end = 20;

    expect(state.buffered).toEqual([{ start: 0, end: 10 }]);
    expect(Object.isFrozen(state)).toBe(true);
    expect(Object.isFrozen(state.buffered)).toBe(true);
    expect(Object.isFrozen(state.buffered[0])).toBe(true);
  });
});

describe(isMediaState.name, () => {
  it('should require a boolean loop state', () => {
    expect(isMediaState({ ...createMediaState(), loop: undefined })).toBe(false);
    expect(isMediaState({ ...createMediaState(), loop: 'true' })).toBe(false);
    expect(isMediaState(createMediaState({ loop: true }))).toBe(true);
  });

  it('should validate PiP state and availability as booleans', () => {
    expect(isMediaState({ ...createMediaState(), pip: 'true' })).toBe(false);
    expect(isMediaState({ ...createMediaState(), pipAvailable: undefined })).toBe(false);
    expect(isMediaState(createMediaState({ pip: true, pipAvailable: true }))).toBe(true);
  });

  it('should validate ordered and disjoint buffered time spans', () => {
    expect(
      isMediaState(
        createMediaState({
          buffered: [
            { start: 0, end: 10 },
            { start: 20, end: 30 }
          ]
        })
      )
    ).toBe(true);
    expect(isMediaState({ ...createMediaState(), buffered: [{ start: 10, end: 5 }] })).toBe(false);
    expect(
      isMediaState({
        ...createMediaState(),
        buffered: [
          { start: 10, end: 20 },
          { start: 15, end: 30 }
        ]
      })
    ).toBe(false);
  });
});

describe(getTargetMediaState.name, () => {
  it('should return only valid target state snapshots', () => {
    expect(getTargetMediaState(null)).toBe(null);
    expect(getTargetMediaState(document.createElement('div'))).toBe(null);

    const invalidTarget = Object.assign(document.createElement('div'), {
      mediaState: { ...createMediaState(), buffered: [{ start: 10, end: 5 }] }
    });
    expect(getTargetMediaState(invalidTarget)).toBe(null);

    const validState = createMediaState({ currentTime: 12 });
    const validTarget = Object.assign(document.createElement('div'), { mediaState: validState });
    expect(getTargetMediaState(validTarget)).toBe(validState);
  });
});

describe(mediaStatesEqual.name, () => {
  it('should detect loop-only changes', () => {
    expect(mediaStatesEqual(createMediaState(), createMediaState({ loop: true }))).toBe(false);
    expect(mediaStatesEqual(createMediaState({ loop: true }), createMediaState({ loop: true }))).toBe(true);
  });

  it('should compare PiP state and availability', () => {
    const state = createMediaState();
    expect(state.pip).toBe(false);
    expect(state.pipAvailable).toBe(false);
    expect(mediaStatesEqual(state, createMediaState({ pip: true }))).toBe(false);
    expect(mediaStatesEqual(state, createMediaState({ pipAvailable: true }))).toBe(false);
  });

  it('should compare buffered time spans by value', () => {
    const state = createMediaState({
      buffered: [
        { start: 0, end: 10 },
        { start: 20, end: 30 }
      ]
    });

    expect(
      mediaStatesEqual(
        state,
        createMediaState({
          buffered: [
            { start: 0, end: 10 },
            { start: 20, end: 30 }
          ]
        })
      )
    ).toBe(true);
    expect(
      mediaStatesEqual(
        state,
        createMediaState({
          buffered: [
            { start: 0, end: 15 },
            { start: 20, end: 30 }
          ]
        })
      )
    ).toBe(false);
  });
});
