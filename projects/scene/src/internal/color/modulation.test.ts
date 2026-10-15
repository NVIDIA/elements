// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { PreparedRGBAModulation } from './modulation.js';
import type { RGBA } from './types.js';

describe(PreparedRGBAModulation.name, () => {
  it('multiplies RGB in linear light and alpha directly without changing neighboring output', () => {
    const modulation = new PreparedRGBAModulation([0.7, 0.5, 0.2, 0.8]);
    const source = Object.freeze([99, 0.25, 0.5, 0.75, 0.8, 88]);
    const target = new Float32Array(8).fill(-1);
    expect(modulation.writeColor(source, 1, target, 2)).toBe(target);
    expect([...target]).toEqual([
      -1, -1, 0.16327014565467834, 0.2369668185710907, 0.13957345485687256, 0.6399999856948853, -1, -1
    ]);
    expect(source).toEqual([99, 0.25, 0.5, 0.75, 0.8, 88]);
  });

  it('captures tint coefficients independently and rounds only into destination storage', () => {
    const tint: RGBA = [0.5, 0.5, 0.5, 0.8];
    const modulation = new PreparedRGBAModulation(tint);
    const source: RGBA = [0.5, 0.5, 0.5, 0.5];
    const precise = new Float64Array(4);
    const gpu = new Float32Array(4);
    tint.fill(0);
    modulation.writeColor(source, 0, precise, 0);
    modulation.writeColor(source, 0, gpu, 0);
    expect(precise[0]).toBeCloseTo(0.23696682464454982, 14);
    expect(precise[1]).toBe(precise[0]);
    expect(precise[2]).toBe(precise[0]);
    expect(precise[3]).toBe(0.4);
    expect(gpu).toEqual(new Float32Array(precise));
  });

  it('supports exact and partially overlapping color spans', () => {
    const modulation = new PreparedRGBAModulation([0.5, 0.5, 0.5, 0.5]);
    const expected: RGBA = [0, 0, 0, 0];
    const color: RGBA = [0.25, 0.5, 0.75, 1];
    modulation.writeColor(color, 0, expected, 0);
    expect(modulation.writeColor(color, 0, color, 0)).toBe(color);
    expect(color).toEqual(expected);
    const shared = new Float64Array([0.25, 0.5, 0.75, 1, 9, 9]);
    modulation.writeColor(shared, 0, shared, 1);
    expect([...shared]).toEqual([0.25, ...expected, 9]);
  });

  it('retains signed zero and transparent RGB and treats white as a tint identity at Float32 precision', () => {
    const colors = new Float32Array([-0, 0, 1, 0, 0.25, 0.5, 0.75, 0.8]);
    const identity = new PreparedRGBAModulation([1, 1, 1, 1]);
    const target = new Float32Array(colors.length);
    identity.writeColor(colors, 0, target, 0);
    identity.writeColor(colors, 4, target, 4);
    expect(target).toEqual(colors);
    new PreparedRGBAModulation([0.7, 0.5, 0.2, 0.8]).writeColor(colors, 0, target, 0);
    expect([...target.subarray(0, 4)]).toEqual([-0, 0, Math.fround(0.2), 0]);
  });

  it('validates all tint channels before capturing coefficients', () => {
    expect(() => new PreparedRGBAModulation([0, 0, 0, NaN])).toThrow(RangeError);
    expect(() => new PreparedRGBAModulation([-1, 0, 0, 1])).toThrow(RangeError);
  });
});
