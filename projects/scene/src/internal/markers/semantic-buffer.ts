// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  MutableVector3View,
  PackedRecordBuffer,
  assertFinite,
  readPackedColor,
  resolveSceneColor,
  writePackedColor,
  type MutableQuaternion,
  type MutableVector3,
  type RecordBufferOptions,
  type SceneColor
} from '../packed-record-buffer.js';
import { getSceneFeatureId, setSceneFeatureId } from '../feature-ids.js';
import { MARKER } from '../layouts/built-ins.js';
import { getFieldOffset } from '../layouts/define-layout.js';
import { writeMarker } from '../layouts/helpers.js';
import { normalizeQuaternion } from '../math/quaternion.js';
import type { ExternalMarkerSource } from '../packed-record-source.js';
import type { Quaternion, RGBA, Vec3 } from '../types.js';
import { registerSemanticMarkerSource, type SemanticMarkerKind } from './semantic-brand.js';

const POSITION_OFFSET = getFieldOffset(MARKER, 'position');
const ORIENTATION_OFFSET = getFieldOffset(MARKER, 'orientation');
const SCALE_OFFSET = getFieldOffset(MARKER, 'scale');
const COLOR_OFFSET = getFieldOffset(MARKER, 'color');
const OUTLINE_COLOR_OFFSET = getFieldOffset(MARKER, 'outline-color');

interface CenteredPrimitiveInit {
  readonly color?: SceneColor;
  readonly featureId?: number;
  readonly orientation?: Readonly<Quaternion>;
  readonly position?: Readonly<Vec3>;
  readonly size?: Readonly<Vec3>;
}

interface CenteredPrimitive {
  readonly index: number;
  readonly orientation: MutableQuaternion;
  readonly position: MutableVector3;
  readonly size: MutableVector3;
  get color(): RGBA;
  set color(value: SceneColor);
  get featureId(): number | undefined;
  set featureId(value: number | undefined);
}

export interface CubeInit extends CenteredPrimitiveInit {
  readonly outlineColor?: SceneColor;
}

export interface Cube extends CenteredPrimitive {
  get outlineColor(): RGBA;
  set outlineColor(value: SceneColor);
}

export interface ArrowInit {
  readonly color?: SceneColor;
  readonly featureId?: number;
  readonly origin?: Readonly<Vec3>;
  readonly shaftDiameter?: number;
  readonly vector?: Readonly<Vec3>;
}

export interface Arrow {
  readonly index: number;
  readonly origin: MutableVector3;
  readonly vector: MutableVector3;
  get shaftDiameter(): number;
  set shaftDiameter(value: number);
  get color(): RGBA;
  set color(value: SceneColor);
  get featureId(): number | undefined;
  set featureId(value: number | undefined);
}

export type ArrowSource = ArrowBuffer | ExternalMarkerSource;
export type ConeSource = ConeBuffer | ExternalMarkerSource;
export type CubeSource = CubeBuffer | ExternalMarkerSource;
export type CylinderSource = CylinderBuffer | ExternalMarkerSource;
export type PyramidSource = PyramidBuffer | ExternalMarkerSource;
export type SphereSource = SphereBuffer | ExternalMarkerSource;

export type ConeInit = CenteredPrimitiveInit;
export type Cone = CenteredPrimitive;
export type CylinderInit = CenteredPrimitiveInit;
export type Cylinder = CenteredPrimitive;
export type PyramidInit = CenteredPrimitiveInit;
export type Pyramid = CenteredPrimitive;
export type SphereInit = CenteredPrimitiveInit;
export type Sphere = CenteredPrimitive;

abstract class CenteredPrimitiveBuffer<
  Init extends CenteredPrimitiveInit,
  Record extends CenteredPrimitive
> extends PackedRecordBuffer<'marker', Init, Record> {
  protected constructor(
    options: RecordBufferOptions<Init>,
    config: {
      readonly createHandle: (options: MarkerRecordOptions) => Record;
      readonly kind: Exclude<SemanticMarkerKind, 'arrow' | 'marker'>;
      readonly write?: (bytes: Uint8Array, index: number, init: Init) => void;
    }
  ) {
    super({
      buffer: options,
      createHandle: config.createHandle,
      defaultInit: () => ({}) as Init,
      initialize: initializeMarkerRecords,
      kind: 'marker',
      readFeatureId: init => init.featureId,
      stride: MARKER.stride,
      writeRecord: config.write ?? writeCenteredRecord
    });
    registerSemanticMarkerSource(this, config.kind);
  }
}

/** Fixed-capacity semantic arrow records packed into the marker layout. */
export class ArrowBuffer extends PackedRecordBuffer<'marker', ArrowInit, Arrow> {
  constructor(options: RecordBufferOptions<ArrowInit>) {
    super({
      buffer: options,
      createHandle: handleOptions => new ArrowRecord(handleOptions),
      defaultInit: () => ({}),
      initialize: initializeMarkerRecords,
      kind: 'marker',
      readFeatureId: init => init.featureId,
      stride: MARKER.stride,
      writeRecord: writeArrowRecord
    });
    registerSemanticMarkerSource(this, 'arrow');
  }
}

/** Fixed-capacity semantic cube records packed into the marker layout. */
export class CubeBuffer extends CenteredPrimitiveBuffer<CubeInit, Cube> {
  constructor(options: RecordBufferOptions<CubeInit>) {
    super(options, {
      createHandle: handleOptions => new CubeRecord(handleOptions),
      kind: 'cube',
      write: writeCubeRecord
    });
  }
}

/** Fixed-capacity semantic cone records packed into the marker layout. */
export class ConeBuffer extends CenteredPrimitiveBuffer<ConeInit, Cone> {
  constructor(options: RecordBufferOptions<ConeInit>) {
    super(options, { createHandle: handleOptions => new CenteredRecord(handleOptions), kind: 'cone' });
  }
}

/** Fixed-capacity semantic cylinder records packed into the marker layout. */
export class CylinderBuffer extends CenteredPrimitiveBuffer<CylinderInit, Cylinder> {
  constructor(options: RecordBufferOptions<CylinderInit>) {
    super(options, { createHandle: handleOptions => new CenteredRecord(handleOptions), kind: 'cylinder' });
  }
}

/** Fixed-capacity semantic pyramid records packed into the marker layout. */
export class PyramidBuffer extends CenteredPrimitiveBuffer<PyramidInit, Pyramid> {
  constructor(options: RecordBufferOptions<PyramidInit>) {
    super(options, { createHandle: handleOptions => new CenteredRecord(handleOptions), kind: 'pyramid' });
  }
}

/** Fixed-capacity semantic sphere records packed into the marker layout. */
export class SphereBuffer extends CenteredPrimitiveBuffer<SphereInit, Sphere> {
  constructor(options: RecordBufferOptions<SphereInit>) {
    super(options, { createHandle: handleOptions => new CenteredRecord(handleOptions), kind: 'sphere' });
  }
}

interface MarkerRecordOptions {
  readonly featureIdSource: object;
  readonly index: number;
  readonly notifyMutation: () => void;
  readonly view: DataView;
}

class CenteredRecord implements CenteredPrimitive {
  readonly index: number;
  readonly orientation: MutableQuaternion;
  readonly position: MutableVector3;
  readonly size: MutableVector3;
  protected readonly notifyMutation: () => void;
  protected readonly recordOffset: number;
  protected readonly view: DataView;
  readonly #featureIdSource: object;

  constructor(options: MarkerRecordOptions) {
    this.index = options.index;
    this.#featureIdSource = options.featureIdSource;
    this.notifyMutation = options.notifyMutation;
    this.view = options.view;
    this.recordOffset = options.index * MARKER.stride;
    this.position = new MutableVector3View(options.view, this.recordOffset + POSITION_OFFSET, {
      notifyMutation: options.notifyMutation
    });
    this.orientation = new QuaternionView(options.view, this.recordOffset + ORIENTATION_OFFSET, options.notifyMutation);
    this.size = new MutableVector3View(options.view, this.recordOffset + SCALE_OFFSET, {
      notifyMutation: options.notifyMutation,
      validate: assertDimensions
    });
  }

  get color(): RGBA {
    return readPackedColor(this.view, this.recordOffset + COLOR_OFFSET);
  }

  set color(value: SceneColor) {
    writePackedColor(this.view, this.recordOffset + COLOR_OFFSET, value);
    this.notifyMutation();
  }

  get featureId(): number | undefined {
    return getSceneFeatureId(this.#featureIdSource, this.index);
  }

  set featureId(value: number | undefined) {
    setSceneFeatureId(this.#featureIdSource, this.index, value);
  }
}

class CubeRecord extends CenteredRecord implements Cube {
  get outlineColor(): RGBA {
    return readPackedColor(this.view, this.recordOffset + OUTLINE_COLOR_OFFSET);
  }

  set outlineColor(value: SceneColor) {
    writePackedColor(this.view, this.recordOffset + OUTLINE_COLOR_OFFSET, value);
    this.notifyMutation();
  }
}

class ArrowRecord implements Arrow {
  readonly index: number;
  readonly origin: MutableVector3;
  readonly vector: MutableVector3;
  readonly #featureIdSource: object;
  readonly #notifyMutation: () => void;
  readonly #recordOffset: number;
  readonly #view: DataView;

  constructor(options: MarkerRecordOptions) {
    this.index = options.index;
    this.#featureIdSource = options.featureIdSource;
    this.#notifyMutation = options.notifyMutation;
    this.#recordOffset = options.index * MARKER.stride;
    this.#view = options.view;
    this.origin = new MutableVector3View(options.view, this.#recordOffset + POSITION_OFFSET, {
      notifyMutation: options.notifyMutation
    });
    this.vector = new ArrowVectorView(options.view, this.#recordOffset, options.notifyMutation);
  }

  get shaftDiameter(): number {
    return this.#view.getFloat32(this.#recordOffset + SCALE_OFFSET, true);
  }

  set shaftDiameter(value: number) {
    assertNonnegative(value, 'Arrow shaft diameter');
    this.#view.setFloat32(this.#recordOffset + SCALE_OFFSET, value, true);
    this.#view.setFloat32(this.#recordOffset + SCALE_OFFSET + 4, value, true);
    this.#notifyMutation();
  }

  get color(): RGBA {
    return readPackedColor(this.#view, this.#recordOffset + COLOR_OFFSET);
  }

  set color(value: SceneColor) {
    writePackedColor(this.#view, this.#recordOffset + COLOR_OFFSET, value);
    this.#notifyMutation();
  }

  get featureId(): number | undefined {
    return getSceneFeatureId(this.#featureIdSource, this.index);
  }

  set featureId(value: number | undefined) {
    setSceneFeatureId(this.#featureIdSource, this.index, value);
  }
}

class QuaternionView implements MutableQuaternion {
  readonly #notifyMutation: () => void;
  readonly #offset: number;
  readonly #view: DataView;

  constructor(view: DataView, offset: number, notifyMutation: () => void) {
    this.#view = view;
    this.#offset = offset;
    this.#notifyMutation = notifyMutation;
  }

  get x(): number {
    return this.#view.getFloat32(this.#offset, true);
  }
  get y(): number {
    return this.#view.getFloat32(this.#offset + 4, true);
  }
  get z(): number {
    return this.#view.getFloat32(this.#offset + 8, true);
  }
  get w(): number {
    return this.#view.getFloat32(this.#offset + 12, true);
  }
  set(...components: Quaternion): this {
    writeQuaternion(this.#view, this.#offset, components);
    this.#notifyMutation();
    return this;
  }
  toArray(): Quaternion {
    return [this.x, this.y, this.z, this.w];
  }
}

class ArrowVectorView implements MutableVector3 {
  readonly #notifyMutation: () => void;
  readonly #recordOffset: number;
  readonly #view: DataView;

  constructor(view: DataView, recordOffset: number, notifyMutation: () => void) {
    this.#view = view;
    this.#recordOffset = recordOffset;
    this.#notifyMutation = notifyMutation;
  }

  get x(): number {
    return this.toArray()[0];
  }
  set x(value: number) {
    const [, y, z] = this.toArray();
    this.set(value, y, z);
  }
  get y(): number {
    return this.toArray()[1];
  }
  set y(value: number) {
    const [x, , z] = this.toArray();
    this.set(x, value, z);
  }
  get z(): number {
    return this.toArray()[2];
  }
  set z(value: number) {
    const [x, y] = this.toArray();
    this.set(x, y, value);
  }
  set(x: number, y: number, z: number): this {
    writeArrowDirection(this.#view, this.#recordOffset, [x, y, z]);
    this.#notifyMutation();
    return this;
  }
  toArray(): Vec3 {
    return readArrowVector(this.#view, this.#recordOffset);
  }
}

function writeCenteredRecord(bytes: Uint8Array, index: number, init: CenteredPrimitiveInit): void {
  assertRecord(init);
  const position = copyVec3(init.position ?? [0, 0, 0]);
  const orientation = normalizeQuaternion(copyQuaternion(init.orientation ?? [0, 0, 0, 1]));
  const size = copyVec3(init.size ?? [1, 1, 1]);
  position.forEach(assertFinite);
  assertDimensions(size);
  writeMarker(bytes, index, {
    color: resolveSceneColor(init.color ?? [1, 1, 1, 1]),
    orientation,
    outlineColor: [0, 0, 0, 0],
    position,
    scale: size
  });
}

function writeCubeRecord(bytes: Uint8Array, index: number, init: CubeInit): void {
  writeCenteredRecord(bytes, index, init);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  writePackedColor(view, index * MARKER.stride + OUTLINE_COLOR_OFFSET, init.outlineColor ?? [0, 0, 0, 0]);
}

function writeArrowRecord(bytes: Uint8Array, index: number, init: ArrowInit): void {
  assertRecord(init);
  const origin = copyVec3(init.origin ?? [0, 0, 0]);
  const vector = copyVec3(init.vector ?? [0, 0, 1]);
  const shaftDiameter = init.shaftDiameter ?? 1;
  origin.forEach(assertFinite);
  vector.forEach(assertFinite);
  assertNonnegative(shaftDiameter, 'Arrow shaft diameter');
  const length = Math.hypot(...vector);
  writeMarker(bytes, index, {
    color: resolveSceneColor(init.color ?? [1, 1, 1, 1]),
    orientation: arrowOrientation(vector, length),
    outlineColor: [0, 0, 0, 0],
    position: origin,
    scale: [shaftDiameter, shaftDiameter, length]
  });
}

function initializeMarkerRecords(view: DataView, bytes: Uint8Array, capacity: number): void {
  for (let index = 0; index < capacity; index += 1) {
    const offset = index * MARKER.stride;
    view.setFloat32(offset + ORIENTATION_OFFSET + 12, 1, true);
    view.setFloat32(offset + SCALE_OFFSET, 1, true);
    view.setFloat32(offset + SCALE_OFFSET + 4, 1, true);
    view.setFloat32(offset + SCALE_OFFSET + 8, 1, true);
    bytes.fill(255, offset + COLOR_OFFSET, offset + COLOR_OFFSET + 4);
  }
}

function writeArrowDirection(view: DataView, recordOffset: number, vector: Readonly<Vec3>): void {
  vector.forEach(assertFinite);
  const length = Math.hypot(...vector);
  writeQuaternion(view, recordOffset + ORIENTATION_OFFSET, arrowOrientation(vector, length));
  view.setFloat32(recordOffset + SCALE_OFFSET + 8, length, true);
}

function arrowOrientation(vector: Readonly<Vec3>, length: number): Quaternion {
  if (length === 0) return [0, 0, 0, 1];
  const x = vector[0] / length;
  const y = vector[1] / length;
  const z = vector[2] / length;
  if (x === 0 && y === 0 && z === 1) return [0, 0, 0, 1];
  return z === -1 ? [1, 0, 0, 0] : normalizeQuaternion([y === 0 ? 0 : -y, x === 0 ? 0 : x, 0, 1 + z]);
}

function readArrowVector(view: DataView, recordOffset: number): Vec3 {
  const x = view.getFloat32(recordOffset + ORIENTATION_OFFSET, true);
  const y = view.getFloat32(recordOffset + ORIENTATION_OFFSET + 4, true);
  const z = view.getFloat32(recordOffset + ORIENTATION_OFFSET + 8, true);
  const w = view.getFloat32(recordOffset + ORIENTATION_OFFSET + 12, true);
  const length = view.getFloat32(recordOffset + SCALE_OFFSET + 8, true);
  return [2 * (x * z + w * y) * length, 2 * (y * z - w * x) * length, (1 - 2 * (x * x + y * y)) * length];
}

function writeQuaternion(view: DataView, offset: number, value: Readonly<Quaternion>): void {
  normalizeQuaternion(value).forEach((component, index) => view.setFloat32(offset + index * 4, component, true));
}

function assertDimensions(value: Readonly<Vec3>): void {
  value.forEach(component => assertNonnegative(component, 'Primitive dimensions'));
}

function assertNonnegative(value: number, label: string): void {
  assertFinite(value);
  if (value < 0) throw new RangeError(`${label} must be nonnegative.`);
}

function assertRecord(value: unknown): asserts value is object {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new TypeError('Scene records must be objects.');
  }
}

function copyVec3(value: Readonly<Vec3>): Vec3 {
  if (!Array.isArray(value) || value.length !== 3) throw new RangeError('Vector values must contain three components.');
  return [value[0], value[1], value[2]];
}

function copyQuaternion(value: Readonly<Quaternion>): Quaternion {
  if (!Array.isArray(value) || value.length !== 4) {
    throw new RangeError('Orientations must contain four components.');
  }
  return [value[0], value[1], value[2], value[3]];
}
