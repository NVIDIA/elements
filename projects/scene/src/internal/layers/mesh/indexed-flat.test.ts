// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { registerMarkerLayer } from '../markers/layer-state.js';
import {
  publishMeshGeometry,
  registerMeshLayer,
  replaceMeshGeometry,
  setMeshGeometryProperty,
  takeMeshLayerRenderData
} from './layer-state.js';
import {
  prepareFlatGeometryUpdate,
  prepareMeshGeometry,
  processMeshGeometry,
  updateFlatGeometry,
  type ProcessedMeshGeometry
} from './processing.js';
import type { MeshRenderData } from './render-data.js';
import { PREPARATION_CHUNK_SIZE } from '../../rendering/preparation.js';

function fixture() {
  const layer = document.createElement('div');
  registerMarkerLayer(layer, 'cube');
  registerMeshLayer(layer);
  const source = {
    positions: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0, 2, 1, 0, 2, 2, 0, 8, 8, 8]),
    indices: new Uint32Array([0, 1, 2, 2, 1, 3, 3, 4, 5, 5, 5, 5]),
    uvs: new Float32Array(14),
    colors: new Float32Array(28).fill(1)
  };
  replaceMeshGeometry(layer, source);
  const data = takeMeshLayerRenderData(layer);
  return { layer, source, data, processed: processMeshGeometry(data)! };
}

function matchesFull(result: ProcessedMeshGeometry, data: MeshRenderData): void {
  const full = processMeshGeometry(data)!;
  for (const attribute of ['positions', 'normals', 'uvs', 'colors', 'uploadUvs', 'uploadColors'] as const) {
    expect(result[attribute]).toEqual(full[attribute]);
  }
}

describe('indexed flat mesh updates', () => {
  it('rebuilds adjacency after same-size topology edits and maps subsequent updates through the new corners', () => {
    const { layer, source, processed } = fixture();
    source.indices[1] = 4;
    publishMeshGeometry(layer, { attribute: 'indices', source: source.indices });
    const replacement = processMeshGeometry(takeMeshLayerRenderData(layer))!;
    expect(replacement.indexedFlat?.adjacency).not.toBe(processed.indexedFlat?.adjacency);
    source.positions[14] = 2;
    publishMeshGeometry(layer, { attribute: 'positions', source: source.positions, start: 4, count: 1 });
    const data = takeMeshLayerRenderData(layer);
    const result = updateFlatGeometry(data, replacement)!;
    matchesFull(result, data);
    expect(result.geometryUploadRanges).toEqual([
      { attribute: 'positions', offset: 12, size: 12 },
      { attribute: 'positions', offset: 84, size: 12 },
      { attribute: 'normals', offset: 0, size: 36 },
      { attribute: 'normals', offset: 72, size: 36 }
    ]);
  });

  it('patches shared vertices and deduplicates affected triangles while preserving earlier snapshots', () => {
    const { layer, source, processed, data: before } = fixture();
    const positions = processed.positions.slice();
    const normals = processed.normals.slice();
    source.positions[5] = 2;
    publishMeshGeometry(layer, { attribute: 'positions', source: source.positions, start: 1, count: 1 });
    const data = takeMeshLayerRenderData(layer);
    const result = updateFlatGeometry(data, processed)!;
    matchesFull(result, data);
    expect(result.indexedFlat?.adjacency).toBe(processed.indexedFlat?.adjacency);
    expect(result.geometryUploadRanges).toEqual([
      { attribute: 'positions', offset: 12, size: 12 },
      { attribute: 'positions', offset: 48, size: 12 },
      { attribute: 'normals', offset: 0, size: 72 }
    ]);
    expect(processed.positions).toEqual(positions);
    expect(processed.normals).toEqual(normals);
    expect(before.positions?.[5]).toBe(0);
    expect(result.colors).toBe(processed.colors);
    expect(result.uvs).toBe(processed.uvs);
  });

  it('reuses normals and emits no writes for unused source vertices', () => {
    const { layer, source, processed } = fixture();
    source.positions[18] = 4;
    publishMeshGeometry(layer, { attribute: 'positions', source: source.positions, start: 6, count: 1 });
    const data = takeMeshLayerRenderData(layer);
    const result = updateFlatGeometry(data, processed)!;
    matchesFull(result, data);
    expect(result.geometryUploadRanges).toEqual([]);
    expect(result.normals).toBe(processed.normals);
  });

  it('updates repeated triangle corners and degenerate normals', () => {
    const { layer, source, processed } = fixture();
    source.positions[17] = 3;
    publishMeshGeometry(layer, { attribute: 'positions', source: source.positions, start: 5, count: 1 });
    const data = takeMeshLayerRenderData(layer);
    const result = updateFlatGeometry(data, processed)!;
    matchesFull(result, data);
    expect(result.geometryUploadRanges).toEqual([
      { attribute: 'positions', offset: 96, size: 48 },
      { attribute: 'normals', offset: 72, size: 72 }
    ]);
  });

  it('maps color and UV publications without rebuilding positions or normals', () => {
    const { layer, source, processed } = fixture();
    source.colors[4] = 0.25;
    source.uvs[2] = 0.75;
    publishMeshGeometry(layer, { attribute: 'colors', source: source.colors, start: 1, count: 1 });
    publishMeshGeometry(layer, { attribute: 'uvs', source: source.uvs, start: 1, count: 1 });
    const data = takeMeshLayerRenderData(layer);
    const result = updateFlatGeometry(data, processed)!;
    matchesFull(result, data);
    expect(result.positions).toBe(processed.positions);
    expect(result.normals).toBe(processed.normals);
    expect(result.geometryUploadRanges).toEqual([
      { attribute: 'uvs', offset: 8, size: 8 },
      { attribute: 'uvs', offset: 32, size: 8 },
      { attribute: 'colors', offset: 16, size: 16 },
      { attribute: 'colors', offset: 64, size: 16 }
    ]);
  });

  it('uploads complete default colors after removing supplied colors', () => {
    const { layer, processed } = fixture();
    setMeshGeometryProperty(layer, 'colors', null);
    const data = takeMeshLayerRenderData(layer);
    const result = updateFlatGeometry(data, processed)!;
    matchesFull(result, data);
    expect(result.geometryUploadRanges).toEqual([{ attribute: 'colors', offset: 0, size: 192 }]);
    expect(result.positions).toBe(processed.positions);
  });

  it('retains multiple publications before consumption and falls back when an earlier range was lost', () => {
    const { layer, source, processed } = fixture();
    source.positions[2] = 1;
    publishMeshGeometry(layer, { attribute: 'positions', source: source.positions, start: 0, count: 1 });
    source.positions[5] = 2;
    publishMeshGeometry(layer, { attribute: 'positions', source: source.positions, start: 1, count: 1 });
    const combined = takeMeshLayerRenderData(layer);
    const patched = updateFlatGeometry(combined, processed)!;
    matchesFull(patched, combined);
    expect(patched.geometryUploadRanges?.find(range => range.attribute === 'positions')?.size).toBe(24);
    source.positions[8] = 3;
    publishMeshGeometry(layer, { attribute: 'positions', source: source.positions, start: 2, count: 1 });
    const incomplete = takeMeshLayerRenderData(layer);
    const rebuilt = updateFlatGeometry(incomplete, processed)!;
    matchesFull(rebuilt, incomplete);
    expect(rebuilt.geometryUploadRanges).toEqual([
      { attribute: 'positions', offset: 0, size: 144 },
      { attribute: 'normals', offset: 0, size: 144 }
    ]);
  });

  it('matches complete processing across deterministic sequences of overlapping attribute edits', () => {
    const { layer, source, processed: initial } = fixture();
    let previous = initial;
    for (let step = 0; step < 40; step += 1) {
      const attribute = (['positions', 'colors', 'uvs'] as const)[step % 3]!;
      const width = attribute === 'positions' ? 3 : attribute === 'colors' ? 4 : 2;
      const start = (step * 5) % 7;
      const count = Math.min(7 - start, (step % 3) + 1);
      source[attribute].fill(step % 2 ? 0.25 : 0.75, start * width, (start + count) * width);
      publishMeshGeometry(layer, { attribute, source: source[attribute], start, count });
      const data = takeMeshLayerRenderData(layer);
      const result = updateFlatGeometry(data, previous)!;
      matchesFull(result, data);
      previous = result;
    }
  });

  it('matches synchronous updates after yielding', async () => {
    const { layer, source, processed } = fixture();
    source.positions[5] = 2;
    publishMeshGeometry(layer, { attribute: 'positions', source: source.positions, start: 1, count: 1 });
    const data = takeMeshLayerRenderData(layer);
    const prepared = await prepareFlatGeometryUpdate(data, processed, {
      isCurrent: () => true,
      yield: async () => undefined
    });
    expect(prepared).toEqual(updateFlatGeometry(data, processed));
  });

  it.each([2, 11, 15])(
    'cancels partial preparation at checkpoint %i without changing the baseline',
    async checkpoint => {
      const { source, data } = fixture();
      const bigSource = { ...data, indices: new Uint32Array(PREPARATION_CHUNK_SIZE * 3).fill(1) };
      const previous = processMeshGeometry(bigSource)!;
      const positions = previous.positions.slice();
      const normals = previous.normals.slice();
      const changed = source.positions.slice();
      changed[5] = 2;
      const update = {
        ...bigSource,
        positions: changed,
        geometryVersions: { ...data.geometryVersions, positions: data.geometryVersions.positions + 1 },
        geometryUploadBaseVersions: { positions: data.geometryVersions.positions },
        geometryUploadRanges: [{ attribute: 'positions' as const, offset: 12, size: 12 }]
      };
      let checks = 0;
      await expect(
        prepareFlatGeometryUpdate(update, previous, {
          isCurrent: () => ++checks < checkpoint,
          yield: async () => undefined
        })
      ).resolves.toBeUndefined();
      expect(previous.positions).toEqual(positions);
      expect(previous.normals).toEqual(normals);
    }
  );

  it('cancels adjacency construction without exposing an incomplete index', async () => {
    const { source } = fixture();
    const bigSource = { ...source, indices: new Uint32Array(PREPARATION_CHUNK_SIZE * 3), normals: null };
    let checks = 0;
    await expect(
      prepareMeshGeometry(bigSource, { isCurrent: () => ++checks < 2, yield: async () => undefined })
    ).resolves.toBeUndefined();
    expect(checks).toBe(2);
  });
});
