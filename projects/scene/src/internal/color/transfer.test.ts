// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { decodeSrgbChannel, encodeSrgbChannel } from './transfer.js';

describe('sRGB transfer functions', () => {
  it('decodes and encodes endpoints and both transfer thresholds', () => {
    expect(decodeSrgbChannel(0)).toBe(0);
    expect(decodeSrgbChannel(1)).toBe(1);
    expect(decodeSrgbChannel(0.04045)).toBe(0.04045 / 12.92);
    expect(decodeSrgbChannel(0.040451)).toBe(((0.040451 + 0.055) / 1.055) ** 2.4);
    expect(decodeSrgbChannel(0.5)).toBeCloseTo(0.21404114048223255, 14);
    expect(encodeSrgbChannel(0)).toBe(0);
    expect(encodeSrgbChannel(1)).toBeCloseTo(1, 14);
    expect(encodeSrgbChannel(0.0031308)).toBe(0.0031308 * 12.92);
    expect(encodeSrgbChannel(0.003131)).toBe(1.055 * 0.003131 ** (1 / 2.4) - 0.055);
  });

  it('round trips normalized channels with the standard threshold discontinuity', () => {
    for (let index = 0; index <= 1000; index += 1) {
      const channel = index / 1000;
      expect(encodeSrgbChannel(decodeSrgbChannel(channel))).toBeCloseTo(channel, 12);
      expect(decodeSrgbChannel(encodeSrgbChannel(channel))).toBeCloseTo(channel, 12);
    }
    expect(encodeSrgbChannel(decodeSrgbChannel(0.04045))).toBeCloseTo(0.04045, 6);
  });

  it('preserves signed zero in the unchecked normalized kernels', () => {
    expect(Object.is(decodeSrgbChannel(-0), -0)).toBe(true);
    expect(Object.is(encodeSrgbChannel(-0), -0)).toBe(true);
  });
});
