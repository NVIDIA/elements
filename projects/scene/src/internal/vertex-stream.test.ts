// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { required } from '@internals/testing';
import { writeLineVertex, writePoint } from './layouts/helpers.js';
import { LINE_VERTEX, POINT, TRI_VERTEX } from './layouts/built-ins.js';
import { defineLayout } from './layouts/define-layout.js';
import { TRIANGLES_COUNT } from '../errors.js';
import { lineRecordIsValid } from './lines/data.js';
import { VertexStreamBuffer } from './vertex-stream.js';

describe('vertex stream buffer', () => {
  it('copies replacement bytes, retains fitting count, and resets an oversized count', () => {
    const source = new Uint8Array(POINT.stride * 2);
    writePoint(source, 0, { position: [1, 2, 3] });
    writePoint(source, 1, { position: [4, 5, 6] });
    const stream = new VertexStreamBuffer(POINT);
    stream.replace(source);
    stream.count = 1;
    source.fill(0);
    expect(stream.toRenderData().count).toBe(1);
    stream.replace(new Uint8Array(POINT.stride));
    expect(stream.count).toBe(1);
    stream.replace(new Uint8Array(POINT.stride * 2));
    stream.count = 2;
    stream.replace(new Uint8Array(POINT.stride));
    expect(stream.count).toBeUndefined();
  });

  it('reuses same-capacity owned storage and replaces it after capacity changes', () => {
    const source = new Uint8Array(POINT.stride * 2);
    writePoint(source, 0, { position: [1, 2, 3] });
    writePoint(source, 1, { position: [4, 5, 6] });
    const stream = new VertexStreamBuffer(POINT);
    stream.replace(source);
    const initialUpload = stream.getUploadBytes();

    writePoint(source, 0, { color: [1, 1, 1, 0.5], position: [7, 8, 9] });
    stream.replace(source);
    expect(stream.getUploadBytes()).toBe(initialUpload);
    expect(new DataView(required(initialUpload, 'Expected initial upload bytes.').buffer).getFloat32(0, true)).toBe(7);
    expect(stream.toRenderData({ consumeUploadRanges: false })).toMatchObject({ opaque: true, transparent: true });

    const largerSource = new Uint8Array(POINT.stride * 3);
    for (let index = 0; index < 3; index += 1) writePoint(largerSource, index, { position: [index, 0, 0] });
    stream.replace(largerSource);
    expect(stream.getUploadBytes()).not.toBeNull();
    expect(stream.getUploadBytes()).not.toBe(initialUpload);
  });

  it('rebuilds summaries after widespread same-capacity classification changes', () => {
    const count = 1_100;
    const opaque = new Uint8Array(POINT.stride * count);
    const transparent = new Uint8Array(POINT.stride * count);
    for (let index = 0; index < count; index += 1) {
      writePoint(opaque, index, { position: [index, 0, 0] });
      writePoint(transparent, index, { color: [1, 1, 1, 0.5], position: [index, 0, 0] });
    }
    const stream = new VertexStreamBuffer(POINT);

    stream.replace(opaque);
    stream.replace(transparent);
    expect(stream.toRenderData({ consumeUploadRanges: false })).toMatchObject({ opaque: false, transparent: true });

    stream.replace(opaque);
    expect(stream.toRenderData({ consumeUploadRanges: false })).toMatchObject({ opaque: true, transparent: false });
  });

  it('validates stride and recovers a touched range through commit', () => {
    const stream = new VertexStreamBuffer(POINT);
    stream.replace(new Uint8Array(1));
    expect(stream.toRenderData().ready).toBe(false);
    const source = new Uint8Array(POINT.stride);
    writePoint(source, 0, { position: [1, 2, 3], color: [1, 1, 1, 0.5] });
    stream.replace(source);
    source[0] = 9;
    stream.commit(0, 1);
    expect(stream.toRenderData()).toMatchObject({ opaque: false, transparent: true });
    expect(stream.toRenderData().uploadRanges).toEqual([]);
  });

  it('reports triangle divisibility without throwing from count assignment', () => {
    const stream = new VertexStreamBuffer(TRI_VERTEX, { requireCountMultipleOf: 3 });
    stream.replace(new Uint8Array(16 * 4));
    stream.count = 1;
    const data = stream.toRenderData();
    expect(data.ready).toBe(false);
    expect(data.issues.has(TRIANGLES_COUNT)).toBe(true);
  });

  it('validates divisors, sources, counts, and commit bounds', () => {
    expect(() => new VertexStreamBuffer(POINT, { requireCountMultipleOf: 0 })).toThrow(RangeError);
    const stream = new VertexStreamBuffer(POINT);
    expect(() => stream.replace([] as unknown as ArrayBufferView)).toThrow(TypeError);
    stream.replace(null);
    expect(() => stream.commit()).not.toThrow();
    expect(() => stream.setCount(-1)).toThrow(RangeError);
    expect(() => stream.setCount(0.5)).toThrow(RangeError);
    expect(() => stream.setCount(1)).toThrow(RangeError);
    expect(() => stream.commit(1)).not.toThrow();
    expect(() => stream.commit(-1)).not.toThrow();
  });

  it('validates nonfinite positions and recovers touched records', () => {
    const source = new Uint8Array(POINT.stride * 2);
    writePoint(source, 0, { position: [1, 2, 3] });
    writePoint(source, 1, { position: [4, 5, 6] });
    new DataView(source.buffer).setFloat32(0, Number.NaN, true);
    const stream = new VertexStreamBuffer(POINT);
    stream.replace(source);
    expect(stream.ready).toBe(false);
    writePoint(source, 0, { position: [7, 8, 9] });
    stream.commit(0);
    expect(stream.ready).toBe(true);
    expect(stream.toRenderData().count).toBe(2);
  });

  it('should ignore invalid records beyond the explicit count until activated', () => {
    const source = new Uint8Array(LINE_VERTEX.stride * 2);
    writeLineVertex(source, 0, { position: [0, 0, 0] });
    const stream = new VertexStreamBuffer(LINE_VERTEX, { validateRecord: lineRecordIsValid });
    stream.replace(source);
    stream.count = 1;
    expect(stream.toRenderData()).toMatchObject({ count: 1, ready: true });
    stream.count = 2;
    expect(stream.toRenderData()).toMatchObject({ count: 0, ready: false });
    writeLineVertex(source, 1, { position: [1, 0, 0] });
    stream.commit(1, 1);
    expect(stream.toRenderData()).toMatchObject({ count: 2, ready: true });
  });

  it('handles byte-offset views, alpha prefixes, and specialized layouts', () => {
    const source = new Uint8Array(POINT.stride + 4);
    writePoint(source, 0, { position: [1, 2, 3], color: [1, 1, 1, 0.5] });
    const stream = new VertexStreamBuffer(POINT);
    stream.replace(source.subarray(0, POINT.stride));
    stream.count = 0;
    expect(stream.toRenderData().transparent).toBe(false);
    stream.count = 1;
    expect(stream.toRenderData()).toMatchObject({ opaque: false, transparent: true });
    expect(new VertexStreamBuffer(LINE_VERTEX).layout).toBe(LINE_VERTEX);
    expect(new VertexStreamBuffer(TRI_VERTEX).layout).toBe(TRI_VERTEX);
    const noColor = defineLayout('nve.test-no-color', { position: { type: 'f32x3', offset: 0 } }, { stride: 12 });
    const noColorStream = new VertexStreamBuffer(noColor);
    noColorStream.replace(new Uint8Array(12));
    expect(noColorStream.opaque).toBe(true);
    expect(noColorStream.transparent).toBe(false);
  });

  it('classifies opaque, translucent, mixed, and zero-alpha streams', () => {
    const source = new Uint8Array(POINT.stride * 2);
    writePoint(source, 0, { color: [1, 1, 1, 1], position: [0, 0, 0] });
    writePoint(source, 1, { color: [1, 1, 1, 0.5], position: [1, 0, 0] });
    const stream = new VertexStreamBuffer(POINT);

    stream.replace(source);
    stream.count = 1;
    expect(stream.toRenderData()).toMatchObject({ opaque: true, transparent: false });
    stream.count = 2;
    expect(stream.toRenderData()).toMatchObject({ opaque: true, transparent: true });

    writePoint(source, 0, { color: [1, 1, 1, 0], position: [0, 0, 0] });
    stream.commit(0, 1);
    stream.count = 1;
    expect(stream.toRenderData()).toMatchObject({ opaque: false, transparent: true });
  });

  it('supports zero commits and preserves the previous count when assigning the same value', () => {
    const source = new Uint8Array(POINT.stride);
    writePoint(source, 0, { position: [0, 0, 0] });
    const stream = new VertexStreamBuffer(POINT);
    stream.replace(source);
    stream.count = 1;
    const version = stream.getVersion();
    stream.count = 1;
    stream.commit(0, 0);
    expect(stream.getVersion()).toBe(version);
  });
});
