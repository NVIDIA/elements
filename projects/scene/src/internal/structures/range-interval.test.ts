// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { assertRangeInterval } from './range-interval.js';

describe(assertRangeInterval.name, () => {
  it.each([
    [0, 0],
    [0, 4],
    [3, 0],
    [3, 4],
    [-0, -0],
    [Number.MAX_SAFE_INTEGER, 0],
    [0, Number.MAX_SAFE_INTEGER],
    [Number.MAX_SAFE_INTEGER - 1, 1]
  ])('accepts offset %s and size %s within the safe integer range', (offset, size) => {
    expect(() => assertRangeInterval(offset, size)).not.toThrow();
  });

  it.each([-1, -0.5, 0.5, NaN, Infinity, -Infinity, Number.MAX_SAFE_INTEGER + 1])(
    'rejects %s as either an offset or a size',
    value => {
      expect(() => assertRangeInterval(value, 0)).toThrow(RangeError);
      expect(() => assertRangeInterval(0, value)).toThrow(RangeError);
    }
  );

  it.each([
    [Number.MAX_SAFE_INTEGER, 1],
    [Number.MAX_SAFE_INTEGER - 1, 2],
    [2 ** 52, 2 ** 52]
  ])('rejects individually safe offset %s and size %s when their endpoint overflows', (offset, size) => {
    expect(() => assertRangeInterval(offset, size)).toThrow(RangeError);
  });
});
