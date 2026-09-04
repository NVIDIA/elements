// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  MutableVector3View,
  PackedRecordBuffer,
  readPackedColor,
  resolveSceneColor,
  writePackedColor
} from '../packed-record-buffer.js';
import { POINT } from '../layouts/built-ins.js';
import { writePoint } from '../layouts/helpers.js';
import type { RGBA, Vec3 } from '../types.js';
import type { MutableVector3, RecordBufferOptions, SceneColor } from '../packed-record-buffer.js';

const POSITION_OFFSET = fieldOffset('position');
const COLOR_OFFSET = fieldOffset('color');

export interface PointInit {
  readonly position?: Readonly<Vec3>;
  readonly color?: SceneColor;
}

export interface Point {
  readonly index: number;
  readonly position: MutableVector3;
  get color(): RGBA;
  set color(value: SceneColor);
}

export type PointInstanceSource = ArrayBufferView | PointBuffer;

/** Fixed-capacity, mutable storage for packed point records. */
export class PointBuffer extends PackedRecordBuffer<'point', PointInit, Point> {
  constructor(options: RecordBufferOptions) {
    super({
      capacity: options.capacity,
      createHandle: (view, index) => new PointRecord(view, index),
      defaultInit: () => ({}),
      initialize: initializeRecords,
      kind: 'point',
      stride: POINT.stride,
      writeRecord
    });
  }
}

function writeRecord(bytes: Uint8Array, index: number, init: PointInit): void {
  writePoint(bytes, index, {
    position: copyVec3(init.position ?? [0, 0, 0]),
    color: resolveSceneColor(init.color ?? [1, 1, 1, 1])
  });
}

class PointRecord implements Point {
  readonly index: number;
  readonly position: MutableVector3;

  readonly #view: DataView;

  constructor(view: DataView, index: number) {
    this.index = index;
    this.#view = view;
    this.position = new MutableVector3View(view, index * POINT.stride + POSITION_OFFSET);
  }

  get color(): RGBA {
    return readPackedColor(this.#view, this.index * POINT.stride + COLOR_OFFSET);
  }

  set color(value: SceneColor) {
    writePackedColor(this.#view, this.index * POINT.stride + COLOR_OFFSET, value);
  }
}

function initializeRecords(_view: DataView, bytes: Uint8Array, capacity: number): void {
  for (let index = 0; index < capacity; index += 1) {
    const offset = index * POINT.stride + COLOR_OFFSET;
    bytes.fill(255, offset, offset + 4);
  }
}

function copyVec3(value: Readonly<Vec3>): Vec3 {
  return [value[0], value[1], value[2]];
}

function fieldOffset(name: string): number {
  const field = POINT.fields[name];
  if (!field) {
    throw new TypeError(`POINT has no field named "${name}".`);
  }
  return field.offset;
}
