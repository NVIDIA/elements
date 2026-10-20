// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { BoundsAccumulator, type SceneBounds } from './bounds.js';
import type { Vec3 } from './types.js';

/** Offsets and strides count numeric elements; count is the available point count. Zero stride broadcasts xyz. */
export interface PointBoundsSpan {
  readonly values: ArrayLike<number>;
  readonly count: number;
  readonly offset?: number;
  readonly stride?: number;
  readonly indices?: ArrayLike<number> | null;
}

/**
 * Reduces a strided xyz span or its selected indices to independent, frozen bounds.
 * Checks span boundaries, selected indices, and selected coordinates. Empty selections return null.
 * Runs in linear time and constant working space without allocating per point or changing input storage.
 */
export function pointBounds(span: PointBoundsSpan): SceneBounds | null {
  const { values, count, offset = 0, stride = 3, indices } = span;
  assertPointSpan({ length: values.length, count, offset, stride });
  const bounds = new BoundsAccumulator();
  const point: Vec3 = [0, 0, 0];
  const selectedCount = indices?.length ?? count;
  for (let selected = 0; selected < selectedCount; selected += 1) {
    const index = indices ? indices[selected]! : selected;
    if (!Number.isSafeInteger(index) || index < 0 || index >= count) {
      throw new RangeError('Bounds indices must select available points.');
    }
    const address = offset + index * stride;
    point[0] = values[address]!;
    point[1] = values[address + 1]!;
    point[2] = values[address + 2]!;
    bounds.include(point);
  }
  return bounds.bounds;
}

/** Returns frozen minimum and maximum values in linear time and constant space; empty input returns null. */
export function scalarBounds(values: ArrayLike<number>): readonly [minimum: number, maximum: number] | null {
  if (values.length === 0) return null;
  let minimum = Number.POSITIVE_INFINITY;
  let maximum = Number.NEGATIVE_INFINITY;
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index]!;
    if (!Number.isFinite(value)) throw new RangeError('Bounds values must be finite.');
    minimum = Math.min(minimum, value);
    maximum = Math.max(maximum, value);
  }
  return Object.freeze([minimum, maximum]);
}

function assertPointSpan(span: { length: number; count: number; offset: number; stride: number }): void {
  const { length, count, offset, stride } = span;
  if (![count, offset, stride].every(value => Number.isSafeInteger(value) && value >= 0)) {
    throw new RangeError('Bounds count, offset, and stride must be nonnegative safe integers.');
  }
  const end = offset + (count === 0 ? 0 : (count - 1) * stride + 3);
  if (!Number.isSafeInteger(end) || end > length) throw new RangeError('Bounds points must fit their storage.');
}
