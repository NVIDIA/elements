// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { MeshGeometryInput } from './geometry.js';
import { indexedFlatGeometry, type IndexedFlatInput, type IndexedFlatState } from './indexed-flat.js';
import type { MeshGeometryUploadRange } from './render-data.js';
import { writeTriangleNormal } from '../../math/triangle-normal.js';
import {
  beginPreparation,
  resumePreparation,
  runPreparationSync,
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
  const normals = input.normals ?? runPreparationSync(buildFlatNormals(positions, Number.MAX_SAFE_INTEGER));
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
  const normals = await resumePreparation(buildFlatNormals(input.positions), context);
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
        normals: runPreparationSync(buildFlatNormals(source.positions, Number.MAX_SAFE_INTEGER)),
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
    const normals = await resumePreparation(buildFlatNormals(source.positions), context);
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
  // @hotpath A local drain preserves the indexed traversal's fast synchronous updates.
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
  const core = await resumePreparation(
    indexedFlatGeometry({
      source: options.input,
      topologyKey: options.topologyKey,
      previous: options.previous
    }),
    context
  );
  return core ? prepareUploadValues(core, context, options.previous) : undefined;
}

function completeUploadValues(core: ProcessedMeshCore, previous?: ProcessedMeshGeometry): ProcessedMeshGeometry {
  const reusedColors = reusableUploadValues(core, previous, 'colors');
  const reusedUvs = reusableUploadValues(core, previous, 'uvs');
  return {
    ...core,
    uploadColors:
      core.colors ??
      reusedColors ??
      runPreparationSync(buildFilledValues(core.vertexCount * 4, 1, Number.MAX_SAFE_INTEGER)),
    uploadUvs: core.uvs ?? reusedUvs ?? new Float32Array(core.vertexCount * 2)
  };
}

async function prepareUploadValues(
  core: ProcessedMeshCore,
  context: PreparationContext,
  previous?: ProcessedMeshGeometry
): Promise<ProcessedMeshGeometry | undefined> {
  const reusedColors = reusableUploadValues(core, previous, 'colors');
  const uploadColors =
    core.colors ?? reusedColors ?? (await resumePreparation(buildFilledValues(core.vertexCount * 4, 1), context));
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

function* buildFilledValues(
  length: number,
  value: number,
  chunkSize = PREPARATION_CHUNK_SIZE
): Generator<void, Float32Array, void> {
  const values = new Float32Array(length);
  for (let start = 0; start < length; start += chunkSize) {
    values.fill(value, start, Math.min(length, start + chunkSize));
    if (start + chunkSize <= length) yield;
  }
  return values;
}

function* buildFlatNormals(
  positions: Float32Array,
  chunkSize = PREPARATION_CHUNK_SIZE
): Generator<void, Float32Array, void> {
  const normals = new Float32Array(positions.length);
  const geometry = { positions, normals };
  const chunkLength = Math.ceil(chunkSize / 3) * 9;
  for (let start = 0; start < positions.length; start += chunkLength) {
    const end = Math.min(positions.length, start + chunkLength);
    for (let offset = start; offset < end; offset += 9) writeTriangleNormal(geometry, offset);
    if (start + chunkLength <= positions.length) yield;
  }
  return normals;
}
