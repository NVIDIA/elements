// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Vec3 } from '../types.js';
import type { MeshGeometryInput } from './geometry.js';

export interface ProcessedMeshGeometry {
  readonly positions: Float32Array;
  readonly normals: Float32Array;
  readonly uvs: Float32Array | null;
  readonly colors: Float32Array | null;
  readonly indices: Uint32Array | null;
  readonly vertexCount: number;
  readonly triangleCount: number;
  readonly topologyKey: string;
  readonly flatNormals: boolean;
}

export function createTopologyKey(input: Pick<MeshGeometryInput, 'indices' | 'positions' | 'uvs'>): string {
  const positionsLength = input.positions?.length ?? 0;
  const indicesLength = input.indices?.length ?? 0;
  const uvPresence = input.uvs === null ? 'none' : `${input.uvs.length}`;
  return `${indicesLength}/${positionsLength}/${uvPresence}`;
}

/** Build GPU-friendly arrays, expanding indexed geometry for flat normals. */
export function processMeshGeometry(input: MeshGeometryInput): ProcessedMeshGeometry | null {
  if (input.positions === null || input.positions.length === 0) return null;
  const topologyKey = createTopologyKey(input);
  const flatNormals = input.normals === null;
  if (flatNormals && input.indices !== null) {
    return processIndexedFlat(input, topologyKey);
  }
  const positions = input.positions;
  const normals = input.normals ?? calculateFlatNormals(positions, null);
  return {
    positions,
    normals,
    uvs: input.uvs,
    colors: input.colors,
    indices: input.indices,
    vertexCount: positions.length / 3,
    triangleCount: (input.indices?.length ?? positions.length / 3) / 3,
    topologyKey,
    flatNormals
  };
}

/** Recompute flat normals against an already-known topology without validating it. */
export function updateFlatGeometry(
  source: MeshGeometryInput,
  previous: ProcessedMeshGeometry
): ProcessedMeshGeometry | null {
  if (source.positions === null) return null;
  if (source.normals !== null) {
    return {
      ...previous,
      positions: source.positions,
      normals: source.normals,
      colors: source.colors,
      uvs: source.uvs
    };
  }
  if (source.indices === null) {
    return {
      ...previous,
      positions: source.positions,
      normals: calculateFlatNormals(source.positions, null),
      colors: source.colors,
      uvs: source.uvs
    };
  }
  const positions = expand(source.positions, source.indices, 3);
  const uvs = source.uvs === null ? null : expand(source.uvs, source.indices, 2);
  const colors = source.colors === null ? null : expand(source.colors, source.indices, 4);
  return {
    ...previous,
    positions,
    normals: calculateFlatNormals(positions, null),
    uvs,
    colors,
    indices: null,
    vertexCount: positions.length / 3
  };
}

function processIndexedFlat(input: MeshGeometryInput, topologyKey: string): ProcessedMeshGeometry {
  const indices = input.indices as Uint32Array;
  const positions = expand(input.positions as Float32Array, indices, 3);
  return {
    positions,
    normals: calculateFlatNormals(positions, null),
    uvs: input.uvs === null ? null : expand(input.uvs, indices, 2),
    colors: input.colors === null ? null : expand(input.colors, indices, 4),
    indices: null,
    vertexCount: positions.length / 3,
    triangleCount: indices.length / 3,
    topologyKey,
    flatNormals: true
  };
}

function calculateFlatNormals(positions: Float32Array, _indices: Uint32Array | null): Float32Array {
  const normals = new Float32Array(positions.length);
  for (let offset = 0; offset < positions.length; offset += 9) {
    const normal = triangleNormal(positions, offset);
    normals.set(normal, offset);
    normals.set(normal, offset + 3);
    normals.set(normal, offset + 6);
  }
  return normals;
}

function triangleNormal(positions: Float32Array, offset: number): Vec3 {
  const ax = positions[offset + 3]! - positions[offset]!;
  const ay = positions[offset + 4]! - positions[offset + 1]!;
  const az = positions[offset + 5]! - positions[offset + 2]!;
  const bx = positions[offset + 6]! - positions[offset]!;
  const by = positions[offset + 7]! - positions[offset + 1]!;
  const bz = positions[offset + 8]! - positions[offset + 2]!;
  const nx = ay * bz - az * by;
  const ny = az * bx - ax * bz;
  const nz = ax * by - ay * bx;
  const length = Math.hypot(nx, ny, nz);
  return length === 0 ? [0, 0, 1] : [nx / length, ny / length, nz / length];
}

function expand(values: Float32Array, indices: Uint32Array, width: number): Float32Array {
  const result = new Float32Array(indices.length * width);
  for (let index = 0; index < indices.length; index += 1) {
    const sourceOffset = indices[index]! * width;
    result.set(values.subarray(sourceOffset, sourceOffset + width), index * width);
  }
  return result;
}
