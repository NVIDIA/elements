// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { BitArray } from './bit-array.js';

describe(BitArray.name, () => {
  it('packs bits in LSB-first order across byte boundaries without changing adjacent bits', () => {
    const bits = new BitArray(17);
    expect(bits.length).toBe(17);
    expect(bits.toBytes()).toEqual(new Uint8Array(3));
    for (const index of [0, 7, 8, 15, 16]) bits.set(index, true);
    expect(bits.toBytes()).toEqual(new Uint8Array([0x81, 0x81, 0x01]));
    expect(Array.from({ length: 17 }, (_, index) => bits.get(index))).toEqual([
      true,
      false,
      false,
      false,
      false,
      false,
      false,
      true,
      true,
      false,
      false,
      false,
      false,
      false,
      false,
      true,
      true
    ]);

    bits.set(7, false);
    bits.set(8, false);
    bits.set(16, false);
    expect(bits.toBytes()).toEqual(new Uint8Array([0x01, 0x80, 0x00]));
    bits.set(0, true);
    bits.set(8, false);
    expect(bits.toBytes()).toEqual(new Uint8Array([0x01, 0x80, 0x00]));
  });

  it('copies imported byte views and retains padding without exposing bits beyond the logical length', () => {
    const producer = new Uint8Array([0xaa, 0x81, 0xff, 0xbb]);
    const bits = new BitArray(9, producer.subarray(1));
    producer.fill(0);
    expect(bits.toBytes()).toEqual(new Uint8Array([0x81, 0xff]));
    expect(bits.get(0)).toBe(true);
    expect(bits.get(1)).toBe(false);
    expect(bits.get(7)).toBe(true);
    expect(bits.get(8)).toBe(true);
    expect(bits.get(9)).toBe(false);
    const exported = bits.toBytes();
    exported.fill(0);
    expect(bits.toBytes()).toEqual(new Uint8Array([0x81, 0xff]));
  });

  it('clones and clears independently, including padding bits', () => {
    const bits = new BitArray(9, new Uint8Array([0x80, 0xff]));
    const clone = bits.clone();
    expect(clone.length).toBe(9);
    expect(clone.toBytes()).toEqual(bits.toBytes());
    clone.set(7, false);
    expect(bits.get(7)).toBe(true);
    clone.clear();
    expect(clone.toBytes()).toEqual(new Uint8Array(2));
    expect(bits.toBytes()).toEqual(new Uint8Array([0x80, 0xff]));
    clone.set(0, true);
    expect(bits.get(0)).toBe(false);
  });

  it('supports empty arrays and exact byte lengths', () => {
    for (const bits of [new BitArray(0), new BitArray(0, new Uint8Array([0xff]))]) {
      expect(bits.length).toBe(0);
      expect(bits.toBytes()).toEqual(new Uint8Array());
      expect(bits.get(0)).toBe(false);
      expect(() => bits.set(0, true)).toThrow(RangeError);
      bits.clear();
      expect(bits.clone().length).toBe(0);
    }
    expect(new BitArray(8).toBytes()).toHaveLength(1);
    expect(new BitArray(16).toBytes()).toHaveLength(2);
  });

  it.each([-1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, Number.MAX_SAFE_INTEGER + 1])(
    'rejects invalid lengths (%s)',
    length => {
      expect(() => new BitArray(length)).toThrow(RangeError);
    }
  );

  it.each([-1, 1.5, 9, 0x1_0000_0000, Number.NaN, Number.POSITIVE_INFINITY])(
    'returns false for invalid reads and rejects invalid writes (%s)',
    index => {
      const bits = new BitArray(9, new Uint8Array([0xff, 0xff]));
      expect(bits.get(index)).toBe(false);
      expect(() => bits.set(index, true)).toThrow(RangeError);
      expect(bits.toBytes()).toEqual(new Uint8Array([0xff, 0xff]));
    }
  );

  it('rejects insufficient or detached imported storage', () => {
    expect(() => new BitArray(9, new Uint8Array(1))).toThrow(RangeError);
    const bytes = new Uint8Array([1]);
    structuredClone(bytes.buffer, { transfer: [bytes.buffer] });
    expect(() => new BitArray(0, bytes)).toThrow(TypeError);
  });
});
