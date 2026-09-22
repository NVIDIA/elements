// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { MutableVector3View, resolveSceneColor } from '../packed-record-buffer.js';
import { MarkerInstanceBuffer, markerSourceRecordsAreValid } from '../instance-buffer.js';
import { readMarker } from '../layouts/helpers.js';
import { ArrowBuffer, ConeBuffer, CubeBuffer, CylinderBuffer, PyramidBuffer, SphereBuffer } from './semantic-buffer.js';

describe('semantic marker buffers', () => {
  it('supports records-only, capacity-only, and seeded-capacity construction', () => {
    const recordsOnly = new CubeBuffer({ records: [{ position: [1, 2, 3] }] });
    const capacityOnly = new CubeBuffer({ capacity: 2 });
    capacityOnly.setCount(0);
    const seededCapacity = new CubeBuffer({ capacity: 2, records: [{ size: [2, 3, 4] }] });

    expect(recordsOnly).toMatchObject({ capacity: 1, count: 1 });
    expect(capacityOnly).toMatchObject({ capacity: 2, count: 0 });
    expect(seededCapacity).toMatchObject({ capacity: 2, count: 1 });
    expect(readMarker(seededCapacity.mutableBytes, 0).scale).toEqual([2, 3, 4]);
    expect(readMarker(seededCapacity.mutableBytes, 1).scale).toEqual([1, 1, 1]);
    expect(() => new CubeBuffer({ capacity: 0, records: [{}] })).toThrow(RangeError);
  });

  it('packs seeded records exactly like incremental writes', () => {
    const records = [
      { color: 'cyan', featureId: 42, position: [1, 2, 3], size: [4, 5, 6] },
      { orientation: [0, 0, 0, 2], outlineColor: 'magenta' }
    ] as const;
    const seeded = new CubeBuffer({ records });
    const incremental = new CubeBuffer({ capacity: records.length });
    records.forEach(record => incremental.add(record));

    expect(seeded.mutableBytes).toEqual(incremental.mutableBytes);
    expect(seeded.featureIds).toEqual(incremental.featureIds);
  });

  it('uses full dimensions and validates centered semantic records', () => {
    for (const Buffer of [ConeBuffer, CubeBuffer, CylinderBuffer, PyramidBuffer, SphereBuffer]) {
      const records = new Buffer({ records: [{}] });
      expect(readMarker(records.mutableBytes, 0)).toMatchObject({
        color: [1, 1, 1, 1],
        orientation: [0, 0, 0, 1],
        position: [0, 0, 0],
        scale: [1, 1, 1]
      });
      expect(() => new Buffer({ records: [{ size: [-1, 1, 1] }] })).toThrow(RangeError);
      expect(() => new Buffer({ records: [{ orientation: [0, 0, 0, 0] }] })).toThrow(RangeError);
    }
  });

  it('rejects malformed semantic shapes and shared record options', () => {
    expect(() => new CubeBuffer(null as never)).toThrow(TypeError);
    expect(() => new CubeBuffer({ capacity: 1, records: {} as never })).toThrow(TypeError);
    expect(() => new CubeBuffer({ records: [null as never] })).toThrow(TypeError);
    expect(() => new CubeBuffer({ records: [[] as never] })).toThrow(TypeError);
    expect(() => new CubeBuffer({ records: [{ position: {} as never }] })).toThrow(RangeError);
    expect(() => new CubeBuffer({ records: [{ orientation: {} as never }] })).toThrow(RangeError);
    expect(() => new CubeBuffer({ records: [{ color: [1, 1, 1] as never }] })).toThrow(RangeError);
    expect(() => new CubeBuffer({ records: [{ color: [2, 1, 1, 1] }] })).toThrow(RangeError);
    expect(() => resolveSceneColor('not-a-color')).toThrow(TypeError);

    const vector = new MutableVector3View(new DataView(new ArrayBuffer(12)), 0);
    vector.set(1, 2, 3);
    expect(vector.toArray()).toEqual([1, 2, 3]);
  });

  it('validates borrowed marker prefixes without staging them', () => {
    const source = new CubeBuffer({ records: [{}] });
    expect(markerSourceRecordsAreValid(source.mutableBytes, -1)).toBe(false);
    expect(markerSourceRecordsAreValid(source.mutableBytes, 2)).toBe(false);
    source.mutableBytes.fill(0, 12, 28);
    expect(markerSourceRecordsAreValid(source.mutableBytes, 1)).toBe(false);
  });

  it('tracks inactive counts, opaque outlines, and invalid bounds', () => {
    const instances = new MarkerInstanceBuffer();
    instances.setSourceCount(undefined);
    expect(() => instances.setSourceCount(-1)).toThrow(RangeError);

    const outlined = new CubeBuffer({ records: [{ outlineColor: 'white' }] });
    instances.replace(outlined.mutableBytes, 1);
    expect(instances.hasOpaqueOutlineAlpha(1)).toBe(true);

    const invalid = new CubeBuffer({ records: [{}] });
    new DataView(invalid.mutableBytes.buffer, invalid.mutableBytes.byteOffset).setFloat32(0, Number.NaN, true);
    instances.replace(invalid.mutableBytes, 1);
    expect(instances.ready).toBe(false);
  });

  it('encodes arrow directions, zero vectors, and negative z deterministically', () => {
    const arrows = new ArrowBuffer({
      records: [
        {},
        { origin: [1, 2, 3], shaftDiameter: 0.25, vector: [2, 0, 0] },
        { vector: [0, 0, 0] },
        { vector: [0, 0, -2] }
      ]
    });

    expect(readMarker(arrows.mutableBytes, 0)).toMatchObject({
      orientation: [0, 0, 0, 1],
      position: [0, 0, 0],
      scale: [1, 1, 1]
    });
    const positiveX = readMarker(arrows.mutableBytes, 1);
    expect(positiveX.position).toEqual([1, 2, 3]);
    expect(positiveX.scale).toEqual([0.25, 0.25, 2]);
    expect(positiveX.orientation[0]).toBe(0);
    expect(positiveX.orientation[1]).toBeCloseTo(Math.SQRT1_2);
    expect(positiveX.orientation[2]).toBe(0);
    expect(positiveX.orientation[3]).toBeCloseTo(Math.SQRT1_2);
    expect(readMarker(arrows.mutableBytes, 2)).toMatchObject({ orientation: [0, 0, 0, 1], scale: [1, 1, 0] });
    expect(readMarker(arrows.mutableBytes, 3)).toMatchObject({ orientation: [1, 0, 0, 0], scale: [1, 1, 2] });
  });

  it('updates arrow vector and diameter fields atomically through retained handles', () => {
    const arrows = new ArrowBuffer({ records: [{}] });
    const arrow = arrows.at(0);
    arrow.vector.set(0, 3, 0);
    arrow.shaftDiameter = 0;

    expect(arrow.vector.x).toBeCloseTo(0);
    expect(arrow.vector.y).toBeCloseTo(3);
    expect(arrow.vector.z).toBeCloseTo(0);
    expect(readMarker(arrows.mutableBytes, 0).scale).toEqual([0, 0, 3]);
    expect(() => arrow.vector.set(0, Number.NaN, 0)).toThrow(RangeError);
    expect(arrow.vector.y).toBeCloseTo(3);
    expect(() => {
      arrow.shaftDiameter = -1;
    }).toThrow(RangeError);
    expect(arrow.shaftDiameter).toBe(0);
  });
});
