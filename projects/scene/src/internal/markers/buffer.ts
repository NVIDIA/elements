// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  MutableVector3View,
  PackedRecordBuffer,
  readPackedColor,
  resolveSceneColor,
  writePackedColor,
  type MutableVector3,
  type SceneColor
} from '../packed-record-buffer.js';
import { MARKER } from '../layouts/built-ins.js';
import { writeMarker } from '../layouts/helpers.js';
import { normalizeQuaternion } from '../math/quaternion.js';
import type { Quaternion, RGBA, Vec3 } from '../types.js';

const POSITION_OFFSET = fieldOffset('position');
const ORIENTATION_OFFSET = fieldOffset('orientation');
const SCALE_OFFSET = fieldOffset('scale');
const COLOR_OFFSET = fieldOffset('color');
const OUTLINE_COLOR_OFFSET = fieldOffset('outline-color');

export type MarkerColor = SceneColor;
export type MarkerVector3 = MutableVector3;

export interface MarkerInit {
  readonly position?: Readonly<Vec3>;
  readonly orientation?: Readonly<Quaternion>;
  readonly scale?: Readonly<Vec3>;
  readonly color?: MarkerColor;
  readonly outlineColor?: MarkerColor;
}

export interface MarkerBufferOptions {
  readonly capacity: number;
}

export interface MarkerQuaternion {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly w: number;
  set(x: number, y: number, z: number, w: number): this;
  toArray(): Quaternion;
}

export interface Marker {
  readonly index: number;
  readonly position: MarkerVector3;
  readonly orientation: MarkerQuaternion;
  readonly scale: MarkerVector3;
  get color(): RGBA;
  set color(value: MarkerColor);
  get outlineColor(): RGBA;
  set outlineColor(value: MarkerColor);
}

export type MarkerInstanceSource = ArrayBufferView | MarkerBuffer;

/** Fixed-capacity, mutable storage for packed marker records. */
export class MarkerBuffer extends PackedRecordBuffer<'marker', MarkerInit, Marker> {
  constructor(options: MarkerBufferOptions) {
    super({
      capacity: options.capacity,
      createHandle: (view, index) => new MarkerRecord(view, index),
      defaultInit: () => ({}),
      initialize: initializeRecords,
      kind: 'marker',
      stride: MARKER.stride,
      writeRecord
    });
  }
}

function writeRecord(bytes: Uint8Array, index: number, init: MarkerInit): void {
  writeMarker(bytes, index, {
    position: copyVec3(init.position ?? [0, 0, 0]),
    orientation: copyQuaternion(init.orientation ?? [0, 0, 0, 1]),
    scale: copyVec3(init.scale ?? [1, 1, 1]),
    color: resolveSceneColor(init.color ?? [1, 1, 1, 1]),
    outlineColor: resolveSceneColor(init.outlineColor ?? [0, 0, 0, 0])
  });
}

class MarkerRecord implements Marker {
  readonly index: number;
  readonly position: MarkerVector3;
  readonly orientation: MarkerQuaternion;
  readonly scale: MarkerVector3;

  readonly #view: DataView;

  constructor(view: DataView, index: number) {
    this.index = index;
    this.#view = view;
    const recordOffset = index * MARKER.stride;
    this.position = new MutableVector3View(view, recordOffset + POSITION_OFFSET);
    this.orientation = new MarkerQuaternionView(view, recordOffset + ORIENTATION_OFFSET);
    this.scale = new MutableVector3View(view, recordOffset + SCALE_OFFSET);
  }

  get color(): RGBA {
    return readPackedColor(this.#view, this.index * MARKER.stride + COLOR_OFFSET);
  }

  set color(value: MarkerColor) {
    writePackedColor(this.#view, this.index * MARKER.stride + COLOR_OFFSET, value);
  }

  get outlineColor(): RGBA {
    return readPackedColor(this.#view, this.index * MARKER.stride + OUTLINE_COLOR_OFFSET);
  }

  set outlineColor(value: MarkerColor) {
    writePackedColor(this.#view, this.index * MARKER.stride + OUTLINE_COLOR_OFFSET, value);
  }
}

class MarkerQuaternionView implements MarkerQuaternion {
  readonly #offset: number;
  readonly #view: DataView;

  constructor(view: DataView, offset: number) {
    this.#view = view;
    this.#offset = offset;
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

  // eslint-disable-next-line max-params -- Quaternion mutation requires xyzw components.
  set(x: number, y: number, z: number, w: number): this {
    const orientation = normalizeQuaternion([x, y, z, w]);
    orientation.forEach((value, index) => this.#view.setFloat32(this.#offset + index * 4, value, true));
    return this;
  }

  toArray(): Quaternion {
    return [this.x, this.y, this.z, this.w];
  }
}

function initializeRecords(view: DataView, bytes: Uint8Array, capacity: number): void {
  for (let index = 0; index < capacity; index += 1) {
    const offset = index * MARKER.stride;
    view.setFloat32(offset + ORIENTATION_OFFSET + 12, 1, true);
    view.setFloat32(offset + SCALE_OFFSET, 1, true);
    view.setFloat32(offset + SCALE_OFFSET + 4, 1, true);
    view.setFloat32(offset + SCALE_OFFSET + 8, 1, true);
    bytes.fill(255, offset + COLOR_OFFSET, offset + COLOR_OFFSET + 4);
  }
}

function copyVec3(value: Readonly<Vec3>): Vec3 {
  return [value[0], value[1], value[2]];
}

function copyQuaternion(value: Readonly<Quaternion>): Quaternion {
  return [value[0], value[1], value[2], value[3]];
}

function fieldOffset(name: string): number {
  const field = MARKER.fields[name];
  if (!field) {
    throw new TypeError(`MARKER has no field named "${name}".`);
  }
  return field.offset;
}
