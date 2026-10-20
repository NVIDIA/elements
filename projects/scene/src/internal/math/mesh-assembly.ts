// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { PreparedAffineGeometryTransform } from './affine-transform.js';
import type { Matrix4 } from './types.js';
import type { PreparedRGBAModulation } from '../color/modulation.js';

/** Attribute offsets and strides count numeric elements; a zero stride broadcasts one value. */
export interface MeshAttributeSpan {
  readonly values: ArrayLike<number>;
  readonly offset: number;
  readonly stride: number;
}

/** Checked vertex attributes and triangle indices borrowed for one assembly. */
export interface MeshAssemblyPart {
  readonly vertexCount: number;
  readonly positions: MeshAttributeSpan;
  readonly normals: MeshAttributeSpan;
  readonly colors: MeshAttributeSpan;
  readonly uvs?: MeshAttributeSpan;
  readonly indices: Uint32Array | null;
  readonly matrix: Matrix4;
  readonly modulation?: PreparedRGBAModulation;
}

interface AssembledMesh {
  readonly positions: Float32Array;
  readonly normals: Float32Array;
  readonly colors: Float32Array;
  readonly indices: Uint32Array;
  readonly uvs?: Float32Array;
}

interface MeshAssemblyWrite {
  readonly part: MeshAssemblyPart;
  readonly target: AssembledMesh;
  readonly transform: PreparedAffineGeometryTransform;
  readonly vertexOffset: number;
  readonly indexOffset: number;
  readonly onPositionOverflow?: () => never;
}

/**
 * Plans an indexed mesh without allocating output arrays, then assembles independent planar storage.
 * Callers check byteLength against their resource budget before calling assemble. They validate
 * source values and index bounds, and keep borrowed parts, spans, and matrices unchanged between calls.
 * Assembly transforms positions and inverse-transpose normals, rebases indices, and reverses mirrored
 * triangles. Work and output storage are linear in vertex and index counts, with no per-vertex allocations.
 */
export class MeshAssembly {
  readonly vertexCount: number;
  readonly indexCount: number;
  readonly byteLength: number;
  readonly #parts: readonly MeshAssemblyPart[];
  readonly #includeUvs: boolean;

  constructor(parts: readonly MeshAssemblyPart[], options: { readonly includeUvs?: boolean } = {}) {
    this.#parts = parts;
    this.#includeUvs = options.includeUvs ?? false;
    let vertexCount = 0;
    let indexCount = 0;
    for (const part of parts) {
      validatePart(part);
      vertexCount += part.vertexCount;
      indexCount += part.indices?.length ?? part.vertexCount;
    }
    this.vertexCount = vertexCount;
    this.indexCount = indexCount;
    this.byteLength = (vertexCount * (this.#includeUvs ? 12 : 10) + indexCount) * Float32Array.BYTES_PER_ELEMENT;
  }

  /**
   * Creates fresh output arrays. Missing UV spans leave zero coordinates when includeUvs is true.
   * The optional overflow callback supplies the caller's error policy for nonfinite stored positions.
   * Without it, positions follow Float32 conversion. Matrices must support finite inverse-transpose normals.
   */
  assemble(options: { readonly onPositionOverflow?: () => never } = {}): AssembledMesh {
    this.#validateAllocation();
    const target = this.#allocate();
    let vertexOffset = 0;
    let indexOffset = 0;
    for (const part of this.#parts) {
      const write = {
        part,
        target,
        transform: new PreparedAffineGeometryTransform(part.matrix),
        vertexOffset,
        indexOffset,
        onPositionOverflow: options.onPositionOverflow
      };
      writeVectors(write);
      writeColors(write);
      writeIndices(write);
      if (target.uvs && part.uvs) {
        copyAttribute(target.uvs, part.uvs, { count: part.vertexCount, width: 2, offset: vertexOffset * 2 });
      }
      vertexOffset += part.vertexCount;
      indexOffset += part.indices?.length ?? part.vertexCount;
    }
    return target;
  }

  #validateAllocation(): void {
    if (
      ![this.vertexCount, this.indexCount, this.byteLength].every(Number.isSafeInteger) ||
      this.vertexCount > 0xffff_ffff
    ) {
      throw new RangeError('Mesh assembly counts exceed the indexed allocation limit.');
    }
  }

  #allocate(): AssembledMesh {
    return {
      positions: new Float32Array(this.vertexCount * 3),
      normals: new Float32Array(this.vertexCount * 3),
      colors: new Float32Array(this.vertexCount * 4),
      indices: new Uint32Array(this.indexCount),
      ...(this.#includeUvs ? { uvs: new Float32Array(this.vertexCount * 2) } : {})
    };
  }
}

function validatePart(part: MeshAssemblyPart): void {
  if (!Number.isSafeInteger(part.vertexCount) || part.vertexCount < 0) {
    throw new RangeError('Mesh assembly vertex counts must be nonnegative safe integers.');
  }
  if ((part.indices?.length ?? part.vertexCount) % 3 !== 0) {
    throw new RangeError('Mesh assembly requires complete triangle triples.');
  }
  validateSpan(part.positions, 3, part.vertexCount);
  validateSpan(part.normals, 3, part.vertexCount);
  validateSpan(part.colors, 4, part.vertexCount);
  if (part.uvs) validateSpan(part.uvs, 2, part.vertexCount);
}

function validateSpan(span: MeshAttributeSpan, width: number, count: number): void {
  if (
    !Number.isSafeInteger(span.offset) ||
    span.offset < 0 ||
    !Number.isSafeInteger(span.stride) ||
    (span.stride !== 0 && span.stride < width)
  ) {
    throw new RangeError('Mesh attribute spans require a nonnegative offset and a zero or complete-record stride.');
  }
  const end = count === 0 ? span.offset : span.offset + (count - 1) * span.stride + width;
  if (!Number.isSafeInteger(end) || end > span.values.length) {
    throw new RangeError('Mesh attribute span exceeds its source storage.');
  }
}

function writeVectors(write: MeshAssemblyWrite): void {
  const { part, target, transform, vertexOffset, onPositionOverflow } = write;
  const { positions, normals } = part;
  for (let vertex = 0; vertex < part.vertexCount; vertex += 1) {
    const offset = (vertexOffset + vertex) * 3;
    transform.writePosition(positions.values, positions.offset + vertex * positions.stride, target.positions, offset);
    if (
      onPositionOverflow &&
      (!Number.isFinite(target.positions[offset]) ||
        !Number.isFinite(target.positions[offset + 1]) ||
        !Number.isFinite(target.positions[offset + 2]))
    ) {
      onPositionOverflow();
    }
    transform.writeNormal(normals.values, normals.offset + vertex * normals.stride, target.normals, offset);
  }
}

function writeColors({ part, target, vertexOffset }: MeshAssemblyWrite): void {
  const { colors, modulation } = part;
  if (!modulation) {
    copyAttribute(target.colors, colors, { count: part.vertexCount, width: 4, offset: vertexOffset * 4 });
    return;
  }
  for (let vertex = 0; vertex < part.vertexCount; vertex += 1) {
    modulation.writeColor(
      colors.values,
      colors.offset + vertex * colors.stride,
      target.colors,
      (vertexOffset + vertex) * 4
    );
  }
}

function copyAttribute(
  target: Float32Array,
  source: MeshAttributeSpan,
  options: { readonly count: number; readonly width: number; readonly offset: number }
): void {
  const { count, width, offset } = options;
  for (let vertex = 0; vertex < count; vertex += 1) {
    for (let component = 0; component < width; component += 1) {
      target[offset + vertex * width + component] = source.values[source.offset + vertex * source.stride + component]!;
    }
  }
}

function writeIndices({ part, target, transform, vertexOffset, indexOffset }: MeshAssemblyWrite): void {
  const indices = part.indices;
  const second = transform.mirrored ? 2 : 1;
  const third = transform.mirrored ? 1 : 2;
  if (indices) {
    for (let index = 0; index < indices.length; index += 3) {
      target.indices[indexOffset + index] = vertexOffset + indices[index]!;
      target.indices[indexOffset + index + 1] = vertexOffset + indices[index + second]!;
      target.indices[indexOffset + index + 2] = vertexOffset + indices[index + third]!;
    }
  } else {
    for (let index = 0; index < part.vertexCount; index += 3) {
      target.indices[indexOffset + index] = vertexOffset + index;
      target.indices[indexOffset + index + 1] = vertexOffset + index + second;
      target.indices[indexOffset + index + 2] = vertexOffset + index + third;
    }
  }
}
