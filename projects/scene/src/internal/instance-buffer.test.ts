// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';
import { required } from '@internals/testing';
import { writeMarker } from './layouts/helpers.js';
import { MARKER } from './layouts/built-ins.js';
import { MarkerInstanceBuffer } from './instance-buffer.js';

describe('marker instance buffer', () => {
  it('should copy source bytes and normalize quaternions in the owned upload', () => {
    const source = new Uint8Array(MARKER.stride);
    writeMarker(source, 0, { position: [1, 2, 3], orientation: [0, 0, 0, 1] });
    new DataView(source.buffer).setFloat32(24, 2, true);
    const buffer = new MarkerInstanceBuffer();
    buffer.replace(source);
    source.fill(0);

    const upload = buffer.getUploadBytes();
    expect(upload).not.toBeNull();
    expect(new DataView(required(upload, 'Expected upload bytes.').buffer).getFloat32(8, true)).toBe(3);
    expect(new DataView(required(upload, 'Expected upload bytes.').buffer).getFloat32(24, true)).toBe(1);
    expect(buffer.takeUploadRanges()).toEqual([{ offset: 0, size: MARKER.stride }]);
  });

  it('should preserve unit quaternions without rewriting them', () => {
    const source = new Uint8Array(MARKER.stride * 2);
    writeMarker(source, 0, { orientation: [0, 0, 0, 1], position: [0, 0, 0] });
    writeMarker(source, 1, { orientation: [0.5, 0.5, 0.5, 0.5], position: [0, 0, 0] });
    const buffer = new MarkerInstanceBuffer();
    const setFloat32 = vi.spyOn(DataView.prototype, 'setFloat32');

    try {
      buffer.replace(source);
      expect(setFloat32).not.toHaveBeenCalled();
      expect(buffer.getUploadBytes()).toEqual(source);
    } finally {
      setFloat32.mockRestore();
    }
  });

  it('should reuse same-capacity owned storage and replace it after capacity changes', () => {
    const source = new Uint8Array(MARKER.stride);
    writeMarker(source, 0, { position: [1, 2, 3] });
    const buffer = new MarkerInstanceBuffer();
    buffer.replace(source);
    const initialUpload = buffer.getUploadBytes();

    writeMarker(source, 0, {
      color: [1, 1, 1, 0.5],
      outlineColor: [1, 1, 1, 0.5],
      position: [4, 5, 6]
    });
    buffer.replace(source);
    expect(buffer.getUploadBytes()).toBe(initialUpload);
    expect(new DataView(required(initialUpload, 'Expected initial upload bytes.').buffer).getFloat32(0, true)).toBe(4);
    expect(buffer.hasPartialFaceAlpha(1)).toBe(true);
    expect(buffer.hasPartialOutlineAlpha(1)).toBe(true);
    expect(buffer.hasVisibleOutlineAlpha(1)).toBe(true);

    const largerSource = new Uint8Array(MARKER.stride * 2);
    writeMarker(largerSource, 0, { position: [7, 8, 9] });
    writeMarker(largerSource, 1, { position: [10, 11, 12] });
    buffer.replace(largerSource);
    expect(buffer.getUploadBytes()).not.toBeNull();
    expect(buffer.getUploadBytes()).not.toBe(initialUpload);
  });

  it('should rebuild summaries after widespread same-capacity classification changes', () => {
    const count = 1_100;
    const opaque = new Uint8Array(MARKER.stride * count);
    const transparent = new Uint8Array(MARKER.stride * count);
    for (let index = 0; index < count; index += 1) {
      writeMarker(opaque, index, { position: [index, 0, 0] });
      writeMarker(transparent, index, {
        color: [1, 1, 1, 0.5],
        outlineColor: [1, 1, 1, 0.5],
        position: [index, 0, 0]
      });
    }
    const buffer = new MarkerInstanceBuffer();

    buffer.replace(opaque);
    buffer.replace(transparent);
    expect(buffer.hasOpaqueFaceAlpha(count)).toBe(false);
    expect(buffer.hasPartialFaceAlpha(count)).toBe(true);
    expect(buffer.hasPartialOutlineAlpha(count)).toBe(true);
    expect(buffer.hasVisibleOutlineAlpha(count)).toBe(true);

    buffer.replace(opaque);
    expect(buffer.hasOpaqueFaceAlpha(count)).toBe(true);
    expect(buffer.hasPartialFaceAlpha(count)).toBe(false);
    expect(buffer.hasVisibleOutlineAlpha(count)).toBe(false);
  });

  it('should reject non-finite quaternion components', () => {
    const source = new Uint8Array(MARKER.stride);
    writeMarker(source, 0, { orientation: [0, 0, 0, 1], position: [0, 0, 0] });
    const orientation = required(MARKER.fields.orientation, 'Expected the marker orientation field.');
    new DataView(source.buffer).setFloat32(orientation.offset, Number.POSITIVE_INFINITY, true);
    const buffer = new MarkerInstanceBuffer();

    buffer.replace(source);

    expect([...buffer.getIssues()]).toEqual(['layout-value-invalid']);
    expect(buffer.getUploadBytes()).toBeNull();
    expect(buffer.takeUploadRanges()).toEqual([]);
  });

  it('should validate stride and values and recover touched records', () => {
    const buffer = new MarkerInstanceBuffer();
    buffer.replace(new Uint8Array(1));
    expect([...buffer.getIssues()]).toEqual(['layout-stride-mismatch']);

    const source = new Uint8Array(MARKER.stride * 2);
    writeMarker(source, 0, { position: [0, 0, 0] });
    writeMarker(source, 1, { position: [1, 0, 0] });
    const sourceView = new DataView(source.buffer);
    sourceView.setFloat32(MARKER.stride + 12, 0, true);
    sourceView.setFloat32(MARKER.stride + 16, 0, true);
    sourceView.setFloat32(MARKER.stride + 20, 0, true);
    sourceView.setFloat32(MARKER.stride + 24, 0, true);
    buffer.replace(source);
    expect([...buffer.getIssues()]).toEqual(['layout-value-invalid']);

    writeMarker(source, 0, { position: [0, 0, 0] });
    writeMarker(source, 1, { position: [1, 0, 0] });
    buffer.commit(0, 1);
    expect([...buffer.getIssues()]).toEqual(['layout-value-invalid']);
    buffer.commit(1, 1);
    expect(buffer.ready).toBe(true);
    expect(buffer.takeUploadRanges()).toEqual([{ offset: 0, size: MARKER.stride * 2 }]);
  });

  it('should rebuild marker status, orientation, and bounds on a complete commit', () => {
    const source = new Uint8Array(MARKER.stride * 2);
    writeMarker(source, 0, { color: [1, 1, 1, 0.5], position: [1, 0, 0] });
    writeMarker(source, 1, { position: [3, 0, 0] });
    const buffer = new MarkerInstanceBuffer();
    buffer.replace(source);
    buffer.takeUploadRanges();

    writeMarker(source, 0, { position: [-4, 0, 0], scale: [2, 1, 1] });
    writeMarker(source, 1, { color: [1, 1, 1, 0.5], orientation: [0, 0, 0, 2], position: [6, 0, 0] });
    buffer.commit();

    expect(buffer.ready).toBe(true);
    expect(buffer.hasOpaqueFaceAlpha(2)).toBe(true);
    expect(buffer.hasPartialFaceAlpha(2)).toBe(true);
    expect(buffer.getBounds(2)).toMatchObject({ maximumX: 7, minimumX: -6 });
    expect(
      new DataView(buffer.getUploadBytes()?.buffer ?? new ArrayBuffer()).getFloat32(MARKER.stride + 24, true)
    ).toBe(1);
    expect(buffer.takeUploadRanges()).toEqual([{ offset: 0, size: MARKER.stride * 2 }]);
  });

  it('should reject invalid commit ranges and no-op without a source', () => {
    const buffer = new MarkerInstanceBuffer();
    expect(() => buffer.commit(-1)).not.toThrow();
    expect(buffer.createPreparedSnapshot()).toBeNull();
    expect(buffer.getUploadBytes()).toBeNull();
    const source = new Uint8Array(MARKER.stride);
    writeMarker(source, 0, { position: [0, 0, 0] });
    buffer.replace(source);
    expect(() => buffer.commit(-1)).toThrow(RangeError);
    expect(() => buffer.commit(0, 2)).toThrow(RangeError);
    expect(() => buffer.commit(0.5)).toThrow(RangeError);
  });

  it('should treat empty commits and cleared sources as no-ops', () => {
    const source = new Uint8Array(MARKER.stride);
    writeMarker(source, 0, { position: [1, 2, 3] });
    const buffer = new MarkerInstanceBuffer();
    buffer.replace(source);

    buffer.commit(0, 0);
    expect(buffer.takeUploadRanges()).toEqual([{ offset: 0, size: MARKER.stride }]);

    buffer.replace(null);
    buffer.commit();
    expect(buffer.capacity).toBe(0);
    expect(buffer.getBounds(1)).toBeNull();
    expect(buffer.takeUploadRanges()).toEqual([]);
  });

  it('should fall back to normal replacement when a prepared snapshot has a different size', () => {
    const original = new Uint8Array(MARKER.stride);
    writeMarker(original, 0, { position: [1, 0, 0] });
    const source = new Uint8Array(MARKER.stride * 2);
    writeMarker(source, 0, { position: [2, 0, 0] });
    writeMarker(source, 1, { position: [3, 0, 0] });
    const first = new MarkerInstanceBuffer();
    first.replace(original);
    const snapshot = first.createPreparedSnapshot();
    if (!snapshot) throw new TypeError('Expected a prepared marker snapshot.');

    const second = new MarkerInstanceBuffer();
    second.replacePrepared(source, snapshot);

    expect(second.capacity).toBe(2);
    expect(second.getBounds(2)).toMatchObject({ maximumX: 4, minimumX: 1 });
  });

  it('should cache conservative visible bounds by prefix and update only committed blocks', () => {
    const count = 300;
    const source = new Uint8Array(MARKER.stride * count);
    for (let index = 0; index < count; index += 1) {
      writeMarker(source, index, { color: [1, 1, 1, 0], position: [0, 0, 0] });
    }
    writeMarker(source, 0, { position: [1, 2, 3], scale: [-2, 0.5, 1] });
    writeMarker(source, 1, { position: [10, 0, 0] });
    const buffer = new MarkerInstanceBuffer();
    buffer.replace(source);

    expect(buffer.getBounds(1)).toEqual({
      maximumX: 3,
      maximumY: 4,
      maximumZ: 5,
      minimumX: -1,
      minimumY: 0,
      minimumZ: 1
    });
    expect(buffer.getBounds(2)).toMatchObject({ maximumX: 11, minimumX: -1 });
    expect(buffer.getBounds(0)).toBeNull();

    writeMarker(source, 1, { position: [-10, 0, 0] });
    buffer.commit(1, 1);
    expect(buffer.getBounds(2)).toMatchObject({ maximumX: 3, minimumX: -11 });

    const snapshot = buffer.createPreparedSnapshot();
    if (!snapshot) throw new TypeError('Expected prepared marker bounds.');
    const sibling = new MarkerInstanceBuffer();
    sibling.replacePrepared(source, snapshot);
    expect(sibling.getBounds(2)).toEqual(buffer.getBounds(2));
  });
});
