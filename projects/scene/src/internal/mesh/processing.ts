// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { MeshGeometryInput } from './geometry.js';
import {
  beginPreparation,
  continuePreparation,
  PREPARATION_CHUNK_SIZE,
  type PreparationContext
} from '../preparation.js';

export interface ProcessedMeshGeometry {
  readonly positions: Float32Array;
  readonly normals: Float32Array;
  readonly uvs: Float32Array | null;
  readonly colors: Float32Array | null;
  /** Complete color data retained so the render callback never synthesizes defaults. */
  readonly uploadColors: Float32Array;
  /** Complete texture coordinates retained so the render callback never synthesizes defaults. */
  readonly uploadUvs: Float32Array;
  readonly indices: Uint32Array | null;
  readonly vertexCount: number;
  readonly triangleCount: number;
  readonly topologyKey: string;
  readonly flatNormals: boolean;
}

type ProcessedMeshCore = Omit<ProcessedMeshGeometry, 'uploadColors' | 'uploadUvs'>;

interface ExpandedValuesOptions {
  readonly context: PreparationContext;
  readonly indices: Uint32Array;
  readonly values: Float32Array;
  readonly width: number;
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
  return completeUploadValues({
    positions,
    normals,
    uvs: input.uvs,
    colors: input.colors,
    indices: input.indices,
    vertexCount: positions.length / 3,
    triangleCount: (input.indices?.length ?? positions.length / 3) / 3,
    topologyKey,
    flatNormals
  });
}

/** Builds generated mesh attributes in bounded tasks, or returns undefined after cancellation. */
export async function prepareMeshGeometry(
  input: MeshGeometryInput,
  context: PreparationContext
): Promise<ProcessedMeshGeometry | null | undefined> {
  if (!(await beginPreparation(context))) return undefined;
  return continueMeshGeometryPreparation(input, context);
}

/**
 * Finishes mesh preparation after an enclosing task has already yielded.
 * This keeps compound preparations, such as CPU heightfields, in one task.
 */
export async function continueMeshGeometryPreparation(
  input: MeshGeometryInput,
  context: PreparationContext
): Promise<ProcessedMeshGeometry | null | undefined> {
  if (input.positions === null || input.positions.length === 0) return null;
  const topologyKey = createTopologyKey(input);
  if (input.normals !== null) {
    return prepareUploadValues(
      {
        colors: input.colors,
        flatNormals: false,
        indices: input.indices,
        normals: input.normals,
        positions: input.positions,
        topologyKey,
        triangleCount: (input.indices?.length ?? input.positions.length / 3) / 3,
        uvs: input.uvs,
        vertexCount: input.positions.length / 3
      },
      context
    );
  }
  if (input.indices !== null) return prepareIndexedFlat(input, topologyKey, context);
  const normals = await prepareFlatNormals(input.positions, context);
  if (!normals) return undefined;
  return prepareUploadValues(
    {
      colors: input.colors,
      flatNormals: true,
      indices: null,
      normals,
      positions: input.positions,
      topologyKey,
      triangleCount: input.positions.length / 9,
      uvs: input.uvs,
      vertexCount: input.positions.length / 3
    },
    context
  );
}

/** Recompute flat normals against an already-known topology without validating it. */
export function updateFlatGeometry(
  source: MeshGeometryInput,
  previous: ProcessedMeshGeometry
): ProcessedMeshGeometry | null {
  if (source.positions === null) return null;
  if (source.normals !== null) {
    return completeUploadValues(
      {
        ...previous,
        positions: source.positions,
        normals: source.normals,
        colors: source.colors,
        uvs: source.uvs
      },
      previous
    );
  }
  if (source.indices === null) {
    return completeUploadValues(
      {
        ...previous,
        positions: source.positions,
        normals: calculateFlatNormals(source.positions, null),
        colors: source.colors,
        uvs: source.uvs
      },
      previous
    );
  }
  const positions = expand(source.positions, source.indices, 3);
  const uvs = source.uvs === null ? null : expand(source.uvs, source.indices, 2);
  const colors = source.colors === null ? null : expand(source.colors, source.indices, 4);
  return completeUploadValues(
    {
      ...previous,
      positions,
      normals: calculateFlatNormals(positions, null),
      uvs,
      colors,
      indices: null,
      vertexCount: positions.length / 3
    },
    previous
  );
}

/** Rebuilds generated attributes for a known topology without blocking a render callback. */
// eslint-disable-next-line complexity, max-lines-per-function, max-statements -- Optional attributes require distinct cancellation points.
export async function prepareFlatGeometryUpdate(
  source: MeshGeometryInput,
  previous: ProcessedMeshGeometry,
  context: PreparationContext
): Promise<ProcessedMeshGeometry | null | undefined> {
  if (!(await beginPreparation(context))) return undefined;
  if (source.positions === null) return null;
  if (source.normals !== null) {
    return prepareUploadValues(
      {
        ...previous,
        colors: source.colors,
        normals: source.normals,
        positions: source.positions,
        uvs: source.uvs
      },
      context,
      previous
    );
  }
  if (source.indices === null) {
    const normals = await prepareFlatNormals(source.positions, context);
    return normals
      ? prepareUploadValues(
          { ...previous, colors: source.colors, normals, positions: source.positions, uvs: source.uvs },
          context,
          previous
        )
      : undefined;
  }
  const positions = await prepareExpandedValues({
    context,
    indices: source.indices,
    values: source.positions,
    width: 3
  });
  if (!positions) return undefined;
  const normals = await prepareFlatNormals(positions, context);
  if (!normals) return undefined;
  const uvs =
    source.uvs === null
      ? null
      : await prepareExpandedValues({ context, indices: source.indices, values: source.uvs, width: 2 });
  if (uvs === undefined) return undefined;
  const colors =
    source.colors === null
      ? null
      : await prepareExpandedValues({ context, indices: source.indices, values: source.colors, width: 4 });
  if (colors === undefined) return undefined;
  return prepareUploadValues(
    { ...previous, colors, indices: null, normals, positions, uvs, vertexCount: positions.length / 3 },
    context,
    previous
  );
}

function processIndexedFlat(input: MeshGeometryInput, topologyKey: string): ProcessedMeshGeometry {
  const indices = input.indices as Uint32Array;
  const positions = expand(input.positions as Float32Array, indices, 3);
  return completeUploadValues({
    positions,
    normals: calculateFlatNormals(positions, null),
    uvs: input.uvs === null ? null : expand(input.uvs, indices, 2),
    colors: input.colors === null ? null : expand(input.colors, indices, 4),
    indices: null,
    vertexCount: positions.length / 3,
    triangleCount: indices.length / 3,
    topologyKey,
    flatNormals: true
  });
}

async function prepareIndexedFlat(
  input: MeshGeometryInput,
  topologyKey: string,
  context: PreparationContext
): Promise<ProcessedMeshGeometry | undefined> {
  const indices = input.indices as Uint32Array;
  const positions = await prepareExpandedValues({
    context,
    indices,
    values: input.positions as Float32Array,
    width: 3
  });
  if (!positions) return undefined;
  const normals = await prepareFlatNormals(positions, context);
  if (!normals) return undefined;
  const uvs =
    input.uvs === null ? null : await prepareExpandedValues({ context, indices, values: input.uvs, width: 2 });
  if (uvs === undefined) return undefined;
  const colors =
    input.colors === null ? null : await prepareExpandedValues({ context, indices, values: input.colors, width: 4 });
  if (colors === undefined) return undefined;
  return prepareUploadValues(
    {
      colors,
      flatNormals: true,
      indices: null,
      normals,
      positions,
      topologyKey,
      triangleCount: indices.length / 3,
      uvs,
      vertexCount: positions.length / 3
    },
    context
  );
}

function completeUploadValues(core: ProcessedMeshCore, previous?: ProcessedMeshGeometry): ProcessedMeshGeometry {
  const reusedColors = reusableUploadValues(core, previous, 'colors');
  const reusedUvs = reusableUploadValues(core, previous, 'uvs');
  return {
    ...core,
    uploadColors: core.colors ?? reusedColors ?? new Float32Array(core.vertexCount * 4).fill(1),
    uploadUvs: core.uvs ?? reusedUvs ?? new Float32Array(core.vertexCount * 2)
  };
}

async function prepareUploadValues(
  core: ProcessedMeshCore,
  context: PreparationContext,
  previous?: ProcessedMeshGeometry
): Promise<ProcessedMeshGeometry | undefined> {
  const reusedColors = reusableUploadValues(core, previous, 'colors');
  const uploadColors = core.colors ?? reusedColors ?? (await prepareFilledValues(core.vertexCount * 4, 1, context));
  if (!uploadColors) return undefined;
  const reusedUvs = reusableUploadValues(core, previous, 'uvs');
  const uploadUvs = core.uvs ?? reusedUvs ?? new Float32Array(core.vertexCount * 2);
  return context.isCurrent() ? { ...core, uploadColors, uploadUvs } : undefined;
}

function reusableUploadValues(
  core: ProcessedMeshCore,
  previous: ProcessedMeshGeometry | undefined,
  attribute: 'colors' | 'uvs'
): Float32Array | undefined {
  if (!previous || previous.vertexCount !== core.vertexCount || previous[attribute] !== null) return undefined;
  return attribute === 'colors' ? previous.uploadColors : previous.uploadUvs;
}

async function prepareFilledValues(
  length: number,
  value: number,
  context: PreparationContext
): Promise<Float32Array | undefined> {
  const values = new Float32Array(length);
  for (let index = 0; index < length; index += 1) {
    values[index] = value;
    if ((index + 1) % PREPARATION_CHUNK_SIZE === 0 && !(await continuePreparation(context))) return undefined;
  }
  return context.isCurrent() ? values : undefined;
}

function calculateFlatNormals(positions: Float32Array, _indices: Uint32Array | null): Float32Array {
  const normals = new Float32Array(positions.length);
  for (let offset = 0; offset < positions.length; offset += 9) {
    writeTriangleNormal(positions, normals, offset);
  }
  return normals;
}

async function prepareFlatNormals(
  positions: Float32Array,
  context: PreparationContext
): Promise<Float32Array | undefined> {
  const normals = new Float32Array(positions.length);
  let work = 0;
  for (let offset = 0; offset < positions.length; offset += 9) {
    writeTriangleNormal(positions, normals, offset);
    work += 3;
    if (work >= PREPARATION_CHUNK_SIZE) {
      work = 0;
      if (!(await continuePreparation(context))) return undefined;
    }
  }
  return context.isCurrent() ? normals : undefined;
}

// eslint-disable-next-line max-statements -- Direct scalar writes avoid per-triangle temporary arrays.
function writeTriangleNormal(positions: Float32Array, normals: Float32Array, offset: number): void {
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
  const inverseLength = length === 0 ? 0 : 1 / length;
  const normalX = nx * inverseLength;
  const normalY = ny * inverseLength;
  const normalZ = length === 0 ? 1 : nz * inverseLength;
  for (let vertex = 0; vertex < 3; vertex += 1) {
    const target = offset + vertex * 3;
    normals[target] = normalX;
    normals[target + 1] = normalY;
    normals[target + 2] = normalZ;
  }
}

function expand(values: Float32Array, indices: Uint32Array, width: number): Float32Array {
  const result = new Float32Array(indices.length * width);
  for (let index = 0; index < indices.length; index += 1) {
    const sourceOffset = indices[index]! * width;
    result.set(values.subarray(sourceOffset, sourceOffset + width), index * width);
  }
  return result;
}

async function prepareExpandedValues(options: ExpandedValuesOptions): Promise<Float32Array | undefined> {
  const { context, indices, values, width } = options;
  const result = new Float32Array(indices.length * width);
  for (let index = 0; index < indices.length; index += 1) {
    const sourceOffset = indices[index]! * width;
    const targetOffset = index * width;
    for (let component = 0; component < width; component += 1) {
      result[targetOffset + component] = values[sourceOffset + component]!;
    }
    if ((index + 1) % PREPARATION_CHUNK_SIZE === 0 && !(await continuePreparation(context))) return undefined;
  }
  return context.isCurrent() ? result : undefined;
}
