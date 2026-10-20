// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { getMeshLocalBounds } from './bounds.js';
import type { HeightfieldMeshData } from './render-data.js';

describe(getMeshLocalBounds.name, () => {
  it('reuses an indexed capture without rereading positions or indices', () => {
    const positions = trackedArray(new Float32Array([0, 0, 0, 4, 0, 0, 0, 3, 0]));
    const indices = trackedArray(new Uint32Array([0, 1, 2]));
    const data = { positions: positions.values, indices: indices.values };
    const first = getMeshLocalBounds(data);
    const positionReads = positions.reads;
    const indexReads = indices.reads;

    expect(first).toEqual({ minimum: [0, 0, 0], maximum: [4, 3, 0] });
    expect(getMeshLocalBounds({ ...data })).toBe(first);
    expect(positions.reads).toBe(positionReads);
    expect(indices.reads).toBe(indexReads);
    expect(positionReads).toBe(9);
    expect(indexReads).toBe(3);
  });

  it('keeps direct, indexed, empty, and replaced geometry captures independent', () => {
    const positions = new Float32Array([0, 0, 0, 4, 0, 0, 0, 3, 0, 100, 100, 100]);
    const first = new Uint32Array([0, 1, 2]);
    const second = new Uint32Array([0, 2, 3]);
    expect(getMeshLocalBounds({ positions, indices: first })?.maximum).toEqual([4, 3, 0]);
    expect(getMeshLocalBounds({ positions, indices: second })?.maximum).toEqual([100, 100, 100]);
    expect(getMeshLocalBounds({ positions, indices: null })?.maximum).toEqual([100, 100, 100]);
    expect(getMeshLocalBounds({ positions, indices: new Uint32Array() })).toBeNull();
    const replaced = positions.slice();
    replaced[3] = 1;
    replaced[7] = 2;
    expect(getMeshLocalBounds({ positions: replaced, indices: first })?.maximum).toEqual([1, 2, 0]);
    expect(getMeshLocalBounds({ positions, indices: first })?.maximum).toEqual([4, 3, 0]);
    expect(getMeshLocalBounds({ positions: null, indices: null })).toBeNull();
    expect(getMeshLocalBounds({ positions: new Float32Array(), indices: null })).toBeNull();
  });

  it('reuses direct and empty reductions', () => {
    const positions = trackedArray(new Float32Array([1, 2, 3]));
    const direct = { positions: positions.values, indices: null };
    expect(getMeshLocalBounds(direct)).toBe(getMeshLocalBounds(direct));
    expect(positions.reads).toBe(3);
    const empty = { positions: positions.values, indices: new Uint32Array() };
    expect(getMeshLocalBounds(empty)).toBeNull();
    expect(getMeshLocalBounds(empty)).toBeNull();
    expect(positions.reads).toBe(3);
  });

  it('reuses height extrema while recalculating grid dimensions, origin, and spacing', () => {
    const heights = trackedArray(new Float32Array([-3, 4, 1, 2, -1, 0]));
    const grid: HeightfieldMeshData = {
      heights: heights.values,
      columns: 3,
      rows: 2,
      origin: [0, 0],
      spacing: 0.5,
      colors: null
    };
    const data = { positions: null, indices: null, heightfield: grid };
    expect(getMeshLocalBounds(data)).toEqual({ minimum: [0, 0, -3], maximum: [1, 0.5, 4] });
    expect(getMeshLocalBounds(data)?.maximum).toEqual([1, 0.5, 4]);
    expect(
      getMeshLocalBounds({ ...data, heightfield: { ...grid, columns: 2, rows: 3, origin: [10, 20], spacing: 2 } })
    ).toEqual({
      minimum: [10, 20, -3],
      maximum: [12, 24, 4]
    });
    expect(heights.reads).toBe(6);
    expect(getMeshLocalBounds({ ...data, heightfield: { ...grid, heights: new Float32Array(6).fill(1) } })).toEqual({
      minimum: [0, 0, 1],
      maximum: [1, 0.5, 1]
    });
  });

  it('retains Float32 coordinate rounding, signed zeros, empty grids, and overflow rejection', () => {
    const grid: HeightfieldMeshData = {
      heights: new Float32Array([-0, -0, -0, -0]),
      columns: 2,
      rows: 2,
      origin: [-0, 1e8],
      spacing: 0.1,
      colors: null
    };
    const data = { positions: null, indices: null, heightfield: grid };
    expect(getMeshLocalBounds(data)).toEqual({
      minimum: [0, 1e8, -0],
      maximum: [Math.fround(0.1), Math.fround(1e8 + 0.1), 0]
    });
    expect(() => getMeshLocalBounds({ ...data, heightfield: { ...grid, origin: [1e40, 0] } })).toThrow(RangeError);
    expect(getMeshLocalBounds(data)?.minimum).toEqual([0, 1e8, -0]);
    const empty = { ...data, heightfield: { ...grid, heights: new Float32Array() } };
    expect(getMeshLocalBounds(empty)).toBeNull();
    expect(getMeshLocalBounds(empty)).toBeNull();
  });
});

function trackedArray<Array extends Float32Array | Uint32Array>(array: Array) {
  let reads = 0;
  return {
    values: new Proxy(array, {
      get(target, property) {
        if (typeof property === 'string' && /^\d+$/.test(property)) reads += 1;
        return Reflect.get(target, property, target);
      }
    }),
    get reads() {
      return reads;
    }
  };
}
