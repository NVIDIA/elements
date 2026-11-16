// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { getMeterRange } from './meter-range.js';

describe('meter range', () => {
  it.each([
    { min: 10, max: 110, value: 30, result: [10, 110, 30, 0.2] },
    { min: -50, max: 50, value: 0, result: [-50, 50, 0, 0.5] },
    { min: 10, max: 110, value: -20, result: [10, 110, 10, 0] },
    { min: 10, max: 110, value: 200, result: [10, 110, 110, 1] },
    { min: 10, max: 5, value: 30, result: [10, 10, 10, 0] },
    { min: 0, max: 0, value: 0, result: [0, 0, 0, 0] },
    { min: NaN, max: Infinity, value: 30, result: [0, 100, 30, 0.3] },
    { min: 20, max: 100, value: NaN, result: [20, 100, 20, 0] },
    { min: 20, max: 100, value: Infinity, result: [20, 100, 20, 0] }
  ])('should resolve $min / $value / $max to $result', ({ result, ...input }) => {
    const { min, max, value, fraction } = getMeterRange(input);
    expect([min, max, value, fraction]).toEqual(result);
  });
});
