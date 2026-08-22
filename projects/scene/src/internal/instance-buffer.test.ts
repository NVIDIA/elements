// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { writeMarker } from './layouts/helpers.js';
import { MARKER } from './layouts/built-ins.js';
import { MarkerInstanceBuffer, mergeUploadRanges } from './instance-buffer.js';

describe('marker instance buffer', () => {
  it('should merge overlapping and adjacent upload ranges', () => {
    expect(
      mergeUploadRanges([
        { offset: 96, size: 48 },
        { offset: 0, size: 48 },
        { offset: 40, size: 56 },
        { offset: 192, size: 48 }
      ])
    ).toEqual([
      { offset: 0, size: 144 },
      { offset: 192, size: 48 }
    ]);
  });

  it('should copy source bytes and normalize quaternions in the owned upload', () => {
    const source = new Uint8Array(MARKER.stride);
    writeMarker(source, 0, { position: [1, 2, 3], orientation: [0, 0, 0, 1] });
    new DataView(source.buffer).setFloat32(24, 2, true);
    const buffer = new MarkerInstanceBuffer();
    buffer.replace(source);
    source.fill(0);

    const upload = buffer.getUploadBytes();
    expect(upload).not.toBeNull();
    expect(new DataView(upload?.buffer).getFloat32(8, true)).toBe(3);
    expect(new DataView(upload?.buffer).getFloat32(24, true)).toBe(1);
    expect(buffer.takeUploadRanges()).toEqual([{ offset: 0, size: MARKER.stride }]);
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

  it('should reject invalid commit ranges and no-op without a source', () => {
    const buffer = new MarkerInstanceBuffer();
    expect(() => buffer.commit(-1)).not.toThrow();
    const source = new Uint8Array(MARKER.stride);
    writeMarker(source, 0, { position: [0, 0, 0] });
    buffer.replace(source);
    expect(() => buffer.commit(-1)).toThrow(RangeError);
    expect(() => buffer.commit(0, 2)).toThrow(RangeError);
    expect(() => buffer.commit(0.5)).toThrow(RangeError);
  });

  it('should cache marker validation and alpha summaries across representative operations', () => {
    const count = 1_024;
    const source = new Uint8Array(MARKER.stride * count);
    for (let index = 0; index < count; index += 1) writeMarker(source, index, { position: [index, 0, 0] });
    const buffer = new MarkerInstanceBuffer();

    buffer.replace(source);
    expect(buffer.getPerformanceSnapshot()).toEqual({
      recordScans: count,
      recordViewAllocations: 1,
      summaryPrefixQueries: 0,
      summaryRemainderScans: 0,
      summaryStorageAllocations: 3
    });
    expect(buffer.ready).toBe(true);
    expect(buffer.hasPartialFaceAlpha(count)).toBe(false);
    expect(buffer.hasPartialOutlineAlpha(count)).toBe(false);
    expect(buffer.hasVisibleOutlineAlpha(count)).toBe(false);
    expect(buffer.getPerformanceSnapshot()).toMatchObject({
      recordScans: count,
      summaryPrefixQueries: 4,
      summaryRemainderScans: 0
    });

    writeMarker(source, count - 1, {
      color: [1, 1, 1, 0.5],
      outlineColor: [1, 1, 1, 0.5],
      position: [count - 1, 0, 0]
    });
    buffer.commit(count - 1, 1);
    expect(buffer.hasPartialFaceAlpha(count)).toBe(true);
    expect(buffer.hasPartialOutlineAlpha(count)).toBe(true);
    expect(buffer.hasVisibleOutlineAlpha(count)).toBe(true);
    expect(buffer.hasPartialFaceAlpha(count / 2)).toBe(false);
    expect(buffer.getPerformanceSnapshot()).toMatchObject({
      recordScans: count + 1,
      recordViewAllocations: 1,
      summaryRemainderScans: 0,
      summaryStorageAllocations: 3
    });

    buffer.commit();
    buffer.replace(source);
    expect(buffer.getPerformanceSnapshot()).toMatchObject({
      recordScans: count * 3 + 1,
      recordViewAllocations: 2,
      summaryStorageAllocations: 3
    });
  });
});
