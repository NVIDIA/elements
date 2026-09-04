// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { RecordSummary } from './record-summary.js';

describe('record summary', () => {
  it.each([0, 9, 1.5])('should reject unsupported bit counts (%s)', bitCount => {
    expect(() => new RecordSummary(bitCount)).toThrow(RangeError);
  });

  it('should build and update all-record and even-record channels across block boundaries', () => {
    const summary = new RecordSummary(3);
    summary.reset(258);
    summary.setInitialFlags(255, 1);
    summary.setInitialFlags(256, 2);
    summary.setInitialFlags(257, 4);
    summary.finishInitialFlags();

    expect(summary.has(1, 256)).toBe(true);
    expect(summary.has(1, 256, true)).toBe(false);
    expect(summary.has(2, 257, true)).toBe(true);
    expect(summary.has(4, 258, true)).toBe(false);

    expect(summary.updateFlags(256, 4)).toBe(true);
    expect(summary.updateFlags(256, 4)).toBe(false);
    expect(summary.updateFlags(257, 0)).toBe(true);
    expect(summary.has(2, 258)).toBe(false);
    expect(summary.has(4, 258, true)).toBe(true);
  });

  it('should build uniform initial flags without a record-by-record block scan', () => {
    const summary = new RecordSummary(3);
    summary.reset(258);
    summary.finishInitialFlags(5);

    expect(summary.has(1, 258)).toBe(true);
    expect(summary.has(1, 258, true)).toBe(true);
    expect(summary.has(2, 258)).toBe(false);
    expect(summary.has(4, 258)).toBe(true);
    expect(summary.updateFlags(257, 2)).toBe(true);
    expect(summary.has(2, 258)).toBe(true);
    expect(summary.has(2, 258, true)).toBe(false);
  });

  it('should reset reused storage and clone summaries independently', () => {
    const summary = new RecordSummary(2);
    summary.reset(258);
    summary.finishInitialFlags(3);
    const clone = summary.clone();

    expect(clone.has(1, 258)).toBe(true);
    expect(clone.updateFlags(0, 0)).toBe(true);
    expect(summary.has(1, 1)).toBe(true);
    expect(clone.has(1, 1)).toBe(false);

    summary.reset(257);
    summary.finishInitialFlags();
    expect(summary.has(1, 257)).toBe(false);
    summary.reset(257);
    summary.finishInitialFlags();
    expect(summary.has(1, 257)).toBe(false);
  });

  it('should validate reset lengths and queried flag masks', () => {
    const summary = new RecordSummary(2);
    expect(() => summary.reset(-1)).toThrow(RangeError);
    expect(() => summary.reset(1.5)).toThrow(RangeError);

    summary.reset(3);
    summary.finishInitialFlags(1);
    expect(summary.has(1, -1)).toBe(false);
    expect(summary.has(1, 100)).toBe(true);
    expect(summary.has(1, 3, true)).toBe(true);
    for (const mask of [0, 3, 1.5, 4]) expect(() => summary.has(mask, 1)).toThrow(RangeError);
  });
});
