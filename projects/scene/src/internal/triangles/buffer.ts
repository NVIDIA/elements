// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  MutableVector3View,
  PackedRecordBuffer,
  readPackedColor,
  resolveSceneColor,
  writePackedColor
} from '../packed-record-buffer.js';
import { TRIANGLE_VERTEX } from '../layouts/built-ins.js';
import { getFieldOffset } from '../layouts/define-layout.js';
import { writeTriangleVertex } from '../layouts/helpers.js';
import type { RGBA, Vec3 } from '../types.js';
import type { MutableVector3, RecordBufferOptions, SceneColor } from '../packed-record-buffer.js';

const POSITION_OFFSET = getFieldOffset(TRIANGLE_VERTEX, 'position');
const COLOR_OFFSET = getFieldOffset(TRIANGLE_VERTEX, 'color');

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

export type TriangleVertexSource = TriangleVertexBuffer;

/** Fixed-capacity, mutable storage for packed triangle vertex records. */
export class TriangleVertexBuffer extends PackedRecordBuffer<'triangle-vertex', TriangleVertexInit, TriangleVertex> {
  constructor(options: RecordBufferOptions) {
    super({
      capacity: options.capacity,
      createHandle: (view, index, notifyMutation) => new TriangleVertexRecord(view, index, notifyMutation),
      defaultInit: () => ({}),
      initialize: initializeRecords,
      kind: 'triangle-vertex',
      stride: TRIANGLE_VERTEX.stride,
      writeRecord
    });
  }
}

function writeRecord(bytes: Uint8Array, index: number, init: TriangleVertexInit): void {
  writeTriangleVertex(bytes, index, {
    position: copyVec3(init.position ?? [0, 0, 0]),
    color: resolveSceneColor(init.color ?? [1, 1, 1, 1])
  });
}

class TriangleVertexRecord implements TriangleVertex {
  readonly index: number;
  readonly position: MutableVector3;

  readonly #notifyMutation: () => void;
  readonly #view: DataView;

  constructor(view: DataView, index: number, notifyMutation: () => void) {
    this.index = index;
    this.#notifyMutation = notifyMutation;
    this.#view = view;
    this.position = new MutableVector3View(view, index * TRIANGLE_VERTEX.stride + POSITION_OFFSET, { notifyMutation });
  }

  get color(): RGBA {
    return readPackedColor(this.#view, this.index * TRIANGLE_VERTEX.stride + COLOR_OFFSET);
  }

  set color(value: SceneColor) {
    writePackedColor(this.#view, this.index * TRIANGLE_VERTEX.stride + COLOR_OFFSET, value);
    this.#notifyMutation();
  }
}

function initializeRecords(_view: DataView, bytes: Uint8Array, capacity: number): void {
  for (let index = 0; index < capacity; index += 1) {
    const offset = index * TRIANGLE_VERTEX.stride + COLOR_OFFSET;
    bytes.fill(255, offset, offset + 4);
  }
}

function copyVec3(value: Readonly<Vec3>): Vec3 {
  return [value[0], value[1], value[2]];
}
