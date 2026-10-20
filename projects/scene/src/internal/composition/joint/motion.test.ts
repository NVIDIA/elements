// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { captureJointAxis, composeJointMotion } from './motion.js';
import type { ScenePose } from '../../math/types.js';

describe('joint motion', () => {
  it('captures normalized axes without changing input, including extreme finite magnitudes', () => {
    const axis = [0, 3, 4];
    captureJointAxis(axis)!.forEach((value, index) => expect(value).toBeCloseTo([0, 0.6, 0.8][index]!));
    expect(axis).toEqual([0, 3, 4]);
    expect(captureJointAxis([Number.MAX_VALUE, 0, 0])).toEqual([1, 0, 0]);
    expect(captureJointAxis([Number.MIN_VALUE, 0, 0])).toEqual([1, 0, 0]);
  });

  it.each([
    { axis: null },
    { axis: {} },
    { axis: [0, 0] },
    { axis: [0, 0, 0] },
    { axis: [1, 0, 0, 0] },
    { axis: [NaN, 0, 0] },
    { axis: [Infinity, 0, 0] },
    { axis: ['1', 0, 0] }
  ])('rejects malformed or zero axis $axis', ({ axis }) => expect(captureJointAxis(axis)).toBeNull());

  it('moves prismatic joints along the rotated local axis without mutating the origin', () => {
    const origin: ScenePose = { position: [10, 20, 30], orientation: [0, 0, Math.SQRT2, Math.SQRT2] };
    const pose = composeJointMotion(origin, { type: 'prismatic', axis: [1, 0, 0], value: -2 });
    expect(pose.position[0]).toBeCloseTo(10);
    expect(pose.position[1]).toBeCloseTo(18);
    expect(pose.position[2]).toBe(30);
    expect(Math.hypot(...pose.orientation)).toBeCloseTo(1);
    expect(origin.position).toEqual([10, 20, 30]);
    expect(origin.orientation).toEqual([0, 0, Math.SQRT2, Math.SQRT2]);
  });

  it.each(['revolute', 'continuous'] as const)('composes %s rotation after the origin rotation', type => {
    const pose = composeJointMotion(
      { position: [1, 2, 3], orientation: [Math.SQRT1_2, 0, 0, Math.SQRT1_2] },
      { type, axis: [0, 0, 1], value: Math.PI }
    );
    expect(pose.position).toEqual([1, 2, 3]);
    pose.orientation.forEach((value, index) => expect(value).toBeCloseTo([0, -Math.SQRT1_2, Math.SQRT1_2, 0][index]!));
  });

  it('leaves a fixed joint at its authored origin regardless of value', () => {
    const origin: ScenePose = { position: [1, 2, 3], orientation: [0, 0, 0, 1] };
    expect(composeJointMotion(origin, { type: 'fixed', axis: [1, 0, 0], value: 100 })).toEqual(origin);
  });
});
