// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import {
  readLineVertex,
  readMarker,
  readPoint,
  readTriVertex,
  writeLineVertex,
  writeMarker,
  writePoint,
  writeTriVertex
} from './helpers.js';

describe('marker layout helpers', () => {
  it('should write a complete marker record using the normative byte table', () => {
    const bytes = new Uint8Array(48).fill(0xaa);
    writeMarker(bytes, 0, {
      position: [1, -2.5, 3.25],
      orientation: [0, 0, 0, 2],
      color: [1, 0.5, -1, 2],
      outlineColor: [0, 0.25, 1, 0.5]
    });

    const view = new DataView(bytes.buffer);
    expect([view.getFloat32(0, true), view.getFloat32(4, true), view.getFloat32(8, true)]).toEqual([1, -2.5, 3.25]);
    expect([
      view.getFloat32(12, true),
      view.getFloat32(16, true),
      view.getFloat32(20, true),
      view.getFloat32(24, true)
    ]).toEqual([0, 0, 0, 1]);
    expect([view.getFloat32(28, true), view.getFloat32(32, true), view.getFloat32(36, true)]).toEqual([1, 1, 1]);
    expect([...bytes.slice(40, 44)]).toEqual([255, 128, 0, 255]);
    expect([...bytes.slice(44, 48)]).toEqual([0, 64, 255, 128]);
  });

  it('should round-trip normalized values and complete defaults', () => {
    const bytes = new Uint8Array(48);
    writeMarker(bytes, 0, { position: [4, 5, 6] });

    expect(readMarker(bytes, 0)).toEqual({
      position: [4, 5, 6],
      orientation: [0, 0, 0, 1],
      scale: [1, 1, 1],
      color: [1, 1, 1, 1],
      outlineColor: [0, 0, 0, 0]
    });
  });

  it('should respect a DataView byte offset and record index', () => {
    const buffer = new ArrayBuffer(112);
    const bytes = new Uint8Array(buffer).fill(0x7f);
    const view = new DataView(buffer, 8, 96);
    writeMarker(view, 1, { position: [7, 8, 9] });

    expect(readMarker(view, 1).position).toEqual([7, 8, 9]);
    expect([...bytes.slice(0, 8)]).toEqual(new Array(8).fill(0x7f));
    expect([...bytes.slice(104)]).toEqual(new Array(8).fill(0x7f));
  });

  it('should write sequential marker records independently', () => {
    const bytes = new Uint8Array(96);

    writeMarker(bytes, 0, { position: [1, 2, 3] });
    writeMarker(bytes, 1, { position: [4, 5, 6], orientation: [0, 0, 0, 2], scale: [2, 3, 4] });

    expect(readMarker(bytes, 0)).toMatchObject({ position: [1, 2, 3], orientation: [0, 0, 0, 1] });
    expect(readMarker(bytes, 1)).toMatchObject({
      position: [4, 5, 6],
      orientation: [0, 0, 0, 1],
      scale: [2, 3, 4]
    });
  });

  it('should follow the current length of a resizable target view', () => {
    const buffer = Reflect.construct(ArrayBuffer, [48, { maxByteLength: 96 }]) as ArrayBuffer & {
      resize(byteLength: number): void;
    };
    const bytes = new Uint8Array(buffer);
    writeMarker(bytes, 0, { position: [1, 2, 3] });

    buffer.resize(96);
    writeMarker(bytes, 1, { position: [4, 5, 6] });

    expect(readMarker(bytes, 1).position).toEqual([4, 5, 6]);
  });

  it.each([-1, 0.5, Number.MAX_SAFE_INTEGER])('should reject invalid record index %s', index => {
    expect(() => writeMarker(new Uint8Array(48), index, { position: [0, 0, 0] })).toThrow(RangeError);
  });

  it('should reject insufficient bytes', () => {
    expect(() => readMarker(new Uint8Array(47), 0)).toThrow(RangeError);
  });

  it('should reject nonfinite numeric values and zero quaternions', () => {
    expect(() => writeMarker(new Uint8Array(48), 0, { position: [Number.NaN, 0, 0] })).toThrow(RangeError);
    expect(() => writeMarker(new Uint8Array(48), 0, { position: [0, 0, 0], color: [0, 0, 0, Infinity] })).toThrow(
      RangeError
    );
    expect(() => writeMarker(new Uint8Array(48), 0, { position: [0, 0, 0], orientation: [0, 0, 0, 0] })).toThrow(
      RangeError
    );
  });

  it('should reject invalid float and quaternion bytes when reading', () => {
    const bytes = new Uint8Array(48);
    const view = new DataView(bytes.buffer);
    view.setFloat32(0, Number.NaN, true);
    expect(() => readMarker(bytes, 0)).toThrow(RangeError);

    view.setFloat32(0, 0, true);
    expect(() => readMarker(bytes, 0)).toThrow(RangeError);
  });
});

describe('vertex layout helpers', () => {
  it('should respect typed-array view offsets without touching surrounding bytes', () => {
    const buffer = new ArrayBuffer(32);
    const allBytes = new Uint8Array(buffer).fill(0x5a);
    const view = new Uint8Array(buffer, 8, 16);
    writePoint(view, 0, { position: [1.5, 2.5, 3.5], color: [0, 0.5, 1, 0.25] });

    expect(readPoint(view, 0)).toEqual({
      position: [1.5, 2.5, 3.5],
      color: [0, 128 / 255, 1, 64 / 255]
    });
    expect([...allBytes.slice(0, 8)]).toEqual(new Array(8).fill(0x5a));
    expect([...allBytes.slice(24)]).toEqual(new Array(8).fill(0x5a));
  });

  it('should apply the default vertex color', () => {
    const bytes = new Uint8Array(16);
    writePoint(bytes, 0, { position: [0, 1, 2] });
    expect(readPoint(bytes, 0)).toEqual({ position: [0, 1, 2], color: [1, 1, 1, 1] });
  });

  it('should round-trip line and triangle vertices through their distinct helpers', () => {
    const line = new Uint8Array(40);
    const triangle = new Uint8Array(16);
    writeLineVertex(line, 0, {
      position: [1, 2, 3],
      color: [1, 0, 0, 1],
      normal: [0, 1, 0],
      width: 4,
      dash: 6,
      gap: 3
    });
    writeTriVertex(triangle, 0, { position: [4, 5, 6], color: [0, 1, 0, 1] });

    expect(readLineVertex(line, 0)).toEqual({
      position: [1, 2, 3],
      color: [1, 0, 0, 1],
      normal: [0, 1, 0],
      width: 4,
      dash: 6,
      gap: 3
    });
    expect(readTriVertex(triangle, 0)).toEqual({ position: [4, 5, 6], color: [0, 1, 0, 1] });
  });

  it('should apply line defaults and reject invalid segment styles', () => {
    const line = new Uint8Array(40);
    writeLineVertex(line, 0, { position: [1, 2, 3] });
    expect(readLineVertex(line, 0)).toEqual({
      position: [1, 2, 3],
      color: [1, 1, 1, 1],
      normal: [0, 0, 1],
      width: Math.fround(0.1),
      dash: 0,
      gap: 0
    });
    expect(() => writeLineVertex(line, 0, { position: [0, 0, 0], width: -1 })).toThrow(RangeError);
    expect(() => writeLineVertex(line, 0, { position: [0, 0, 0], dash: 0, gap: 1 })).toThrow(RangeError);
    expect(() => writeLineVertex(line, 0, { position: [0, 0, 0], normal: [0, 0, 0] })).toThrow(RangeError);
  });

  it('should reject invalid vertex data and views', () => {
    expect(() => writePoint(new Uint8Array(16), 0, { position: [0, Infinity, 0] })).toThrow(RangeError);
    expect(() => writePoint(new Uint8Array(15), 0, { position: [0, 0, 0] })).toThrow(RangeError);
    expect(() => writePoint(new ArrayBuffer(16) as never, 0, { position: [0, 0, 0] })).toThrow(TypeError);
  });
});
