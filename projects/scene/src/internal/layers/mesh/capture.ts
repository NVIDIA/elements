// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { EMPTY_ALPHA_SUMMARY, mergeAlphaSummaries, summarizeRGBAAlpha, type AlphaSummary } from '../../color/alpha.js';
import { copySnapshot } from '../../rendering/capture.js';
import { runPreparation, type PreparationContext } from '../../rendering/preparation.js';
import {
  validateMeshGeometryArrayTypes,
  validateMeshGeometryRange,
  validateMeshGeometryShape,
  type MeshGeometryInput
} from './geometry.js';

const MAX_GEOMETRY_BYTES = 256 * 1024 * 1024;

export interface CapturedMeshGeometry {
  readonly geometry: MeshGeometryInput;
  readonly alphaSummary: AlphaSummary;
}

/** Resolves array references and checks array types before copying. */
export function readMeshGeometry(input: unknown): MeshGeometryInput {
  if (typeof input !== 'object' || input === null) throw new TypeError('Mesh geometry must be an object.');
  const geometry: MeshGeometryInput = {
    colors: Reflect.get(input, 'colors') ?? null,
    indices: Reflect.get(input, 'indices') ?? null,
    normals: Reflect.get(input, 'normals') ?? null,
    positions: Reflect.get(input, 'positions'),
    uvs: Reflect.get(input, 'uvs') ?? null
  };
  validateMeshGeometryArrayTypes(geometry);
  return geometry;
}

function validateAllocation(geometry: MeshGeometryInput): void {
  const vertexCount = geometry.positions === null ? 0 : geometry.positions.length / 3;
  const vertices = geometry.indices && !geometry.normals ? geometry.indices.length : vertexCount;
  const preparedBytes =
    vertices * (6 + (geometry.colors ? 4 : 0) + (geometry.uvs ? 2 : 0)) * 4 + (geometry.indices?.byteLength ?? 0);
  if (meshGeometryScalarCount(geometry) * 4 > MAX_GEOMETRY_BYTES || preparedBytes > MAX_GEOMETRY_BYTES) {
    throw new RangeError('Mesh geometry exceeds the 256 MiB allocation limit.');
  }
}

export function meshGeometryScalarCount(geometry: MeshGeometryInput): number {
  let count = 0;
  for (const field of ['positions', 'normals', 'uvs', 'colors', 'indices'] as const)
    count += geometry[field]?.length ?? 0;
  return count;
}

export function prepareMeshGeometryCapture(
  input: unknown,
  context: PreparationContext
): Promise<CapturedMeshGeometry | undefined> {
  const geometry = readMeshGeometry(input);
  validateAllocation(geometry);
  validateMeshGeometryShape(geometry);
  return runPreparation(captureGeometry(geometry), context);
}

function* captureGeometry(input: MeshGeometryInput): Generator<void, CapturedMeshGeometry> {
  const vertexCount = (input.positions?.length ?? 0) / 3;
  let alphaSummary = EMPTY_ALPHA_SUMMARY;
  const captured: { -readonly [Key in keyof MeshGeometryInput]: MeshGeometryInput[Key] } = { ...input };
  for (const field of ['positions', 'normals', 'uvs', 'colors'] as const) {
    const source = input[field];
    if (!source) continue;
    captured[field] = yield* copySnapshot(source, new Float32Array(source.length), values => {
      validateMeshGeometryRange(field, values, vertexCount);
      if (field === 'colors') alphaSummary = mergeAlphaSummaries(alphaSummary, summarizeRGBAAlpha(values));
    });
    yield;
  }
  if (input.indices) {
    captured.indices = yield* copySnapshot(input.indices, new Uint32Array(input.indices.length), values =>
      validateMeshGeometryRange('indices', values, vertexCount)
    );
  }
  return { geometry: captured, alphaSummary };
}
