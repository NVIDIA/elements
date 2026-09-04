// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { MeshGeometryValidationError, validateMeshGeometry } from './geometry.js';
import { createTopologyKey, processMeshGeometry, updateFlatGeometry } from './processing.js';

const triangle = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]);

describe('mesh geometry processing', () => {
  it('returns null for absent or empty positions', () => {
    expect(processMeshGeometry({ positions: null, normals: null, uvs: null, colors: null, indices: null })).toBeNull();
    expect(
      processMeshGeometry({ positions: new Float32Array(), normals: null, uvs: null, colors: null, indices: null })
    ).toBeNull();
    expect(
      updateFlatGeometry({ positions: null, normals: null, uvs: null, colors: null, indices: null }, null as never)
    ).toBeNull();
  });

  it('validates planar arrays and triangle counts', () => {
    expect(() =>
      validateMeshGeometry({ positions: new Float32Array(6), normals: null, uvs: null, colors: null, indices: null })
    ).toThrow(MeshGeometryValidationError);
    expect(() =>
      validateMeshGeometry({
        positions: triangle,
        normals: null,
        uvs: null,
        colors: new Float32Array(3),
        indices: null
      })
    ).toThrow(MeshGeometryValidationError);
    expect(() =>
      validateMeshGeometry({
        positions: triangle,
        normals: null,
        uvs: null,
        colors: null,
        indices: new Uint32Array([0, 1, 9])
      })
    ).toThrow(MeshGeometryValidationError);
  });

  it('computes deterministic flat normals for nonindexed and indexed geometry', () => {
    const input = { positions: triangle, normals: null, uvs: null, colors: null, indices: new Uint32Array([0, 1, 2]) };
    const indexed = processMeshGeometry(input)!;
    expect(indexed.indices).toBeNull();
    expect([...indexed.normals]).toEqual([0, 0, 1, 0, 0, 1, 0, 0, 1]);
    const nonindexed = processMeshGeometry({ ...input, indices: null })!;
    expect(nonindexed.indices).toBeNull();
    expect(nonindexed.triangleCount).toBe(1);
    const zero = processMeshGeometry({ ...input, positions: new Float32Array(9) });
    expect([...zero!.normals]).toEqual([0, 0, 1, 0, 0, 1, 0, 0, 1]);
  });

  it('preserves supplied normals and indexed topology', () => {
    const normals = new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1]);
    const indexed = processMeshGeometry({
      positions: triangle,
      normals,
      uvs: null,
      colors: null,
      indices: new Uint32Array([0, 1, 2])
    })!;
    expect(indexed.indices).toEqual(new Uint32Array([0, 1, 2]));
    expect(indexed.normals).toBe(normals);
    expect(indexed.flatNormals).toBe(false);
    const nonindexed = processMeshGeometry({ positions: triangle, normals, uvs: null, colors: null, indices: null })!;
    expect(nonindexed.normals).toBe(normals);
    expect(nonindexed.triangleCount).toBe(1);
  });

  it('de-indexes UVs and colors alongside indexed flat geometry', () => {
    const indices = new Uint32Array([2, 1, 0]);
    const uvs = new Float32Array([0, 0, 0.5, 0.5, 1, 1]);
    const colors = new Float32Array([1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 1]);
    const result = processMeshGeometry({ positions: triangle, normals: null, uvs, colors, indices })!;
    expect([...result.uvs!]).toEqual([1, 1, 0.5, 0.5, 0, 0]);
    expect([...result.colors!]).toEqual([0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1]);
    expect(result.vertexCount).toBe(3);
  });

  it('keys topology by index/position lengths and UV presence/length', () => {
    expect(createTopologyKey({ positions: triangle, indices: null, uvs: null })).toBe('0/9/none');
    expect(
      createTopologyKey({ positions: triangle, indices: new Uint32Array([0, 1, 2]), uvs: new Float32Array(6) })
    ).toBe('3/9/6');
  });

  it('updates flat geometry for supplied, nonindexed, and indexed sources', () => {
    const previous = processMeshGeometry({
      positions: triangle,
      normals: null,
      uvs: null,
      colors: null,
      indices: null
    })!;
    const supplied = new Float32Array(triangle.length).fill(1);
    const suppliedUpdate = updateFlatGeometry(
      { positions: triangle, normals: supplied, uvs: null, colors: null, indices: null },
      previous
    )!;
    expect(suppliedUpdate.normals).toBe(supplied);
    const nonindexedUpdate = updateFlatGeometry(
      { positions: triangle, normals: null, uvs: null, colors: null, indices: null },
      previous
    )!;
    expect(nonindexedUpdate.indices).toBeNull();
    const indexed = new Uint32Array([0, 1, 2]);
    const indexedUpdate = updateFlatGeometry(
      { positions: triangle, normals: null, uvs: new Float32Array(6), colors: new Float32Array(12), indices: indexed },
      previous
    )!;
    expect(indexedUpdate.indices).toBeNull();
    expect(indexedUpdate.vertexCount).toBe(3);
    const indexedWithoutAttributes = updateFlatGeometry(
      { positions: triangle, normals: null, uvs: null, colors: null, indices: indexed },
      previous
    )!;
    expect(indexedWithoutAttributes.uvs).toBeNull();
    expect(indexedWithoutAttributes.colors).toBeNull();
  });
});
