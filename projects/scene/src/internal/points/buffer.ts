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
import { getFieldOffset } from '../layouts/define-layout.js';
import { writePoint } from '../layouts/helpers.js';
import type { RGBA, Vec3 } from '../types.js';
import type { MutableVector3, RecordBufferOptions, SceneColor } from '../packed-record-buffer.js';
import type { ExternalPointSource } from '../packed-record-source.js';
import { getSceneFeatureId, setSceneFeatureId } from '../feature-ids.js';

const POSITION_OFFSET = getFieldOffset(POINT, 'position');
const COLOR_OFFSET = getFieldOffset(POINT, 'color');

export interface PointInit {
  readonly featureId?: number;
  readonly position?: Readonly<Vec3>;
  readonly color?: SceneColor;
}

export interface Point {
  readonly index: number;
  readonly position: MutableVector3;
  get color(): RGBA;
  set color(value: SceneColor);
  get featureId(): number | undefined;
  set featureId(value: number | undefined);
}

export type PointSource = PointBuffer | ExternalPointSource;

/** Fixed-capacity, mutable storage for packed point records. */
export class PointBuffer extends PackedRecordBuffer<'point', PointInit, Point> {
  constructor(options: RecordBufferOptions<PointInit>) {
    super({
      buffer: options,
      createHandle: handleOptions => new PointRecord(handleOptions),
      defaultInit: () => ({}),
      initialize: initializeRecords,
      kind: 'point',
      readFeatureId: init => init.featureId,
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

  readonly #notifyMutation: () => void;
  readonly #featureIdSource: object;
  readonly #view: DataView;

  constructor(options: { featureIdSource: object; index: number; notifyMutation: () => void; view: DataView }) {
    const { featureIdSource, index, notifyMutation, view } = options;
    this.index = index;
    this.#featureIdSource = featureIdSource;
    this.#notifyMutation = notifyMutation;
    this.#view = view;
    this.position = new MutableVector3View(view, index * POINT.stride + POSITION_OFFSET, { notifyMutation });
  }

  get color(): RGBA {
    return readPackedColor(this.#view, this.index * POINT.stride + COLOR_OFFSET);
  }

  set color(value: SceneColor) {
    writePackedColor(this.#view, this.index * POINT.stride + COLOR_OFFSET, value);
    this.#notifyMutation();
  }

  get featureId(): number | undefined {
    return getSceneFeatureId(this.#featureIdSource, this.index);
  }

  set featureId(value: number | undefined) {
    setSceneFeatureId(this.#featureIdSource, this.index, value);
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
