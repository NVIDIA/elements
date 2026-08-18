// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { MESH_GEOMETRY } from '../../errors.js';

export interface MeshGeometryInput {
  readonly positions: Float32Array | null;
  readonly normals: Float32Array | null;
  readonly uvs: Float32Array | null;
  readonly colors: Float32Array | null;
  readonly indices: Uint32Array | null;
}

type MeshGeometryField = keyof MeshGeometryInput;

export class MeshGeometryValidationError extends RangeError {
  readonly code = MESH_GEOMETRY;
  readonly field: MeshGeometryField | 'geometry';

  constructor(field: MeshGeometryField | 'geometry', message: string) {
    super(message);
    this.name = 'MeshGeometryValidationError';
    this.field = field;
  }
}

/**
 * Check a complete mesh input. The function intentionally does not copy the
 * arrays: separate validation from processing so the dynamic upload path
 * can avoid validating every frame.
 */
export function validateMeshGeometry(input: MeshGeometryInput): void {
  validateArrayTypes(input);
  const positions = requirePositions(input);
  if (positions === null) return;
  const vertexCount = validatePositions(positions, input.indices !== null);
  validateNormals(input.normals, positions);
  validateUvs(input.uvs, vertexCount);
  validateColors(input.colors, vertexCount);
  validateIndices(input.indices, vertexCount);
}

function validateArrayType<T extends Float32Array | Uint32Array>(
  value: T | null,
  field: MeshGeometryField,
  type: new (length: number) => T
): void {
  if (value !== null && !(value instanceof type)) {
    throw new TypeError(`${field} must be a ${type.name} or null.`);
  }
}

function assertFinite(values: ArrayLike<number>, field: MeshGeometryField): void {
  for (let index = 0; index < values.length; index += 1) {
    if (!Number.isFinite(values[index])) {
      throw new MeshGeometryValidationError(field, `${field} must contain only finite values.`);
    }
  }
}

function validateArrayTypes(input: MeshGeometryInput): void {
  validateArrayType(input.positions, 'positions', Float32Array);
  validateArrayType(input.normals, 'normals', Float32Array);
  validateArrayType(input.uvs, 'uvs', Float32Array);
  validateArrayType(input.colors, 'colors', Float32Array);
  validateArrayType(input.indices, 'indices', Uint32Array);
}

function requirePositions(input: MeshGeometryInput): Float32Array | null {
  if (
    input.positions === null &&
    [input.normals, input.uvs, input.colors, input.indices].some(value => value !== null)
  ) {
    throw new MeshGeometryValidationError('geometry', 'Optional mesh arrays require positions.');
  }
  return input.positions;
}

function validatePositions(positions: Float32Array, indexed: boolean): number {
  if (positions.length === 0) {
    throw new MeshGeometryValidationError('positions', 'Positions must not be empty.');
  }
  if (positions.length === 0) {
    throw new MeshGeometryValidationError('positions', 'Positions must contain at least one triangle.');
  }
  if (positions.length % 3 !== 0) {
    throw new MeshGeometryValidationError('positions', 'Positions must contain xyz triples.');
  }
  assertFinite(positions, 'positions');
  const vertexCount = positions.length / 3;
  if (!indexed && vertexCount % 3 !== 0) {
    throw new MeshGeometryValidationError('positions', 'Nonindexed positions must contain triangle triples.');
  }
  return vertexCount;
}

function validateNormals(normals: Float32Array | null, positions: Float32Array): void {
  if (normals === null) return;
  if (normals.length !== positions.length) {
    throw new MeshGeometryValidationError('normals', 'Normals must have three values per position.');
  }
  assertFinite(normals, 'normals');
}

function validateUvs(uvs: Float32Array | null, vertexCount: number): void {
  if (uvs === null) return;
  if (uvs.length !== vertexCount * 2) {
    throw new MeshGeometryValidationError('uvs', 'UVs must have two values per position.');
  }
  assertFinite(uvs, 'uvs');
}

function validateColors(colors: Float32Array | null, vertexCount: number): void {
  if (colors === null) return;
  if (colors.length !== vertexCount * 4) {
    throw new MeshGeometryValidationError('colors', 'Colors must have four values per position.');
  }
  assertFinite(colors, 'colors');
  if (Array.from(colors).some(value => value < 0 || value > 1)) {
    throw new MeshGeometryValidationError('colors', 'Colors must be in the range 0..1.');
  }
}

function validateIndices(indices: Uint32Array | null, vertexCount: number): void {
  if (indices === null) return;
  if (indices.length % 3 !== 0) {
    throw new MeshGeometryValidationError('indices', 'Indices must contain triangle triples.');
  }
  if (Array.from(indices).some(index => index >= vertexCount)) {
    throw new MeshGeometryValidationError('indices', 'Every index must identify a position vertex.');
  }
}
