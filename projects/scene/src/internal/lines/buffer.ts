// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  MutableVector3View,
  PackedRecordBuffer,
  assertFinite,
  readPackedColor,
  resolveSceneColor,
  writePackedColor
} from '../packed-record-buffer.js';
import { LINE_VERTEX } from '../layouts/built-ins.js';
import { writeLineVertex } from '../layouts/helpers.js';
import type { RGBA, Vec3 } from '../types.js';
import type { MutableVector3, RecordBufferOptions, SceneColor } from '../packed-record-buffer.js';

const POSITION_OFFSET = fieldOffset('position');
const COLOR_OFFSET = fieldOffset('color');
const NORMAL_OFFSET = fieldOffset('normal');
const WIDTH_OFFSET = fieldOffset('width');
const DASH_OFFSET = fieldOffset('dash');
const GAP_OFFSET = fieldOffset('gap');

export interface LineVertexStyle {
  readonly normal?: Readonly<Vec3>;
  readonly width?: number;
  readonly dash?: number;
  readonly gap?: number;
}

export interface LineVertexInit extends LineVertexStyle {
  readonly position?: Readonly<Vec3>;
  readonly color?: SceneColor;
}

export interface LineVertex {
  readonly index: number;
  readonly position: MutableVector3;
  readonly normal: MutableVector3;
  get color(): RGBA;
  set color(value: SceneColor);
  get width(): number;
  set width(value: number);
  get dash(): number;
  set dash(value: number);
  get gap(): number;
  set gap(value: number);
  setStyle(style: LineVertexStyle): this;
}

export type LineVertexInstanceSource = ArrayBufferView | LineVertexBuffer;

/** Fixed-capacity, mutable storage for packed line vertex records. */
export class LineVertexBuffer extends PackedRecordBuffer<'line-vertex', LineVertexInit, LineVertex> {
  constructor(options: RecordBufferOptions) {
    super({
      capacity: options.capacity,
      createHandle: (view, index) => new LineVertexRecord(view, index),
      defaultInit: () => ({}),
      initialize: initializeRecords,
      kind: 'line-vertex',
      stride: LINE_VERTEX.stride,
      writeRecord
    });
  }
}

function writeRecord(bytes: Uint8Array, index: number, init: LineVertexInit): void {
  writeLineVertex(bytes, index, {
    position: copyVec3(init.position ?? [0, 0, 0]),
    color: resolveSceneColor(init.color ?? [1, 1, 1, 1]),
    normal: copyVec3(init.normal ?? [0, 0, 1]),
    width: init.width,
    dash: init.dash,
    gap: init.gap
  });
}

class LineVertexRecord implements LineVertex {
  readonly index: number;
  readonly position: MutableVector3;
  readonly normal: MutableVector3;

  readonly #recordOffset: number;
  readonly #view: DataView;

  constructor(view: DataView, index: number) {
    this.index = index;
    this.#view = view;
    this.#recordOffset = index * LINE_VERTEX.stride;
    this.position = new MutableVector3View(view, this.#recordOffset + POSITION_OFFSET);
    this.normal = new MutableVector3View(view, this.#recordOffset + NORMAL_OFFSET, assertNonzeroNormal);
  }

  get color(): RGBA {
    return readPackedColor(this.#view, this.#recordOffset + COLOR_OFFSET);
  }

  set color(value: SceneColor) {
    writePackedColor(this.#view, this.#recordOffset + COLOR_OFFSET, value);
  }

  get width(): number {
    return this.#view.getFloat32(this.#recordOffset + WIDTH_OFFSET, true);
  }

  set width(value: number) {
    this.setStyle({ width: value });
  }

  get dash(): number {
    return this.#view.getFloat32(this.#recordOffset + DASH_OFFSET, true);
  }

  set dash(value: number) {
    this.setStyle({ dash: value });
  }

  get gap(): number {
    return this.#view.getFloat32(this.#recordOffset + GAP_OFFSET, true);
  }

  set gap(value: number) {
    this.setStyle({ gap: value });
  }

  setStyle(style: LineVertexStyle): this {
    const next = {
      normal: copyVec3(style.normal ?? this.normal.toArray()),
      width: style.width ?? this.width,
      dash: style.dash ?? this.dash,
      gap: style.gap ?? this.gap
    };
    assertLineStyle(next);
    this.normal.set(...next.normal);
    this.#view.setFloat32(this.#recordOffset + WIDTH_OFFSET, next.width, true);
    this.#view.setFloat32(this.#recordOffset + DASH_OFFSET, next.dash, true);
    this.#view.setFloat32(this.#recordOffset + GAP_OFFSET, next.gap, true);
    return this;
  }
}

function initializeRecords(view: DataView, bytes: Uint8Array, capacity: number): void {
  for (let index = 0; index < capacity; index += 1) {
    const offset = index * LINE_VERTEX.stride;
    bytes.fill(255, offset + COLOR_OFFSET, offset + COLOR_OFFSET + 4);
    view.setFloat32(offset + NORMAL_OFFSET + 8, 1, true);
    view.setFloat32(offset + WIDTH_OFFSET, 0.1, true);
  }
}

function assertLineStyle(style: Required<LineVertexStyle>): void {
  const { dash, gap, normal, width } = style;
  [width, dash, gap].forEach(assertFinite);
  assertNonzeroNormal(normal);
  if (width < 0 || dash < 0 || gap < 0 || (gap > 0 && dash === 0)) {
    throw new RangeError('Line width, dash, and gap must be nonnegative, with a positive dash before a gap.');
  }
}

function assertNonzeroNormal(normal: Readonly<Vec3>): void {
  normal.forEach(assertFinite);
  if (Math.hypot(...normal) === 0) {
    throw new RangeError('Line normal length must be greater than zero.');
  }
}

function copyVec3(value: Readonly<Vec3>): Vec3 {
  return [value[0], value[1], value[2]];
}

function fieldOffset(name: string): number {
  const field = LINE_VERTEX.fields[name];
  if (!field) {
    throw new TypeError(`LINE_VERTEX has no field named "${name}".`);
  }
  return field.offset;
}
