// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it, vi } from 'vitest';
import { initializeMarkerRecords, MarkerQuaternionView, writeMarkerQuaternion } from './record-format.js';
import { MARKER } from '../../records/layouts/built-ins.js';
import { readMarker } from '../../records/layouts/codecs.js';

describe('marker record format', () => {
  it('initializes every record with identity rotation, unit scale, and opaque white', () => {
    const bytes = new Uint8Array(MARKER.stride * 2);
    initializeMarkerRecords(new DataView(bytes.buffer), bytes, 2);
    for (const index of [0, 1]) {
      expect(readMarker(bytes, index)).toMatchObject({
        orientation: [0, 0, 0, 1],
        scale: [1, 1, 1],
        color: [1, 1, 1, 1]
      });
    }
  });

  it('normalizes a quaternion in the requested byte range and notifies once after success', () => {
    const bytes = new Uint8Array(48);
    const view = new DataView(bytes.buffer);
    const notify = vi.fn();
    const quaternion = new MarkerQuaternionView(view, 16, notify);
    expect(quaternion.set(0, 0, 2, 2)).toBe(quaternion);
    expect(quaternion.z).toBeCloseTo(Math.SQRT1_2);
    expect(quaternion.w).toBeCloseTo(Math.SQRT1_2);
    expect(notify).toHaveBeenCalledOnce();
    expect(bytes.slice(0, 16)).toEqual(new Uint8Array(16));
    const before = quaternion.toArray();
    expect(() => quaternion.set(0, 0, 0, 0)).toThrow();
    expect(quaternion.toArray()).toEqual(before);
    expect(notify).toHaveBeenCalledOnce();
    expect(() => writeMarkerQuaternion(view, 16, [NaN, 0, 0, 1])).toThrow();
  });
});
