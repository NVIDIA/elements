// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { MarkerInstanceBuffer } from './instance-buffer.js';
import { POINT } from './layouts/built-ins.js';
import { MarkerBuffer } from './markers/buffer.js';
import { PointBuffer } from './points/buffer.js';
import { replacePreparedMarkerSource, replacePreparedVertexSource } from './prepared-record-source.js';
import { VertexStreamBuffer } from './vertex-stream.js';

describe('prepared record sources', () => {
  it('should validate a versioned marker source once across fan-out targets', () => {
    const source = new MarkerBuffer({ capacity: 2 });
    source.set(0, { position: [1, 2, 3] }).set(1, { position: [4, 5, 6] });
    const first = new MarkerInstanceBuffer();
    const second = new MarkerInstanceBuffer();

    expect(replacePreparedMarkerSource(first, source)).toBe(true);
    expect(replacePreparedMarkerSource(second, source)).toBe(false);
    expect(second.getUploadBytes()).toBe(first.getUploadBytes());

    source.at(0).position.x = 7;
    const uncommitted = new MarkerInstanceBuffer();
    expect(replacePreparedMarkerSource(uncommitted, source)).toBe(false);
    expect(uncommitted.getUploadBytes()).not.toBe(first.getUploadBytes());
    expect(new DataView(uncommitted.getUploadBytes()?.buffer ?? new ArrayBuffer()).getFloat32(0, true)).toBe(7);

    source.commit(0, 1);
    const committed = new MarkerInstanceBuffer();
    expect(replacePreparedMarkerSource(committed, source)).toBe(true);
    expect(committed.getUploadBytes()).not.toBe(first.getUploadBytes());
  });

  it('should detach shared marker bytes on commit', () => {
    const source = new MarkerBuffer({ capacity: 1 });
    const marker = source.add({ position: [1, 0, 0] });
    const owner = new MarkerInstanceBuffer();
    const sibling = new MarkerInstanceBuffer();
    source.commit();
    replacePreparedMarkerSource(owner, source);
    replacePreparedMarkerSource(sibling, source);
    const sharedBytes = owner.getUploadBytes();
    expect(sibling.getUploadBytes()).toBe(sharedBytes);
    owner.takeUploadRanges();

    marker.position.x = 9;
    marker.color = [1, 1, 1, 0.5];
    source.commit(0, 1);
    owner.commit(0, 1);

    expect(owner.getUploadBytes()).not.toBe(sharedBytes);
    expect(new DataView(owner.getUploadBytes()?.buffer ?? new ArrayBuffer()).getFloat32(0, true)).toBe(9);
    expect(new DataView(sibling.getUploadBytes()?.buffer ?? new ArrayBuffer()).getFloat32(0, true)).toBe(1);
    expect(owner.hasPartialFaceAlpha(1)).toBe(true);
    expect(sibling.hasPartialFaceAlpha(1)).toBe(false);
    expect(owner.getBounds(1)).toMatchObject({ maximumX: 10, minimumX: 8 });
    expect(sibling.getBounds(1)).toMatchObject({ maximumX: 2, minimumX: 0 });
    expect(owner.takeUploadRanges()).toEqual([{ offset: 0, size: 48 }]);
  });

  it('should detach shared marker bytes on replacement', () => {
    const source = new MarkerBuffer({ capacity: 1 });
    source.set(0, { position: [1, 0, 0] });
    const first = new MarkerInstanceBuffer();
    const second = new MarkerInstanceBuffer();
    replacePreparedMarkerSource(first, source);
    replacePreparedMarkerSource(second, source);
    const sharedBytes = second.getUploadBytes();
    const replacement = source.bytes.slice();
    new DataView(replacement.buffer).setFloat32(0, 5, true);

    first.replace(replacement);

    expect(first.getUploadBytes()).not.toBe(sharedBytes);
    expect(new DataView(first.getUploadBytes()?.buffer ?? new ArrayBuffer()).getFloat32(0, true)).toBe(5);
    expect(new DataView(second.getUploadBytes()?.buffer ?? new ArrayBuffer()).getFloat32(0, true)).toBe(1);
  });

  it('should require commit before caching direct byte writes', () => {
    const source = new MarkerBuffer({ capacity: 1 });
    const bytes = source.bytes;
    new DataView(bytes.buffer).setFloat32(0, 3, true);
    const uncached = [new MarkerInstanceBuffer(), new MarkerInstanceBuffer()];
    uncached.forEach(target => replacePreparedMarkerSource(target, source));
    expect(uncached[0]?.getUploadBytes()).not.toBe(uncached[1]?.getUploadBytes());

    source.commit(0, 1);
    const cached = [new MarkerInstanceBuffer(), new MarkerInstanceBuffer()];
    cached.forEach(target => replacePreparedMarkerSource(target, source));
    expect(cached[0]?.getUploadBytes()).toBe(cached[1]?.getUploadBytes());
  });

  it('should validate a versioned vertex source once and detach shared bytes on commit', () => {
    const source = new PointBuffer({ capacity: 2 });
    const firstPoint = source.add({ position: [1, 2, 3] });
    source.add({ position: [4, 5, 6] });
    const owner = new VertexStreamBuffer(POINT);
    const sibling = new VertexStreamBuffer(POINT);
    source.commit();

    expect(replacePreparedVertexSource(owner, source, source.count)).toBe(true);
    expect(replacePreparedVertexSource(sibling, source, source.count)).toBe(false);
    const sharedBytes = owner.getUploadBytes();
    expect(sibling.getUploadBytes()).toBe(sharedBytes);
    owner.takeUploadRanges();

    firstPoint.position.x = 8;
    firstPoint.color = [1, 1, 1, 0.5];
    source.commit(0, 1);
    owner.commit(0, 1);
    expect(owner.getUploadBytes()).not.toBe(sharedBytes);
    expect(new DataView(owner.getUploadBytes()?.buffer ?? new ArrayBuffer()).getFloat32(0, true)).toBe(8);
    expect(new DataView(sibling.getUploadBytes()?.buffer ?? new ArrayBuffer()).getFloat32(0, true)).toBe(1);
    expect(owner.transparent).toBe(true);
    expect(sibling.transparent).toBe(false);
    expect(owner.takeUploadRanges()).toEqual([{ offset: 0, size: POINT.stride }]);
  });

  it('should detach shared vertex bytes on replacement', () => {
    const source = new PointBuffer({ capacity: 1 });
    source.set(0, { position: [1, 0, 0] });
    const first = new VertexStreamBuffer(POINT);
    const second = new VertexStreamBuffer(POINT);
    replacePreparedVertexSource(first, source, source.count);
    replacePreparedVertexSource(second, source, source.count);
    const sharedBytes = second.getUploadBytes();
    const replacement = source.bytes.slice();
    new DataView(replacement.buffer).setFloat32(0, 5, true);

    first.replace(replacement, source.count);

    expect(first.getUploadBytes()).not.toBe(sharedBytes);
    expect(new DataView(first.getUploadBytes()?.buffer ?? new ArrayBuffer()).getFloat32(0, true)).toBe(5);
    expect(new DataView(second.getUploadBytes()?.buffer ?? new ArrayBuffer()).getFloat32(0, true)).toBe(1);
  });
});
