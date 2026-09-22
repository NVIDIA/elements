// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { Float64RingBuffer } from './float64-ring-buffer.js';

describe(Float64RingBuffer.name, () => {
  it('starts empty and fills before overwriting the oldest sample', () => {
    const samples = new Float64RingBuffer(3);
    expect(samples.capacity).toBe(3);
    expect(samples.length).toBe(0);
    expect(samples.snapshot()).toEqual(new Float64Array());
    samples.push(1.25);
    samples.push(2.5);
    expect(samples.length).toBe(2);
    expect(samples.snapshot()).toEqual(new Float64Array([1.25, 2.5]));
    samples.push(3.75);
    samples.push(4.5);
    expect(samples.length).toBe(3);
    expect(samples.capacity).toBe(3);
    expect(samples.snapshot()).toEqual(new Float64Array([2.5, 3.75, 4.5]));
    expect([samples.get(0), samples.get(1), samples.get(2)]).toEqual([2.5, 3.75, 4.5]);
  });

  it('returns independent snapshots that survive later writes and clearing', () => {
    const samples = new Float64RingBuffer(3);
    for (const value of [1, 2, 3, 4]) samples.push(value);
    const snapshot = samples.snapshot();
    const independent = samples.snapshot();
    snapshot[0] = 100;
    expect(independent).toEqual(new Float64Array([2, 3, 4]));
    expect(samples.get(0)).toBe(2);
    samples.push(5);
    expect(independent).toEqual(new Float64Array([2, 3, 4]));
    samples.clear();
    expect(samples.capacity).toBe(3);
    expect(samples.length).toBe(0);
    expect(samples.get(0)).toBeUndefined();
    expect(samples.snapshot()).toEqual(new Float64Array());
    samples.push(6);
    expect(samples.snapshot()).toEqual(new Float64Array([6]));
    expect(independent).toEqual(new Float64Array([2, 3, 4]));
  });

  it('keeps Float64 values including signed zero and nonfinite samples', () => {
    const values = [Math.PI, Number.EPSILON, -0, Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY];
    const samples = new Float64RingBuffer(values.length);
    for (const value of values) samples.push(value);
    expect(samples.snapshot()).toEqual(new Float64Array(values));
    for (const [index, value] of values.entries()) expect(Object.is(samples.get(index), value)).toBe(true);
  });

  it.each([0, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, Number.MAX_SAFE_INTEGER + 1])(
    'rejects invalid capacity (%s)',
    capacity => expect(() => new Float64RingBuffer(capacity)).toThrow(RangeError)
  );

  it.each([-1, 0.5, 2, Number.NaN, Number.POSITIVE_INFINITY, Number.MAX_SAFE_INTEGER + 1])(
    'returns no sample for an invalid or inactive index (%s)',
    index => {
      const samples = new Float64RingBuffer(3);
      samples.push(1);
      samples.push(2);
      expect(samples.get(index)).toBeUndefined();
    }
  );

  it.each([1, 2, 5, 240, 300])('matches a sliding reference through repeated wraparound at capacity %s', capacity => {
    const samples = new Float64RingBuffer(capacity);
    const reference: number[] = [];
    for (let step = 0; step < capacity * 4 + 7; step += 1) {
      const value = step / 7;
      samples.push(value);
      reference.push(value);
      if (reference.length > capacity) reference.shift();
      expect(samples.length).toBe(reference.length);
      expect(samples.snapshot()).toEqual(new Float64Array(reference));
      for (let index = 0; index < reference.length; index += 1) expect(samples.get(index)).toBe(reference[index]);
    }
  });
});
