// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { normalizeQuaternion } from '../math/quaternion.js';
import { createUnitPrimitiveGeometry, type PrimitiveGeometry, type UnitPrimitiveKind } from '../primitive-geometry.js';
import type { Quaternion, RGBA, Vec3 } from '../types.js';

/** One unit primitive and its model-local transform and vertex tint. */
export interface ModelPart {
  shape: 'cube' | 'sphere' | 'cylinder' | 'cone' | 'pyramid';
  position?: Vec3;
  orientation?: Quaternion;
  scale?: Vec3;
  color?: RGBA;
}

/** The unit shapes that may compose a scene model. */
type ModelPrimitive = UnitPrimitiveKind;
type ModelPrimitiveGeometry = PrimitiveGeometry;

interface CheckedPart {
  readonly color: Readonly<RGBA>;
  readonly position: Readonly<Vec3>;
  readonly orientation: Readonly<Quaternion>;
  readonly scale: Readonly<Vec3>;
  readonly shape: ModelPart['shape'];
}

interface PreparedPart extends CheckedPart {
  readonly source: ReturnType<typeof createModelPrimitiveGeometry>;
}

const MAX_COMPILED_BYTES = 256 * 1024 * 1024;
const MAX_UINT32 = 0xffff_ffff;
const MIN_PART_BYTES = 24 * (3 + 3 + 4) * Float32Array.BYTES_PER_ELEMENT + 36 * Uint32Array.BYTES_PER_ELEMENT;
const MAX_PART_COUNT = Math.floor(MAX_COMPILED_BYTES / MIN_PART_BYTES);
const DEFAULT_COLOR = [1, 1, 1, 1] as const;
const DEFAULT_POSITION = [0, 0, 0] as const;
const DEFAULT_ORIENTATION = [0, 0, 0, 1] as const;
const DEFAULT_SCALE = [1, 1, 1] as const;

/**
 * Returns the exact unit tessellation used by the corresponding marker layer.
 * The geometry stores interleaved xyz position and xyz normal vertex data.
 */
export function createModelPrimitiveGeometry(shape: ModelPrimitive): ModelPrimitiveGeometry {
  return createUnitPrimitiveGeometry(shape);
}

/**
 * Compiles transformed, vertex-colored unit primitives into one indexed mesh.
 * The result feeds a scene mesh's planar properties directly.
 */
export function compileParts(parts: ModelPart[]): {
  positions: Float32Array;
  normals: Float32Array;
  colors: Float32Array;
  indices: Uint32Array;
} {
  if (!Array.isArray(parts)) throw new TypeError('parts must be an array.');
  if (parts.length > MAX_PART_COUNT) throw new RangeError('Model parts exceed the compiled allocation limit.');
  const allocation = { indexCount: 0, vertexCount: 0 };
  const prepared = Array.from(parts, (part, index) => preparePart(part, `parts[${index}]`, allocation));
  validateAllocation(allocation);
  return compilePreparedParts(prepared, allocation);
}

/** Check one model part without compiling geometry. */
export function validateModelPart(part: ModelPart, path = 'part'): void {
  checkPart(part, path);
}

function compilePreparedParts(
  parts: readonly PreparedPart[],
  allocation: { readonly indexCount: number; readonly vertexCount: number }
): ReturnType<typeof compileParts> {
  const positions = new Float32Array(allocation.vertexCount * 3);
  const normals = new Float32Array(allocation.vertexCount * 3);
  const colors = new Float32Array(allocation.vertexCount * 4);
  const indices = new Uint32Array(allocation.indexCount);
  let vertexOffset = 0;
  let indexOffset = 0;
  for (const part of parts) {
    writePart({ colors, indices, normals, part, positions, source: part.source, vertexOffset, indexOffset });
    vertexOffset += part.source.vertices.length / 6;
    indexOffset += part.source.indices.length;
  }
  return { positions, normals, colors, indices };
}

function preparePart(
  part: ModelPart,
  path: string,
  allocation: { indexCount: number; vertexCount: number }
): PreparedPart {
  const checked = checkPart(part, path);
  const source = createModelPrimitiveGeometry(checked.shape);
  allocation.vertexCount += source.vertices.length / 6;
  allocation.indexCount += source.indices.length;
  if (
    !Number.isSafeInteger(allocation.vertexCount) ||
    !Number.isSafeInteger(allocation.indexCount) ||
    allocation.vertexCount > MAX_UINT32
  ) {
    throw new RangeError('Model parts exceed the indexed-geometry limit.');
  }
  return { ...checked, source };
}

function checkPart(part: ModelPart, path: string): CheckedPart {
  if (part === null || typeof part !== 'object' || Array.isArray(part)) {
    throw new TypeError(`${path} must be an object.`);
  }
  if (!isModelPrimitive(part.shape)) throw new TypeError(`${path}.shape must name a supported primitive.`);
  const position = checkVec3(part.position ?? DEFAULT_POSITION, `${path}.position`);
  const orientation = normalizeQuaternion(
    checkQuaternion(part.orientation ?? DEFAULT_ORIENTATION, `${path}.orientation`)
  );
  const scale = checkScale(part.scale ?? DEFAULT_SCALE, `${path}.scale`);
  const color = checkColor(part.color ?? DEFAULT_COLOR, `${path}.color`);
  return { color, position, orientation, scale, shape: part.shape };
}

function isModelPrimitive(value: unknown): value is ModelPart['shape'] {
  return value === 'cube' || value === 'sphere' || value === 'cylinder' || value === 'cone' || value === 'pyramid';
}

function checkVec3(value: unknown, name: string): Readonly<Vec3> {
  checkVector(value, 3, name);
  return value as Vec3;
}

function checkQuaternion(value: unknown, name: string): Readonly<Quaternion> {
  checkVector(value, 4, name);
  return value as Quaternion;
}

function checkVector(value: unknown, length: number, name: string): asserts value is readonly number[] {
  if (!Array.isArray(value) || value.length !== length || value.some(component => typeof component !== 'number')) {
    throw new TypeError(`${name} must contain exactly ${length} numbers.`);
  }
  if (value.some(component => !Number.isFinite(component)))
    throw new RangeError(`${name} must contain finite numbers.`);
}

function checkScale(value: unknown, name: string): Readonly<Vec3> {
  const scale = checkVec3(value, name);
  if (scale.some(component => component === 0)) throw new RangeError(`${name} must not contain zero.`);
  return scale;
}

function checkColor(value: unknown, name: string): Readonly<RGBA> {
  checkVector(value, 4, name);
  const color = value as RGBA;
  if (color.some(component => component < 0 || component > 1))
    throw new RangeError(`${name} values must be in the range 0..1.`);
  return color;
}

function validateAllocation(allocation: { readonly indexCount: number; readonly vertexCount: number }): void {
  const bytes =
    allocation.vertexCount * (3 + 3 + 4) * Float32Array.BYTES_PER_ELEMENT +
    allocation.indexCount * Uint32Array.BYTES_PER_ELEMENT;
  if (!Number.isSafeInteger(bytes) || bytes > MAX_COMPILED_BYTES) {
    throw new RangeError('Model parts exceed the compiled allocation limit.');
  }
}

function writePart(options: {
  readonly colors: Float32Array;
  readonly indexOffset: number;
  readonly indices: Uint32Array;
  readonly normals: Float32Array;
  readonly part: CheckedPart;
  readonly positions: Float32Array;
  readonly source: ReturnType<typeof createModelPrimitiveGeometry>;
  readonly vertexOffset: number;
}): void {
  const { colors, indexOffset, indices, normals, part, positions, source, vertexOffset } = options;
  for (
    let sourceOffset = 0, vertex = vertexOffset;
    sourceOffset < source.vertices.length;
    sourceOffset += 6, vertex += 1
  ) {
    const position = transformPosition(
      [source.vertices[sourceOffset]!, source.vertices[sourceOffset + 1]!, source.vertices[sourceOffset + 2]!],
      part
    );
    positions.set(position, vertex * 3);
    normals.set(
      transformNormal(
        [source.vertices[sourceOffset + 3]!, source.vertices[sourceOffset + 4]!, source.vertices[sourceOffset + 5]!],
        part
      ),
      vertex * 3
    );
    colors.set(part.color, vertex * 4);
  }
  const mirrored = part.scale[0] * part.scale[1] * part.scale[2] < 0;
  for (let index = 0; index < source.indices.length; index += 3) {
    const first = source.indices[index]! + vertexOffset;
    const second = source.indices[index + 1]! + vertexOffset;
    const third = source.indices[index + 2]! + vertexOffset;
    indices.set(mirrored ? [first, third, second] : [first, second, third], indexOffset + index);
  }
}

function transformPosition(point: Readonly<Vec3>, part: CheckedPart): Vec3 {
  const [x, y, z] = point;
  const [sx, sy, sz] = part.scale;
  const rotated = rotate([x * sx, y * sy, z * sz], part.orientation);
  return [rotated[0] + part.position[0], rotated[1] + part.position[1], rotated[2] + part.position[2]];
}

function transformNormal(normal: Readonly<Vec3>, part: CheckedPart): Vec3 {
  const [x, y, z] = normal;
  const [sx, sy, sz] = part.scale;
  const rotated = rotate([x / sx, y / sy, z / sz], part.orientation);
  const length = Math.hypot(...rotated);
  return [rotated[0] / length, rotated[1] / length, rotated[2] / length];
}

function rotate(vector: Readonly<Vec3>, quaternion: Readonly<Quaternion>): Vec3 {
  const [x, y, z] = vector;
  const [qx, qy, qz, qw] = quaternion;
  const tx = 2 * (qy * z - qz * y);
  const ty = 2 * (qz * x - qx * z);
  const tz = 2 * (qx * y - qy * x);
  return [x + qw * tx + qy * tz - qz * ty, y + qw * ty + qz * tx - qx * tz, z + qw * tz + qx * ty - qy * tx];
}
