// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { decodeUnorm8, encodeUnorm8, readRGBA8, writeRGBA8 } from './rgba8.js';

describe('RGBA8 encoding', () => {
  it.each([
    [-100, 0],
    [-0, 0],
    [0, 0],
    [0.25, 64],
    [0.5, 128],
    [0.75, 191],
    [1, 255],
    [100, 255]
  ])('clamps and rounds finite channel %s to byte %s', (channel, expected) => {
    expect(encodeUnorm8(channel)).toBe(expected);
  });

  it('rounds a representable half upward and distinguishes either side of the threshold', () => {
    expect(encodeUnorm8(0.5 - Number.EPSILON)).toBe(127);
    expect(encodeUnorm8(0.5)).toBe(128);
    expect(encodeUnorm8(0.5 + Number.EPSILON)).toBe(128);
    expect(decodeUnorm8(128)).toBe(128 / 255);
  });

  it('round trips all 256 byte values independently in red and green with fixed blue and alpha bytes', () => {
    const view = new DataView(new ArrayBuffer(4));
    for (let byte = 0; byte < 256; byte += 1) {
      writeRGBA8(view, 0, [decodeUnorm8(byte), decodeUnorm8(255 - byte), decodeUnorm8(127), decodeUnorm8(64)]);
      expect([...new Uint8Array(view.buffer)]).toEqual([byte, 255 - byte, 127, 64]);
      expect(readRGBA8(view, 0)).toEqual([byte / 255, (255 - byte) / 255, 127 / 255, 64 / 255]);
    }
  });

  it('respects DataView and color offsets and returns independent, unpremultiplied colors', () => {
    const bytes = new Uint8Array(20).fill(0x5a);
    const view = new DataView(bytes.buffer, 4, 12);
    writeRGBA8(view, 4, [1, 0.5, 0.25, 0]);
    expect([...bytes.subarray(0, 8)]).toEqual(new Array(8).fill(0x5a));
    expect([...bytes.subarray(8, 12)]).toEqual([255, 128, 64, 0]);
    expect([...bytes.subarray(12)]).toEqual(new Array(8).fill(0x5a));
    const color = readRGBA8(view, 4);
    expect(color).toEqual([1, 128 / 255, 64 / 255, 0]);
    bytes.fill(0);
    expect(color).toEqual([1, 128 / 255, 64 / 255, 0]);
  });
});
