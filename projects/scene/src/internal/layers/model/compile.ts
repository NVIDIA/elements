// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { normalizeQuaternion } from '../../math/quaternion.js';
import { composePreciseMat4 } from '../../math/mat4.js';
import { MeshAssembly, type MeshAssemblyPart } from '../../math/mesh-assembly.js';
import { resolveSceneColor } from '../../color/color.js';
import type { SceneColor, RGBA } from '../../color/types.js';
import {
  createPrimitiveGeometry,
  type PrimitiveGeometry,
  type ScenePrimitiveKind
} from '../../math/primitive-geometry.js';
import type { Quaternion, Vec3 } from '../../math/types.js';

import { MAX_MODEL_BYTES as MAX_COMPILED_BYTES } from './limits.js';

/** One unit primitive and its model-local transform and vertex tint. */
export interface ModelPart {
  readonly color?: SceneColor;
  readonly orientation?: Readonly<Quaternion>;
  readonly position?: Readonly<Vec3>;
  readonly scale?: Readonly<Vec3>;
  readonly shape: ScenePrimitiveKind;
}

/** The unit shapes that may compose a scene model. */
type ModelPrimitive = ScenePrimitiveKind;
type ModelPrimitiveGeometry = PrimitiveGeometry;

/** Checked model input shared by direct, bulk, and declarative compilation. */
export interface NormalizedModelPart {
  readonly color: Readonly<RGBA>;
  readonly position: Readonly<Vec3>;
  readonly orientation: Readonly<Quaternion>;
  readonly scale: Readonly<Vec3>;
  readonly shape: ModelPart['shape'];
}

const MAX_UINT32 = 0xffff_ffff;
const MIN_PART_BYTES = 24 * (3 + 3 + 4) * Float32Array.BYTES_PER_ELEMENT + 36 * Uint32Array.BYTES_PER_ELEMENT;
const MAX_PART_COUNT = Math.floor(MAX_COMPILED_BYTES / MIN_PART_BYTES);
const DEFAULT_COLOR = [1, 1, 1, 1] as const;
const DEFAULT_POSITION = [0, 0, 0] as const;
const DEFAULT_ORIENTATION = [0, 0, 0, 1] as const;
const DEFAULT_SCALE = [1, 1, 1] as const;
// Only the compiler reads these lazy templates; compiled arrays have separate ownership.
const primitiveGeometries = new Map<ModelPrimitive, ModelPrimitiveGeometry>();

/**
 * Returns the exact unit tessellation used by the corresponding marker layer.
 * The geometry stores interleaved xyz position and xyz normal vertex data.
 */
export function createModelPrimitiveGeometry(shape: ModelPrimitive): ModelPrimitiveGeometry {
  return createPrimitiveGeometry(shape);
}

function getModelPrimitiveGeometry(shape: ModelPrimitive): ModelPrimitiveGeometry {
  let geometry = primitiveGeometries.get(shape);
  if (!geometry) {
    geometry = createModelPrimitiveGeometry(shape);
    primitiveGeometries.set(shape, geometry);
  }
  return geometry;
}

/**
 * Compiles transformed, vertex-colored unit primitives into one indexed mesh.
 * The result is compatible with a scene mesh geometry snapshot.
 */
export function compileParts(parts: readonly ModelPart[]): {
  positions: Float32Array;
  normals: Float32Array;
  colors: Float32Array;
  indices: Uint32Array;
} {
  return compileNormalizedParts(normalizeModelParts(parts));
}

/** Validates raw producer input once, before geometry preparation or state publication. */
function normalizeModelParts(parts: readonly ModelPart[]): NormalizedModelPart[] {
  if (!Array.isArray(parts)) throw new TypeError('parts must be an array.');
  if (parts.length > MAX_PART_COUNT) throw new RangeError('Model parts exceed the compiled allocation limit.');
  return Array.from(parts, (part, index) => normalizeModelPart(part, `parts[${index}]`));
}

/** Compiles already-normalized parts without revisiting producer values. */
export function compileNormalizedParts(parts: readonly NormalizedModelPart[]): ReturnType<typeof compileParts> {
  if (parts.length > MAX_PART_COUNT) throw new RangeError('Model parts exceed the compiled allocation limit.');
  const assembly = new MeshAssembly(Array.from(parts, preparePart));
  validateAllocation(assembly);
  return assembly.assemble();
}

function preparePart(part: NormalizedModelPart): MeshAssemblyPart {
  const source = getModelPrimitiveGeometry(part.shape);
  return {
    positions: { values: source.vertices, offset: 0, stride: 6 },
    normals: { values: source.vertices, offset: 3, stride: 6 },
    colors: { values: part.color, offset: 0, stride: 0 },
    indices: source.indices,
    vertexCount: source.vertices.length / 6,
    matrix: composePreciseMat4(part.position, part.orientation, part.scale)
  };
}

export function normalizeModelPart(part: unknown, path: string): NormalizedModelPart {
  if (!isModelPartObject(part)) {
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

function isModelPartObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
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
  try {
    return resolveSceneColor(value as SceneColor);
  } catch (error) {
    if (error instanceof TypeError) throw new TypeError(`${name} must be a supported Scene color.`, { cause: error });
    throw new RangeError(`${name} values must be finite and in the range 0..1.`, { cause: error });
  }
}

function validateAllocation(allocation: MeshAssembly): void {
  if (
    !Number.isSafeInteger(allocation.vertexCount) ||
    !Number.isSafeInteger(allocation.indexCount) ||
    allocation.vertexCount > MAX_UINT32
  ) {
    throw new RangeError('Model parts exceed the indexed-geometry limit.');
  }
  if (!Number.isSafeInteger(allocation.byteLength) || allocation.byteLength > MAX_COMPILED_BYTES) {
    throw new RangeError('Model parts exceed the compiled allocation limit.');
  }
}
