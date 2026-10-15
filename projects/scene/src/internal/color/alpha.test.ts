// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import {
  classifyAlpha,
  EMPTY_ALPHA_SUMMARY,
  mergeAlphaSummaries,
  replaceAlphaSummary,
  summarizeAlpha,
  summarizeRGBAAlpha
} from './alpha.js';

function summary(values: ArrayLike<number>) {
  return summarizeAlpha({ values, offset: 0, stride: 1, count: values.length, opaqueValue: 1 });
}

describe('alpha summaries', () => {
  it('classifies every byte value and retains normalized float thresholds', () => {
    for (let value = 0; value < 256; value += 1) {
      expect(classifyAlpha(value, 255)).toBe(value === 0 ? 'zero' : value === 255 ? 'opaque' : 'partial');
    }
    expect(summary([-0, 0, Number.MIN_VALUE, 0.5, 1 - Number.EPSILON, 1])).toEqual({
      zero: 2,
      partial: 3,
      opaque: 1
    });
    expect(summarizeRGBAAlpha(new Float32Array([1, 1, 1, 0.999]))).toEqual({ zero: 0, partial: 1, opaque: 0 });
    expect(summarizeRGBAAlpha(new Uint8Array([255, 255, 255, 255]))).toEqual({ zero: 0, partial: 0, opaque: 1 });
  });

  it('reads only selected alpha channels within a typed array view', () => {
    const storage = new Float32Array([99, 99, 7, 7, 7, 0, 7, 7, 7, 0.5, 7, 7, 7, 1, 99]);
    const values = storage.subarray(2, 14);
    expect(summarizeRGBAAlpha(values)).toEqual({ zero: 1, partial: 1, opaque: 1 });
    expect(summarizeAlpha({ values, offset: 7, stride: 4, count: 2, opaqueValue: 1 })).toEqual({
      zero: 0,
      partial: 1,
      opaque: 1
    });
    expect(storage[0]).toBe(99);
  });

  it('combines summaries associatively and treats empty spans as the identity', () => {
    const first = Object.freeze(summary([0, 1, 0.5]));
    const second = Object.freeze(summary([1, 0]));
    const third = Object.freeze(summary([0.25, 1]));
    const combined = mergeAlphaSummaries(mergeAlphaSummaries(first, second), third);
    expect(combined).toEqual(summary([0, 1, 0.5, 1, 0, 0.25, 1]));
    expect(combined).toEqual(mergeAlphaSummaries(first, mergeAlphaSummaries(second, third)));
    expect(mergeAlphaSummaries(first, EMPTY_ALPHA_SUMMARY)).toEqual(first);
    expect(summarizeRGBAAlpha(null)).toEqual(EMPTY_ALPHA_SUMMARY);
    expect(summarizeRGBAAlpha(new Float32Array())).toEqual(EMPTY_ALPHA_SUMMARY);
    expect(summarizeRGBAAlpha(new Uint8Array())).toEqual(EMPTY_ALPHA_SUMMARY);
  });

  it('matches complete rescans across overlapping replacements and removal of the last partial alpha', () => {
    const values = new Float32Array(31).fill(1);
    let total = summary(values);
    for (let step = 0; step < 80; step += 1) {
      const start = (step * 7) % values.length;
      const count = Math.min(values.length - start, step % 5);
      const before = Object.freeze(summary(values.subarray(start, start + count)));
      const previous = Object.freeze(total);
      values.fill(([0, 0.5, 1] as const)[step % 3]!, start, start + count);
      total = replaceAlphaSummary(total, before, summary(values.subarray(start, start + count)));
      expect(total).toEqual(summary(values));
      expect(previous.zero + previous.partial + previous.opaque).toBe(values.length);
    }
    const before = Object.freeze(total);
    values.fill(1);
    expect(replaceAlphaSummary(total, before, summary(values))).toEqual({ zero: 0, partial: 0, opaque: 31 });
    expect(replaceAlphaSummary(total, EMPTY_ALPHA_SUMMARY, EMPTY_ALPHA_SUMMARY)).toEqual(total);
  });

  it('rejects invalid and overflowing spans before reading values', () => {
    for (const change of [
      { offset: -1 },
      { stride: 0 },
      { count: -1 },
      { count: 0.5 },
      { offset: 1 },
      { count: 2 },
      { stride: Number.MAX_SAFE_INTEGER, count: 3 }
    ]) {
      expect(() => summarizeAlpha({ values: [1], offset: 0, stride: 1, count: 1, opaqueValue: 1, ...change })).toThrow(
        RangeError
      );
    }
  });
});
