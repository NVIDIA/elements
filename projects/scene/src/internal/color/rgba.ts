// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { RGBA } from './types.js';

/** Captures exactly four finite normalized channels in independent, unpremultiplied storage. */
export function copyRGBA(value: unknown): RGBA {
  if (!Array.isArray(value) || value.length !== 4) {
    throw new RangeError('Record colors must contain four channels.');
  }
  const red: unknown = value[0],
    green: unknown = value[1],
    blue: unknown = value[2],
    alpha: unknown = value[3];
  if (!isFiniteChannel(red) || !isFiniteChannel(green) || !isFiniteChannel(blue) || !isFiniteChannel(alpha)) {
    throw new RangeError('Record values must be finite.');
  }
  const color: RGBA = [red, green, blue, alpha];
  if (color.some(channel => channel < 0 || channel > 1)) {
    throw new RangeError('Record color channels must be in the range 0..1.');
  }
  return color;
}

export function sameRGBA(left: Readonly<RGBA>, right: Readonly<RGBA>): boolean {
  return left[0] === right[0] && left[1] === right[1] && left[2] === right[2] && left[3] === right[3];
}

function isFiniteChannel(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}
