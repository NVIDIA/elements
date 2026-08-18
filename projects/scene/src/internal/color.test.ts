// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { parseCSSColor, srgbToLinear } from './color.js';

describe('scene colors', () => {
  it('should parse CSS colors with alpha and reject unsupported values', () => {
    expect(parseCSSColor('rgb(255 128 0 / 50%)')).toEqual([1, 128 / 255, 0, 128 / 255]);
    expect(parseCSSColor('rebeccapurple')).toEqual([102 / 255, 51 / 255, 153 / 255, 1]);
    expect(parseCSSColor('var(--color)')).toBeNull();
    expect(parseCSSColor('not-a-color')).toBeNull();
  });

  it('should convert clamped sRGB channels to linear values', () => {
    expect(srgbToLinear(0)).toBe(0);
    expect(srgbToLinear(0.04045)).toBeCloseTo(0.0031308, 7);
    expect(srgbToLinear(0.5)).toBeCloseTo(0.214041, 6);
    expect(srgbToLinear(2)).toBe(1);
    expect(() => srgbToLinear(Number.NaN)).toThrow(RangeError);
  });
});
