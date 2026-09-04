// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { MeshGeometryValidationError, validateMeshGeometry } from './geometry.js';
import {
  continueMeshGeometryPreparation,
  createTopologyKey,
  prepareFlatGeometryUpdate,
  prepareMeshGeometry,
  processMeshGeometry,
  updateFlatGeometry
} from './processing.js';
import { PREPARATION_CHUNK_SIZE, type PreparationContext } from '../preparation.js';

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

  it('prepares indexed flat geometry after yielding and matches synchronous processing', async () => {
    const input = {
      colors: new Float32Array(12).fill(1),
      indices: new Uint32Array([2, 1, 0]),
      normals: null,
      positions: triangle,
      uvs: new Float32Array([0, 0, 0.5, 0.5, 1, 1])
    };
    const deferred = createDeferredContext();
    let settled = false;
    const pending = prepareMeshGeometry(input, deferred.context).then(result => {
      settled = true;
      return result;
    });

    await Promise.resolve();
    expect(settled).toBe(false);
    deferred.release();

    const prepared = await pending;
    expect(prepared).toEqual(processMeshGeometry(input));
  });

  it('prepares empty and supplied geometry while discarding obsolete initial work', async () => {
    const empty = { colors: null, indices: null, normals: null, positions: new Float32Array(), uvs: null };
    const absent = { ...empty, positions: null };
    const supplied = {
      colors: new Float32Array(12).fill(0.5),
      indices: new Uint32Array([0, 1, 2]),
      normals: new Float32Array(triangle.length).fill(1),
      positions: triangle,
      uvs: new Float32Array(6).fill(0.25)
    };

    await expect(prepareMeshGeometry(supplied, createSequencedContext(false))).resolves.toBeUndefined();
    await expect(continueMeshGeometryPreparation(absent, createSequencedContext(true))).resolves.toBeNull();
    await expect(continueMeshGeometryPreparation(empty, createSequencedContext(true))).resolves.toBeNull();
    await expect(continueMeshGeometryPreparation(supplied, createSequencedContext(true))).resolves.toEqual(
      processMeshGeometry(supplied)
    );
  });

  it('prepares each flat-geometry update shape and reuses synthesized attributes', async () => {
    const previous = processMeshGeometry({
      colors: null,
      indices: null,
      normals: null,
      positions: triangle,
      uvs: null
    })!;
    const suppliedNormals = new Float32Array(triangle.length).fill(1);
    const supplied = await prepareFlatGeometryUpdate(
      { colors: null, indices: null, normals: suppliedNormals, positions: triangle, uvs: null },
      previous,
      createSequencedContext(true)
    );

    expect(supplied?.normals).toBe(suppliedNormals);
    expect(supplied?.uploadColors).toBe(previous.uploadColors);
    expect(supplied?.uploadUvs).toBe(previous.uploadUvs);
    await expect(
      prepareFlatGeometryUpdate(
        { colors: null, indices: null, normals: null, positions: null, uvs: null },
        previous,
        createSequencedContext(true)
      )
    ).resolves.toBeNull();
    await expect(
      prepareFlatGeometryUpdate(
        { colors: null, indices: null, normals: null, positions: triangle, uvs: null },
        previous,
        createSequencedContext(true)
      )
    ).resolves.toMatchObject({ flatNormals: true, indices: null });
    await expect(
      prepareFlatGeometryUpdate(
        {
          colors: new Float32Array(12).fill(0.5),
          indices: new Uint32Array([2, 1, 0]),
          normals: null,
          positions: triangle,
          uvs: new Float32Array(6).fill(0.25)
        },
        previous,
        createSequencedContext(true)
      )
    ).resolves.toMatchObject({ flatNormals: true, indices: null });
    await expect(
      prepareFlatGeometryUpdate(
        { colors: null, indices: new Uint32Array([2, 1, 0]), normals: null, positions: triangle, uvs: null },
        previous,
        createSequencedContext(true)
      )
    ).resolves.toMatchObject({ colors: null, uvs: null });
    await expect(
      prepareFlatGeometryUpdate(
        { colors: null, indices: null, normals: null, positions: triangle, uvs: null },
        previous,
        createSequencedContext(false)
      )
    ).resolves.toBeUndefined();
  });

  it('reallocates synthesized attributes when previous geometry cannot be reused', () => {
    const previous = processMeshGeometry({
      colors: new Float32Array(12).fill(0.5),
      indices: null,
      normals: new Float32Array(triangle.length).fill(1),
      positions: triangle,
      uvs: new Float32Array(6).fill(0.25)
    })!;
    const updated = updateFlatGeometry(
      { colors: null, indices: null, normals: previous.normals, positions: triangle, uvs: null },
      previous
    )!;
    expect(updated.uploadColors).not.toBe(previous.uploadColors);
    expect(updated.uploadUvs).not.toBe(previous.uploadUvs);
  });

  it.each([
    { name: 'expanded positions', checks: [true, false] },
    { name: 'generated normals', checks: [true, true, true, false] },
    { name: 'expanded UVs', checks: [true, true, true, true, true, false] },
    { name: 'expanded colors', checks: [true, true, true, true, true, true, true, false] }
  ])('cancels indexed preparation during $name', async ({ checks }) => {
    const indices = new Uint32Array(PREPARATION_CHUNK_SIZE + 2);
    const source = {
      colors: new Float32Array(4).fill(1),
      indices,
      normals: null,
      positions: triangle,
      uvs: new Float32Array(2)
    };
    const previous = processMeshGeometry({ ...source, indices: new Uint32Array([0, 1, 2]) })!;

    await expect(prepareMeshGeometry(source, createSequencedContext(...checks))).resolves.toBeUndefined();
    await expect(
      prepareFlatGeometryUpdate(source, previous, createSequencedContext(...checks))
    ).resolves.toBeUndefined();
  });

  it('discards generated normals, default colors, and completed uploads that become obsolete', async () => {
    const triangleCount = Math.ceil(PREPARATION_CHUNK_SIZE / 3);
    const positions = new Float32Array(triangleCount * 9);
    const normals = new Float32Array(positions.length);

    await expect(
      continueMeshGeometryPreparation(
        { colors: null, indices: null, normals: null, positions, uvs: null },
        createSequencedContext(false)
      )
    ).resolves.toBeUndefined();
    await expect(
      continueMeshGeometryPreparation(
        { colors: null, indices: null, normals, positions, uvs: null },
        createSequencedContext(false)
      )
    ).resolves.toBeUndefined();
    await expect(
      continueMeshGeometryPreparation(
        {
          colors: new Float32Array(positions.length / 3 / 3).fill(1),
          indices: null,
          normals,
          positions,
          uvs: new Float32Array(positions.length / 3 / 2)
        },
        createSequencedContext(false)
      )
    ).resolves.toBeUndefined();
  });
});

function createSequencedContext(...checks: boolean[]): PreparationContext {
  let index = 0;
  const fallback = checks.at(-1) ?? true;
  return {
    isCurrent: () => checks[index++] ?? fallback,
    yield: async () => undefined
  };
}

function createDeferredContext(): { readonly context: PreparationContext; release(): void } {
  let pending = true;
  let release: () => void = () => undefined;
  return {
    context: {
      isCurrent: () => true,
      yield: () => (pending ? new Promise<void>(resolve => (release = resolve)) : Promise.resolve())
    },
    release: () => {
      pending = false;
      release();
    }
  };
}
