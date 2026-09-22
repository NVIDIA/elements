// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from 'vitest';
import { assertCommitRange, getArrayBufferViewBytes } from './storage.js';

describe('record storage views and ranges', () => {
  it('borrows exactly a subview rather than copying or exposing its surrounding allocation', () => {
    const buffer = new ArrayBuffer(32);
    const view = new DataView(buffer, 8, 12);
    const bytes = getArrayBufferViewBytes(view);
    expect(bytes.buffer).toBe(buffer);
    expect(bytes.byteOffset).toBe(8);
    expect(bytes.byteLength).toBe(12);
    bytes[0] = 99;
    expect(view.getUint8(0)).toBe(99);
  });

  it('allows an empty commit at capacity while rejecting invalid starts and overflowing counts', () => {
    expect(() => assertCommitRange(4, 0, 4)).not.toThrow();
    expect(() => assertCommitRange(4, undefined, 4)).not.toThrow();
    expect(() => assertCommitRange(1, 3, 4)).not.toThrow();
    for (const start of [-1, 0.5, 5, NaN, Infinity]) expect(() => assertCommitRange(start, 0, 4)).toThrow(RangeError);
    for (const count of [-1, 0.5, 4, NaN, Infinity]) expect(() => assertCommitRange(1, count, 4)).toThrow(RangeError);
  });
});
