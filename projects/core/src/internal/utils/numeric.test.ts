// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { finiteOr, nonnegativeFiniteOr, positiveFiniteOr } from '@nvidia-elements/core/internal';

const fallback = 42;

describe('finiteOr', () => {
  it.each([
    ['undefined', undefined, fallback],
    ['NaN', Number.NaN, fallback],
    ['positive infinity', Number.POSITIVE_INFINITY, fallback],
    ['negative infinity', Number.NEGATIVE_INFINITY, fallback],
    ['zero', 0, 0],
    ['a negative finite value', -1, -1],
    ['a positive finite value', 1, 1]
  ])('returns %s unchanged only when it is finite', (_description, value, expected) => {
    expect(finiteOr(value, fallback)).toBe(expected);
  });
});

describe('nonnegativeFiniteOr', () => {
  it.each([
    ['undefined', undefined, fallback],
    ['NaN', Number.NaN, fallback],
    ['positive infinity', Number.POSITIVE_INFINITY, fallback],
    ['negative infinity', Number.NEGATIVE_INFINITY, fallback],
    ['zero', 0, 0],
    ['a negative finite value', -1, fallback],
    ['a positive finite value', 1, 1]
  ])('returns %s unchanged only when it is nonnegative and finite', (_description, value, expected) => {
    expect(nonnegativeFiniteOr(value, fallback)).toBe(expected);
  });
});

describe('positiveFiniteOr', () => {
  it.each([
    ['undefined', undefined, fallback],
    ['NaN', Number.NaN, fallback],
    ['positive infinity', Number.POSITIVE_INFINITY, fallback],
    ['negative infinity', Number.NEGATIVE_INFINITY, fallback],
    ['zero', 0, fallback],
    ['a negative finite value', -1, fallback],
    ['a positive finite value', 1, 1]
  ])('returns %s unchanged only when it is positive and finite', (_description, value, expected) => {
    expect(positiveFiniteOr(value, fallback)).toBe(expected);
  });
});
