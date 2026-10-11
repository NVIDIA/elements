// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { FlagPrefixIndex } from './flag-prefix-index.js';

describe(FlagPrefixIndex.name, () => {
  it.each([0, 9, 1.5])('should reject unsupported bit counts (%s)', bitCount => {
    expect(() => new FlagPrefixIndex(bitCount)).toThrow(RangeError);
  });

  it('should build and update all-record and even-record channels across block boundaries', () => {
    const summary = new FlagPrefixIndex(3);
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
    const summary = new FlagPrefixIndex(3);
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

  it('should build and update prefix indexes spanning multiple complete blocks', () => {
    const summary = new FlagPrefixIndex(3);
    summary.reset(769);
    summary.setInitialFlags(255, 1);
    summary.setInitialFlags(512, 2);
    summary.setInitialFlags(767, 4);
    summary.finishInitialFlags();

    expect(summary.has(1, 512)).toBe(true);
    expect(summary.has(2, 512)).toBe(false);
    expect(summary.has(2, 513, true)).toBe(true);
    expect(summary.has(4, 768)).toBe(true);

    expect(summary.updateFlags(767, 0)).toBe(true);
    expect(summary.has(4, 768)).toBe(false);
  });

  it('should reset reused storage and clone summaries independently', () => {
    const summary = new FlagPrefixIndex(2);
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

  it('should batch repeated sparse changes across block boundaries and preserve even-record queries', () => {
    const summary = new FlagPrefixIndex(3);
    const flags = new Uint8Array(8193);
    summary.reset(flags.length);
    summary.finishInitialFlags();
    for (const index of [255, 256, 257, 8192]) {
      expect(summary.updateFlagsBatched(index, 7)).toBe(true);
      expect(summary.updateFlagsBatched(index, 7)).toBe(false);
      expect(summary.updateFlagsBatched(index, 0)).toBe(true);
    }
    summary.updateFlagsBatched(255, 1);
    summary.updateFlagsBatched(256, 2);
    summary.updateFlagsBatched(257, 4);
    summary.updateFlagsBatched(8192, 4);
    flags[255] = 1;
    flags[256] = 2;
    flags[257] = 4;
    flags[8192] = 4;
    expectPrefixes(summary, flags, 3);

    for (const index of [255, 256, 257, 8192]) summary.updateFlagsBatched(index, 0);
    flags.fill(0);
    expectPrefixes(summary, flags, 3);
  });

  it.each([4096, 4353])('should reconcile dense changes and cancellations over %s records', length => {
    const summary = new FlagPrefixIndex(8);
    const flags = new Uint8Array(length);
    summary.reset(length);
    summary.finishInitialFlags(129);
    for (let index = 0; index < length; index += 1) {
      summary.updateFlagsBatched(index, 255);
      flags[index] = index % 2 === 0 ? 64 : 128;
      summary.updateFlagsBatched(index, flags[index]!);
    }
    expectPrefixes(summary, flags, 8);

    for (let index = 0; index < length; index += 1) {
      summary.updateFlagsBatched(index, 0);
      summary.updateFlagsBatched(index, flags[index]!);
    }
    expectPrefixes(summary, flags, 8);
    for (let index = 0; index < length; index += 1) summary.updateFlagsBatched(index, 0);
    flags.fill(0);
    expectPrefixes(summary, flags, 8);
  });

  it('should interleave eager changes, deferred changes, and prefix queries', () => {
    const summary = new FlagPrefixIndex(3);
    const flags = new Uint8Array(1027);
    summary.reset(flags.length);
    summary.finishInitialFlags();
    for (let round = 0; round < 4; round += 1) {
      for (let item = 0; item < 200; item += 1) {
        const index = (item * 263 + round * 137) % flags.length;
        const next = ((item + round) * 3) & 7;
        const changed = flags[index] !== next;
        const result = item % 31 === 0 ? summary.updateFlags(index, next) : summary.updateFlagsBatched(index, next);
        expect(result).toBe(changed);
        flags[index] = next;
      }
      expectPrefixes(summary, flags, 3);
    }
  });

  it('should clone pending changes without sharing flags or batch storage', () => {
    const summary = new FlagPrefixIndex(2);
    summary.reset(769);
    summary.finishInitialFlags();
    summary.updateFlagsBatched(256, 1);
    summary.updateFlagsBatched(768, 2);
    const clone = summary.clone();
    summary.updateFlagsBatched(256, 0);
    clone.updateFlagsBatched(768, 0);

    expect(summary.has(1, 769)).toBe(false);
    expect(summary.has(2, 769)).toBe(true);
    expect(clone.has(1, 256)).toBe(false);
    expect(clone.has(1, 257, true)).toBe(true);
    expect(clone.has(2, 769)).toBe(false);
    clone.updateFlags(256, 0);
    expect(clone.has(1, 769)).toBe(false);
  });

  it.each([258, 1025, 0])('should discard pending changes when resetting to %s records', length => {
    const summary = new FlagPrefixIndex(2);
    summary.reset(258);
    summary.finishInitialFlags(1);
    summary.updateFlagsBatched(256, 2);
    summary.reset(length);
    summary.finishInitialFlags();
    expect(summary.has(1, length)).toBe(false);
    expect(summary.has(2, length)).toBe(false);
    if (length === 0) return;
    summary.updateFlagsBatched(length - 1, 2);
    expect(summary.has(2, length)).toBe(true);
  });

  it('should discard pending deltas when rebuilding initial flags', () => {
    const summary = new FlagPrefixIndex(2);
    summary.reset(769);
    summary.finishInitialFlags(1);
    summary.updateFlagsBatched(256, 2);
    summary.setInitialFlags(768, 2);
    summary.finishInitialFlags();
    expect(summary.has(2, 256)).toBe(false);
    expect(summary.has(2, 257)).toBe(true);
    summary.updateFlagsBatched(256, 0);
    summary.updateFlagsBatched(768, 0);
    expect(summary.has(2, 769)).toBe(false);

    summary.updateFlagsBatched(256, 2);
    summary.finishInitialFlags(1);
    expect(summary.has(2, 769)).toBe(false);
    summary.updateFlagsBatched(256, 0);
    summary.updateFlags(0, 0);
    expect(summary.has(1, 1)).toBe(false);
    expect(summary.has(1, 769)).toBe(true);
  });

  it('should validate reset lengths and queried flag masks', () => {
    const summary = new FlagPrefixIndex(2);
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

function expectPrefixes(summary: FlagPrefixIndex, flags: Uint8Array, bitCount: number): void {
  for (let bit = 0; bit < bitCount; bit += 1) {
    const mask = 1 << bit;
    let all = false;
    let even = false;
    for (let count = 0; count <= flags.length; count += 1) {
      expect(summary.has(mask, count)).toBe(all);
      expect(summary.has(mask, count, true)).toBe(even);
      const present = ((flags[count] ?? 0) & mask) !== 0;
      all ||= present;
      even ||= count % 2 === 0 && present;
    }
  }
}
