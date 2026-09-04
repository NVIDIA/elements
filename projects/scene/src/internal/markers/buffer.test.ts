// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { readMarker } from '../layouts/helpers.js';
import { MARKER } from '../layouts/built-ins.js';
import { MarkerBuffer } from './buffer.js';

describe('marker buffer', () => {
  it('should allocate fixed record capacity while tracking added records', () => {
    const markers = new MarkerBuffer({ capacity: 2 });

    expect(markers.capacity).toBe(2);
    expect(markers.count).toBe(0);
    expect(markers.bytes).toHaveLength(2 * MARKER.stride);
    expect(readMarker(markers.bytes, 1)).toMatchObject({
      orientation: [0, 0, 0, 1],
      scale: [1, 1, 1]
    });

    markers.add();
    expect(markers.count).toBe(1);
  });

  it('should write initial fields and supported CSS colors into the canonical layout', () => {
    const markers = new MarkerBuffer({ capacity: 1 });
    markers.add({
      position: [1, 2, 3],
      orientation: [0, 0, 0, 2],
      scale: [2, 3, 4],
      color: 'cyan',
      outlineColor: [1, 0, 0, 0.5]
    });

    expect(readMarker(markers.bytes, 0)).toEqual({
      position: [1, 2, 3],
      orientation: [0, 0, 0, 1],
      scale: [2, 3, 4],
      color: [0, 1, 1, 1],
      outlineColor: [1, 0, 0, 128 / 255]
    });
  });

  it('should mutate one record through stable transform and color handles', () => {
    const markers = new MarkerBuffer({ capacity: 2 });
    const first = markers.add();
    markers.add({ position: [9, 9, 9] });

    first.position.set(1, 2, 3);
    first.position.x = 4;
    first.scale.set(2, 3, 4);
    first.orientation.set(0, 0, 0, 2);
    first.color = 'magenta';
    first.outlineColor = [0, 1, 0, 0.25];

    expect(first.index).toBe(0);
    expect(first.position.toArray()).toEqual([4, 2, 3]);
    expect(first.orientation.toArray()).toEqual([0, 0, 0, 1]);
    expect(first.color).toEqual([1, 0, 1, 1]);
    expect(first.outlineColor).toEqual([0, 1, 0, 64 / 255]);
    expect(readMarker(markers.bytes, 0)).toMatchObject({ position: [4, 2, 3], scale: [2, 3, 4] });
    expect(readMarker(markers.bytes, 1).position).toEqual([9, 9, 9]);
  });

  it('should write without allocating handles and lazily return stable handles', () => {
    const markers = new MarkerBuffer({ capacity: 2 });

    markers.set(0, { color: 'cyan', position: [1, 2, 3] }).set(1, { position: [4, 5, 6] });

    expect(markers.count).toBe(2);
    expect(markers.at(0)).toBe(markers.at(0));
    expect(markers.at(0).color).toEqual([0, 1, 1, 1]);
    expect(readMarker(markers.bytes, 1).position).toEqual([4, 5, 6]);
    expect(() => markers.set(3, {})).toThrow(RangeError);
    expect(() => markers.at(2)).toThrow(RangeError);
  });

  it('should version owned writes and explicitly commit escaped mutations', () => {
    const markers = new MarkerBuffer({ capacity: 2 });
    expect(markers.version).toBe(0);

    const marker = markers.add();
    expect(markers.version).toBe(1);
    marker.position.x = 2;
    marker.position.set(3, 4, 5);
    marker.scale.set(2, 2, 2);
    marker.orientation.set(0, 0, 0, 1);
    marker.color = 'cyan';
    marker.outlineColor = 'magenta';
    expect(markers.version).toBe(1);
    markers.commit(0, 1);
    expect(markers.version).toBe(2);

    const bytes = markers.bytes;
    new DataView(bytes.buffer).setFloat32(MARKER.stride, 4, true);
    markers.commit(1, 1);
    expect(markers.count).toBe(2);
    expect(markers.version).toBe(3);
    expect(() => markers.commit(2, 1)).toThrow(RangeError);
  });

  it('should reject invalid capacity, overflow, colors, and transforms', () => {
    expect(() => new MarkerBuffer({ capacity: -1 })).toThrow(RangeError);
    expect(() => new MarkerBuffer({ capacity: 0.5 })).toThrow(RangeError);

    const markers = new MarkerBuffer({ capacity: 1 });
    const marker = markers.add();
    expect(() => markers.add()).toThrow(RangeError);
    expect(() => {
      marker.color = 'not-a-color';
    }).toThrow(TypeError);
    expect(() => marker.position.set(Number.NaN, 0, 0)).toThrow(RangeError);
    expect(() => marker.orientation.set(0, 0, 0, 0)).toThrow(RangeError);
  });
});
