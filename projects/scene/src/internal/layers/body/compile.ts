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

import { MAX_GEOMETRY_BYTES as MAX_COMPILED_BYTES } from './limits.js';

/** One unit primitive and its body-local transform and vertex tint. */
export interface BodyShape {
  readonly color?: SceneColor;
  readonly orientation?: Readonly<Quaternion>;
  readonly position?: Readonly<Vec3>;
  readonly scale?: Readonly<Vec3>;
  readonly kind: ScenePrimitiveKind;
}

/** The unit shapes that may compose a scene body. */
type BodyPrimitive = ScenePrimitiveKind;
type BodyPrimitiveGeometry = PrimitiveGeometry;

/** Checked body input shared by direct, bulk, and declarative compilation. */
export interface NormalizedBodyShape {
  readonly color: Readonly<RGBA>;
  readonly position: Readonly<Vec3>;
  readonly orientation: Readonly<Quaternion>;
  readonly scale: Readonly<Vec3>;
  readonly kind: BodyShape['kind'];
}

const MAX_UINT32 = 0xffff_ffff;
const MIN_SHAPE_BYTES = 24 * (3 + 3 + 4) * Float32Array.BYTES_PER_ELEMENT + 36 * Uint32Array.BYTES_PER_ELEMENT;
const MAX_SHAPE_COUNT = Math.floor(MAX_COMPILED_BYTES / MIN_SHAPE_BYTES);
const DEFAULT_COLOR = [1, 1, 1, 1] as const;
const DEFAULT_POSITION = [0, 0, 0] as const;
const DEFAULT_ORIENTATION = [0, 0, 0, 1] as const;
const DEFAULT_SCALE = [1, 1, 1] as const;
// Only the compiler reads these lazy templates; compiled arrays have separate ownership.
const primitiveGeometries = new Map<BodyPrimitive, BodyPrimitiveGeometry>();

/**
 * Returns the exact unit tessellation used by the corresponding marker layer.
 * The geometry stores interleaved xyz position and xyz normal vertex data.
 */
export function createBodyPrimitiveGeometry(kind: BodyPrimitive): BodyPrimitiveGeometry {
  return createPrimitiveGeometry(kind);
}

function getBodyPrimitiveGeometry(kind: BodyPrimitive): BodyPrimitiveGeometry {
  let geometry = primitiveGeometries.get(kind);
  if (!geometry) {
    geometry = createBodyPrimitiveGeometry(kind);
    primitiveGeometries.set(kind, geometry);
  }
  return geometry;
}

/**
 * Compiles transformed, vertex-colored unit primitives into one indexed mesh.
 * The result is compatible with a scene mesh geometry snapshot.
 */
export function compileShapes(shapes: readonly BodyShape[]): {
  positions: Float32Array;
  normals: Float32Array;
  colors: Float32Array;
  indices: Uint32Array;
} {
  return compileNormalizedShapes(normalizeBodyShapes(shapes));
}

/** Validates raw producer input once, before geometry preparation or state publication. */
function normalizeBodyShapes(shapes: readonly BodyShape[]): NormalizedBodyShape[] {
  if (!Array.isArray(shapes)) throw new TypeError('shapes must be an array.');
  if (shapes.length > MAX_SHAPE_COUNT) throw new RangeError('body shapes exceed the compiled allocation limit.');
  return Array.from(shapes, (shape, index) => normalizeBodyShape(shape, `shapes[${index}]`));
}

/** Compiles already-normalized shapes without revisiting producer values. */
export function compileNormalizedShapes(shapes: readonly NormalizedBodyShape[]): ReturnType<typeof compileShapes> {
  if (shapes.length > MAX_SHAPE_COUNT) throw new RangeError('body shapes exceed the compiled allocation limit.');
  const assembly = new MeshAssembly(Array.from(shapes, prepareShape));
  validateAllocation(assembly);
  return assembly.assemble();
}

function prepareShape(shape: NormalizedBodyShape): MeshAssemblyPart {
  const source = getBodyPrimitiveGeometry(shape.kind);
  return {
    positions: { values: source.vertices, offset: 0, stride: 6 },
    normals: { values: source.vertices, offset: 3, stride: 6 },
    colors: { values: shape.color, offset: 0, stride: 0 },
    indices: source.indices,
    vertexCount: source.vertices.length / 6,
    matrix: composePreciseMat4(shape.position, shape.orientation, shape.scale)
  };
}

export function normalizeBodyShape(shape: unknown, path: string): NormalizedBodyShape {
  if (!isBodyShapeObject(shape)) {
    throw new TypeError(`${path} must be an object.`);
  }
  if (!isBodyPrimitive(shape.kind)) throw new TypeError(`${path}.kind must name a supported primitive.`);
  const position = checkVec3(shape.position ?? DEFAULT_POSITION, `${path}.position`);
  const orientation = normalizeQuaternion(
    checkQuaternion(shape.orientation ?? DEFAULT_ORIENTATION, `${path}.orientation`)
  );
  const scale = checkScale(shape.scale ?? DEFAULT_SCALE, `${path}.scale`);
  const color = checkColor(shape.color ?? DEFAULT_COLOR, `${path}.color`);
  return { color, position, orientation, scale, kind: shape.kind };
}

function isBodyShapeObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isBodyPrimitive(value: unknown): value is BodyShape['kind'] {
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
    throw new RangeError('body shapes exceed the indexed-geometry limit.');
  }
  if (!Number.isSafeInteger(allocation.byteLength) || allocation.byteLength > MAX_COMPILED_BYTES) {
    throw new RangeError('body shapes exceed the compiled allocation limit.');
  }
}
