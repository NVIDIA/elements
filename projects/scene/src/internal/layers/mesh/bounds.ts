// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { BoundsAccumulator, type SceneBounds } from '../../math/bounds.js';
import { pointBounds, scalarBounds } from '../../math/point-bounds.js';
import type { HeightfieldMeshData, MeshRenderData } from './render-data.js';

const directBounds = new WeakMap<Float32Array, SceneBounds | null>();
const indexedBounds = new WeakMap<Float32Array, WeakMap<Uint32Array, SceneBounds | null>>();
const heightExtrema = new WeakMap<Float32Array, ReturnType<typeof scalarBounds>>();

/**
 * Reuses local reductions for validated geometry captures whose arrays remain unchanged.
 * Publications replace their captured arrays. Weak keys release obsolete geometry; appearance and poses do not invalidate it.
 * Grid extrema reuse height storage while horizontal extents retain the current origin, spacing, and Float32 rounding.
 */
export function getMeshLocalBounds(
  data: Pick<MeshRenderData, 'positions' | 'indices' | 'heightfield'>
): SceneBounds | null {
  if (data.heightfield) return gridBounds(data.heightfield);
  if (!data.positions) return null;
  return cachedPointBounds(data.positions, data.indices);
}

function cachedPointBounds(positions: Float32Array, indices: Uint32Array | null): SceneBounds | null {
  const cached = indices ? indexedBounds.get(positions)?.get(indices) : directBounds.get(positions);
  if (cached !== undefined) return cached;
  const bounds = pointBounds({ values: positions, count: positions.length / 3, indices });
  if (indices) {
    let entries = indexedBounds.get(positions);
    if (!entries) {
      entries = new WeakMap();
      indexedBounds.set(positions, entries);
    }
    entries.set(indices, bounds);
  } else directBounds.set(positions, bounds);
  return bounds;
}

function gridBounds(grid: HeightfieldMeshData): SceneBounds | null {
  const { columns, heights, origin, spacing } = grid;
  let extrema = heightExtrema.get(heights);
  if (extrema === undefined) {
    extrema = scalarBounds(heights);
    heightExtrema.set(heights, extrema);
  }
  if (extrema === null) return null;
  const bounds = new BoundsAccumulator();
  const lastColumn = Math.min(columns, heights.length) - 1;
  const lastRow = Math.floor((heights.length - 1) / columns);
  bounds.include([sampleCoordinate(origin[0], 0, spacing), sampleCoordinate(origin[1], 0, spacing), extrema[0]]);
  bounds.include([
    sampleCoordinate(origin[0], lastColumn, spacing),
    sampleCoordinate(origin[1], lastRow, spacing),
    extrema[1]
  ]);
  return bounds.bounds;
}

function sampleCoordinate(origin: number, index: number, spacing: number): number {
  return Math.fround(origin + index * spacing);
}
