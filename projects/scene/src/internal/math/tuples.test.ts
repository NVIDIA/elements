// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { isFiniteQuaternion, isFiniteVec3, toFiniteVec3 } from './tuples.js';

describe('finite tuples', () => {
  it('accepts finite vectors and quaternions without normalizing their components', () => {
    expect(isFiniteVec3([0, -2, Number.MAX_VALUE])).toBe(true);
    expect(isFiniteQuaternion([0, 0, 0, 0])).toBe(true);
    expect(isFiniteQuaternion([1, -2, 3, 4])).toBe(true);
    expect(isFiniteQuaternion([1, 2, 3])).toBe(false);
    expect(isFiniteVec3([1, 2, 3, 4])).toBe(false);
  });

  it.each([null, undefined, 3, '123', {}, [], [1, 2], new Float32Array([1, 2, 3])])('rejects non-tuples: %s', value => {
    expect(isFiniteVec3(value)).toBe(false);
    expect(isFiniteQuaternion(value)).toBe(false);
    expect(toFiniteVec3(value)).toBeNull();
  });

  it.each([NaN, Infinity, -Infinity, '1', null, undefined])('rejects non-finite components: %s', value => {
    for (let index = 0; index < 4; index += 1) {
      const quaternion: unknown[] = [0, 0, 0, 1];
      quaternion[index] = value;
      expect(isFiniteQuaternion(quaternion)).toBe(false);
      if (index < 3) {
        const vector = quaternion.slice(0, 3);
        expect(isFiniteVec3(vector)).toBe(false);
        expect(toFiniteVec3(vector)).toBeNull();
      }
    }
  });

  it('rejects sparse arrays that omit tuple components', () => {
    expect(isFiniteVec3(new Array(3))).toBe(false);
    expect(isFiniteQuaternion(new Array(4))).toBe(false);
    expect(toFiniteVec3([1, , 3])).toBeNull();
  });

  it('copies vectors without retaining the input array', () => {
    const source = [1, 2, 3];
    const copy = toFiniteVec3(source);
    expect(copy).toEqual([1, 2, 3]);
    expect(copy).not.toBe(source);
    source[0] = 8;
    expect(copy).toEqual([1, 2, 3]);
  });
});
