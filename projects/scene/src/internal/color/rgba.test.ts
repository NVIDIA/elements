// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { copyRGBA, sameRGBA } from './rgba.js';
import type { RGBA } from './types.js';

describe(copyRGBA.name, () => {
  it('captures independent normalized channels while retaining transparent RGB and signed zero', () => {
    const source: RGBA = [-0, 0.5, 1, 0];
    const captured = copyRGBA(source);
    expect(captured).toEqual([-0, 0.5, 1, 0]);
    expect(captured).not.toBe(source);
    source.fill(1);
    expect(captured).toEqual([-0, 0.5, 1, 0]);
    expect(copyRGBA(Object.freeze([1, 0, 0.25, 1]))).toEqual([1, 0, 0.25, 1]);
  });

  it.each([
    { value: undefined },
    { value: null },
    { value: 'red' },
    { value: new Float32Array([1, 0, 0, 1]) },
    { value: [0, 0, 0] },
    { value: [0, 0, 0, 1, 1] },
    { value: new Array(4) },
    { value: ['1', 0, 0, 1] },
    { value: [NaN, 0, 0, 1] },
    { value: [0, Infinity, 0, 1] },
    { value: [0, 0, -Infinity, 1] },
    { value: [0, 0, 0, NaN] },
    { value: [-Number.MIN_VALUE, 0, 0, 1] },
    { value: [0, 1 + Number.EPSILON, 0, 1] },
    { value: [0, 0, 0, 2] }
  ])('rejects malformed, nonfinite, or out-of-range tuple fixture %#', ({ value }) => {
    expect(() => copyRGBA(value)).toThrow(RangeError);
  });

  it('retains finite validation before range validation', () => {
    expect(() => copyRGBA([2, 0, 0, NaN])).toThrow('Record values must be finite.');
    expect(() => copyRGBA([2, 0, 0, 1])).toThrow('Record color channels must be in the range 0..1.');
  });
});

describe(sameRGBA.name, () => {
  it('compares every channel exactly and accepts readonly tuples', () => {
    const color = Object.freeze<RGBA>([0.25, 0.5, 0.75, 1]);
    expect(sameRGBA(color, copyRGBA(color))).toBe(true);
    for (let channel = 0; channel < 4; channel += 1) {
      const changed = copyRGBA(color);
      changed[channel] = 0;
      expect(sameRGBA(color, changed)).toBe(false);
    }
    expect(sameRGBA([-0, 0, 0, 1], [0, 0, 0, 1])).toBe(true);
  });
});
