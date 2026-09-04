// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  MutableVector3View,
  PackedRecordBuffer,
  readPackedColor,
  resolveSceneColor,
  writePackedColor
} from '../packed-record-buffer.js';
import { TRI_VERTEX } from '../layouts/built-ins.js';
import { writeTriVertex } from '../layouts/helpers.js';
import type { RGBA, Vec3 } from '../types.js';
import type { MutableVector3, RecordBufferOptions, SceneColor } from '../packed-record-buffer.js';

const POSITION_OFFSET = fieldOffset('position');
const COLOR_OFFSET = fieldOffset('color');

export interface TriangleVertexInit {
  readonly position?: Readonly<Vec3>;
  readonly color?: SceneColor;
}

export interface TriangleVertex {
  readonly index: number;
  readonly position: MutableVector3;
  get color(): RGBA;
  set color(value: SceneColor);
}

export type TriangleVertexInstanceSource = ArrayBufferView | TriangleVertexBuffer;

/** Fixed-capacity, mutable storage for packed triangle vertex records. */
export class TriangleVertexBuffer extends PackedRecordBuffer<'triangle-vertex', TriangleVertexInit, TriangleVertex> {
  constructor(options: RecordBufferOptions) {
    super({
      capacity: options.capacity,
      createHandle: (view, index) => new TriangleVertexRecord(view, index),
      defaultInit: () => ({}),
      initialize: initializeRecords,
      kind: 'triangle-vertex',
      stride: TRI_VERTEX.stride,
      writeRecord
    });
  }
}

function writeRecord(bytes: Uint8Array, index: number, init: TriangleVertexInit): void {
  writeTriVertex(bytes, index, {
    position: copyVec3(init.position ?? [0, 0, 0]),
    color: resolveSceneColor(init.color ?? [1, 1, 1, 1])
  });
}

class TriangleVertexRecord implements TriangleVertex {
  readonly index: number;
  readonly position: MutableVector3;

  readonly #view: DataView;

  constructor(view: DataView, index: number) {
    this.index = index;
    this.#view = view;
    this.position = new MutableVector3View(view, index * TRI_VERTEX.stride + POSITION_OFFSET);
  }

  get color(): RGBA {
    return readPackedColor(this.#view, this.index * TRI_VERTEX.stride + COLOR_OFFSET);
  }

  set color(value: SceneColor) {
    writePackedColor(this.#view, this.index * TRI_VERTEX.stride + COLOR_OFFSET, value);
  }
}

function initializeRecords(_view: DataView, bytes: Uint8Array, capacity: number): void {
  for (let index = 0; index < capacity; index += 1) {
    const offset = index * TRI_VERTEX.stride + COLOR_OFFSET;
    bytes.fill(255, offset, offset + 4);
  }
}

function copyVec3(value: Readonly<Vec3>): Vec3 {
  return [value[0], value[1], value[2]];
}

function fieldOffset(name: string): number {
  const field = TRI_VERTEX.fields[name];
  if (!field) {
    throw new TypeError(`TRI_VERTEX has no field named "${name}".`);
  }
  return field.offset;
}
