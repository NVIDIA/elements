// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { IDENTITY_QUATERNION, multiplyQuaternions, normalizeQuaternion, slerpQuaternions } from './quaternion.js';

describe('quaternion math', () => {
  it('should normalize a fixed known-answer quaternion', () => {
    const result = normalizeQuaternion([1, 2, 3, 4]);
    const length = Math.sqrt(30);

    expect(result).toEqual([1 / length, 2 / length, 3 / length, 4 / length]);
    expect(IDENTITY_QUATERNION).toEqual([0, 0, 0, 1]);
    expect(Object.isFrozen(IDENTITY_QUATERNION)).toBe(true);
  });

  it('should compose two fixed 90-degree orientations', () => {
    const halfSqrt = Math.SQRT1_2;
    const result = multiplyQuaternions([0, 0, halfSqrt, halfSqrt], [halfSqrt, 0, 0, halfSqrt]);

    expectQuaternionCloseTo(result, [0.5, 0.5, 0.5, 0.5]);
  });

  it('should slerp halfway through a fixed 180-degree orientation', () => {
    const result = slerpQuaternions([0, 0, 0, 1], [0, 0, 1, 0], 0.5);

    expectQuaternionCloseTo(result, [0, 0, Math.SQRT1_2, Math.SQRT1_2]);
  });

  it('should choose the shortest path and handle nearly identical quaternions', () => {
    expectQuaternionCloseTo(slerpQuaternions([0, 0, 0, 1], [0, 0, 0, -1], 0.25), [0, 0, 0, 1]);
    expectQuaternionCloseTo(slerpQuaternions([0, 0, 0, 1], [0, 0, 0.001, 1], 0.5), [0, 0, 0.0005, 1], 6);
  });

  it('should reject zero, nonfinite, and invalid interpolation inputs', () => {
    expect(() => normalizeQuaternion([0, 0, 0, 0])).toThrow(RangeError);
    expect(() => normalizeQuaternion([0, Number.NaN, 0, 1])).toThrow(RangeError);
    expect(() => slerpQuaternions([0, 0, 0, 1], [0, 0, 0, 1], Infinity)).toThrow(RangeError);
  });

  it('should reject short and long quaternion tuples at the JavaScript boundary', () => {
    expect(() => callWithUnknownArgs(normalizeQuaternion, [[0, 0, 1]])).toThrow(RangeError);
    expect(() => callWithUnknownArgs(normalizeQuaternion, [[0, 0, 0, 1, 2]])).toThrow(RangeError);
    expect(() =>
      callWithUnknownArgs(multiplyQuaternions, [
        [0, 0, 0, 1],
        [0, 0, 0, 1, 2]
      ])
    ).toThrow(RangeError);
  });
});

function expectQuaternionCloseTo(actual: readonly number[], expected: readonly number[], precision = 12): void {
  actual.forEach((value, index) => expect(value).toBeCloseTo(expected[index] ?? Number.NaN, precision));
}

function callWithUnknownArgs(callback: unknown, args: readonly unknown[]): unknown {
  return Reflect.apply(callback as (...args: readonly unknown[]) => unknown, undefined, args);
}
