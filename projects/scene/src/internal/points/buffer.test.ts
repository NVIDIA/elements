// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { POINT } from '../layouts/built-ins.js';
import { readPoint } from '../layouts/helpers.js';
import { PointBuffer } from './buffer.js';

describe('point buffer', () => {
  it('should allocate fixed capacity and support allocation-free writes', () => {
    const points = new PointBuffer({ capacity: 2 });

    expect(points.bytes).toHaveLength(2 * POINT.stride);
    expect(points.capacity).toBe(2);
    expect(points.count).toBe(0);
    expect(readPoint(points.bytes, 1)).toEqual({ color: [1, 1, 1, 1], position: [0, 0, 0] });

    points.set(0, { color: 'cyan', position: [1, 2, 3] }).set(1, { color: [1, 0, 0, 0.5] });

    expect(points.count).toBe(2);
    expect(readPoint(points.bytes, 0)).toEqual({ color: [0, 1, 1, 1], position: [1, 2, 3] });
    expect(readPoint(points.bytes, 1).color).toEqual([1, 0, 0, 128 / 255]);
    expect(() => points.set(3, {})).toThrow(RangeError);
  });

  it('should return stable mutable handles on demand', () => {
    const points = new PointBuffer({ capacity: 1 });
    const point = points.add({ position: [1, 2, 3] });

    expect(point).toBe(points.at(0));
    const initialVersion = points.version;
    point.position.set(4, 5, 6);
    point.color = 'magenta';
    expect(points.version).toBe(initialVersion);
    points.commit(0, 1);
    expect(points.version).toBe(initialVersion + 1);

    expect(point.position.toArray()).toEqual([4, 5, 6]);
    expect(point.color).toEqual([1, 0, 1, 1]);
    expect(readPoint(points.bytes, 0).position).toEqual([4, 5, 6]);
    expect(() => points.at(1)).toThrow(RangeError);
  });

  it('should reject invalid capacities, colors, values, and overflow', () => {
    expect(() => new PointBuffer({ capacity: -1 })).toThrow(RangeError);

    const points = new PointBuffer({ capacity: 1 });
    expect(() => points.add({ color: 'not-a-color' })).toThrow(TypeError);
    expect(() => points.add({ position: [Number.NaN, 0, 0] })).toThrow(RangeError);
    points.add();
    expect(() => points.add()).toThrow(RangeError);
  });
});
