// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { MeshGeometryInput } from './geometry.js';
import { indexedFlatGeometry, type IndexedFlatInput, type IndexedFlatState } from './indexed-flat.js';
import type { MeshGeometryUploadRange } from './render-data.js';
import { writeTriangleNormal } from '../../math/triangle-normal.js';
import {
  beginPreparation,
  continuePreparation,
  PREPARATION_CHUNK_SIZE,
  type PreparationContext
} from '../../rendering/preparation.js';

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
  readonly indexedFlat?: IndexedFlatState;
  /** Expanded ranges for indexed flat geometry; an empty list means no GPU writes. */
  readonly geometryUploadRanges?: readonly MeshGeometryUploadRange[];
}

type ProcessedMeshCore = Omit<ProcessedMeshGeometry, 'uploadColors' | 'uploadUvs'>;

export function createTopologyKey(input: Pick<MeshGeometryInput, 'indices' | 'positions' | 'uvs'>): string {
  const positionsLength = input.positions?.length ?? 0;
  const indicesLength = input.indices?.length ?? 0;
  const uvPresence = input.uvs === null ? 'none' : `${input.uvs.length}`;
  return `${indicesLength}/${positionsLength}/${uvPresence}`;
}

/** Build GPU-friendly arrays, expanding indexed geometry for flat normals. */
export function processMeshGeometry(input: IndexedFlatInput): ProcessedMeshGeometry | null {
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
  input: IndexedFlatInput,
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
  input: IndexedFlatInput,
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
  if (input.indices !== null) return prepareIndexedFlat({ input, topologyKey }, context);
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
  source: IndexedFlatInput,
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
  return processIndexedFlat(source, createTopologyKey(source), previous);
}

/** Rebuilds generated attributes for a known topology without blocking a render callback. */
export async function prepareFlatGeometryUpdate(
  source: IndexedFlatInput,
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
  return prepareIndexedFlat({ input: source, topologyKey: createTopologyKey(source), previous }, context);
}

function processIndexedFlat(
  input: IndexedFlatInput,
  topologyKey: string,
  previous?: ProcessedMeshGeometry
): ProcessedMeshGeometry {
  const builder = indexedFlatGeometry({ source: input, topologyKey, previous });
  let step = builder.next();
  while (!step.done) step = builder.next();
  return completeUploadValues(step.value, previous);
}

async function prepareIndexedFlat(
  options: {
    readonly input: IndexedFlatInput;
    readonly topologyKey: string;
    readonly previous?: ProcessedMeshGeometry;
  },
  context: PreparationContext
): Promise<ProcessedMeshGeometry | undefined> {
  const builder = indexedFlatGeometry({
    source: options.input,
    topologyKey: options.topologyKey,
    previous: options.previous
  });
  let step = builder.next();
  while (!step.done) {
    if (!(await continuePreparation(context))) return undefined;
    step = builder.next();
  }
  return prepareUploadValues(step.value, context, options.previous);
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
  const geometry = { positions, normals };
  for (let offset = 0; offset < positions.length; offset += 9) {
    writeTriangleNormal(geometry, offset);
  }
  return normals;
}

async function prepareFlatNormals(
  positions: Float32Array,
  context: PreparationContext
): Promise<Float32Array | undefined> {
  const normals = new Float32Array(positions.length);
  const geometry = { positions, normals };
  let work = 0;
  for (let offset = 0; offset < positions.length; offset += 9) {
    writeTriangleNormal(geometry, offset);
    work += 3;
    if (work >= PREPARATION_CHUNK_SIZE) {
      work = 0;
      if (!(await continuePreparation(context))) return undefined;
    }
  }
  return context.isCurrent() ? normals : undefined;
}
