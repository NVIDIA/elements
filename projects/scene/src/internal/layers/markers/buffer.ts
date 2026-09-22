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
  type RecordBufferOptions
} from '../../records/packed-record-buffer.js';
import type { SceneColor, RGBA } from '../../color/types.js';
import { getSceneFeatureId, setSceneFeatureId } from '../../interaction/feature-ids.js';
import { MARKER } from '../../records/layouts/built-ins.js';
import { getFieldOffset } from '../../records/layouts/define-layout.js';
import { writeMarker } from '../../records/layouts/codecs.js';
import type { Quaternion, Vec3 } from '../../math/types.js';

import type { ExternalMarkerSource } from '../../records/packed-record-source.js';
import { registerSemanticMarkerSource } from './semantic-brand.js';
import { initializeMarkerRecords, MarkerQuaternionView } from './record-format.js';

const POSITION_OFFSET = getFieldOffset(MARKER, 'position');
const ORIENTATION_OFFSET = getFieldOffset(MARKER, 'orientation');
const SCALE_OFFSET = getFieldOffset(MARKER, 'scale');
const COLOR_OFFSET = getFieldOffset(MARKER, 'color');
const OUTLINE_COLOR_OFFSET = getFieldOffset(MARKER, 'outline-color');

export interface MarkerInit {
  readonly featureId?: number;
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
  get featureId(): number | undefined;
  set featureId(value: number | undefined);
}

export type MarkerSource = MarkerBuffer | ExternalMarkerSource;

/** Fixed-capacity, mutable storage for packed marker records. */
export class MarkerBuffer extends PackedRecordBuffer<'marker', MarkerInit, Marker> {
  constructor(options: RecordBufferOptions<MarkerInit>) {
    super({
      buffer: options,
      createHandle: handleOptions => new MarkerRecord(handleOptions),
      defaultInit: () => ({}),
      initialize: initializeMarkerRecords,
      kind: 'marker',
      readFeatureId: init => init.featureId,
      stride: MARKER.stride,
      writeRecord
    });
    registerSemanticMarkerSource(this, 'marker');
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
  readonly #featureIdSource: object;
  readonly #view: DataView;

  constructor(options: { featureIdSource: object; index: number; notifyMutation: () => void; view: DataView }) {
    const { featureIdSource, index, notifyMutation, view } = options;
    this.index = index;
    this.#featureIdSource = featureIdSource;
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

  get featureId(): number | undefined {
    return getSceneFeatureId(this.#featureIdSource, this.index);
  }

  set featureId(value: number | undefined) {
    setSceneFeatureId(this.#featureIdSource, this.index, value);
  }
}

function copyVec3(value: Readonly<Vec3>): Vec3 {
  return [value[0], value[1], value[2]];
}

function copyQuaternion(value: Readonly<Quaternion>): Quaternion {
  return [value[0], value[1], value[2], value[3]];
}
