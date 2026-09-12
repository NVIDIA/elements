// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  MutableVector3View,
  PackedRecordBuffer,
  readPackedColor,
  resolveSceneColor,
  writePackedColor,
  type MutableVector3,
  type MutableQuaternion,
  type RecordBufferOptions,
  type SceneColor
} from '../packed-record-buffer.js';
import { MARKER } from '../layouts/built-ins.js';
import { getFieldOffset } from '../layouts/define-layout.js';
import { writeMarker } from '../layouts/helpers.js';
import { normalizeQuaternion } from '../math/quaternion.js';
import type { Quaternion, RGBA, Vec3 } from '../types.js';

const POSITION_OFFSET = getFieldOffset(MARKER, 'position');
const ORIENTATION_OFFSET = getFieldOffset(MARKER, 'orientation');
const SCALE_OFFSET = getFieldOffset(MARKER, 'scale');
const COLOR_OFFSET = getFieldOffset(MARKER, 'color');
const OUTLINE_COLOR_OFFSET = getFieldOffset(MARKER, 'outline-color');

export interface MarkerInit {
  readonly position?: Readonly<Vec3>;
  readonly orientation?: Readonly<Quaternion>;
  readonly scale?: Readonly<Vec3>;
  readonly color?: SceneColor;
  readonly outlineColor?: SceneColor;
}

export interface Marker {
  readonly index: number;
  readonly position: MutableVector3;
  readonly orientation: MutableQuaternion;
  readonly scale: MutableVector3;
  get color(): RGBA;
  set color(value: SceneColor);
  get outlineColor(): RGBA;
  set outlineColor(value: SceneColor);
}

export type MarkerSource = MarkerBuffer;

/** Fixed-capacity, mutable storage for packed marker records. */
export class MarkerBuffer extends PackedRecordBuffer<'marker', MarkerInit, Marker> {
  constructor(options: RecordBufferOptions) {
    super({
      capacity: options.capacity,
      createHandle: (view, index, notifyMutation) => new MarkerRecord(view, index, notifyMutation),
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
  readonly position: MutableVector3;
  readonly orientation: MutableQuaternion;
  readonly scale: MutableVector3;

  readonly #notifyMutation: () => void;
  readonly #view: DataView;

  constructor(view: DataView, index: number, notifyMutation: () => void) {
    this.index = index;
    this.#notifyMutation = notifyMutation;
    this.#view = view;
    const recordOffset = index * MARKER.stride;
    this.position = new MutableVector3View(view, recordOffset + POSITION_OFFSET, { notifyMutation });
    this.orientation = new MarkerQuaternionView(view, recordOffset + ORIENTATION_OFFSET, notifyMutation);
    this.scale = new MutableVector3View(view, recordOffset + SCALE_OFFSET, { notifyMutation });
  }

  get color(): RGBA {
    return readPackedColor(this.#view, this.index * MARKER.stride + COLOR_OFFSET);
  }

  set color(value: SceneColor) {
    writePackedColor(this.#view, this.index * MARKER.stride + COLOR_OFFSET, value);
    this.#notifyMutation();
  }

  get outlineColor(): RGBA {
    return readPackedColor(this.#view, this.index * MARKER.stride + OUTLINE_COLOR_OFFSET);
  }

  set outlineColor(value: SceneColor) {
    writePackedColor(this.#view, this.index * MARKER.stride + OUTLINE_COLOR_OFFSET, value);
    this.#notifyMutation();
  }
}

class MarkerQuaternionView implements MutableQuaternion {
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
    const orientation = normalizeQuaternion(components);
    orientation.forEach((value, index) => this.#view.setFloat32(this.#offset + index * 4, value, true));
    this.#notifyMutation();
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
