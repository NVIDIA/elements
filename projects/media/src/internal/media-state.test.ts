// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { createMediaState, getTargetMediaState, isMediaState, mediaStatesEqual } from './media-state.js';

describe(createMediaState.name, () => {
  it('should copy and freeze buffered time spans', () => {
    const buffered = [{ start: 0, end: 10 }];
    const state = createMediaState({ buffered });
    buffered[0].end = 20;

    expect(state.buffered).toEqual([{ start: 0, end: 10 }]);
    expect(Object.isFrozen(state)).toBe(true);
    expect(Object.isFrozen(state.buffered)).toBe(true);
    expect(Object.isFrozen(state.buffered[0])).toBe(true);
  });
});

describe(isMediaState.name, () => {
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
