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
import { LABEL } from '../layouts/built-ins.js';
import { getFieldOffset } from '../layouts/define-layout.js';
import { registerLabelSourceTexts } from './source.js';
import type { RGBA, Vec3 } from '../types.js';
import type { MutableVector3, RecordBufferOptions, SceneColor } from '../packed-record-buffer.js';
import type { ExternalLabelSource } from '../packed-record-source.js';
import { getSceneFeatureId, setSceneFeatureId } from '../feature-ids.js';

const POSITION_OFFSET = getFieldOffset(LABEL, 'position');
const SCALE_OFFSET = getFieldOffset(LABEL, 'scale');
const COLOR_OFFSET = getFieldOffset(LABEL, 'color');
const USE_CURRENT_COLOR_OFFSET = getFieldOffset(LABEL, 'use-current-color');

export interface LabelInit {
  /** Defaults to the label layer's computed `currentColor`. */
  readonly color?: SceneColor;
  readonly position?: Readonly<Vec3>;
  readonly scale?: number;
  readonly text?: string;
  readonly featureId?: number;
}

export interface Label {
  readonly index: number;
  readonly position: MutableVector3;
  get color(): RGBA | 'currentColor';
  set color(value: SceneColor);
  get scale(): number;
  set scale(value: number);
  get text(): string;
  set text(value: string);
  get featureId(): number | undefined;
  set featureId(value: number | undefined);
}

export type LabelSource = LabelBuffer | ExternalLabelSource;

/** Fixed-capacity, mutable storage for packed label records and their text. */
export class LabelBuffer extends PackedRecordBuffer<'label', LabelInit, Label> {
  constructor(options: RecordBufferOptions) {
    const texts = createTextStorage(options);
    super({
      capacity: options.capacity,
      createHandle: ({ featureIdSource, index, notifyMutation, view }) =>
        new LabelRecord({ featureIdSource, index, notifyMutation, texts, view }),
      defaultInit: () => ({}),
      initialize: initializeRecords,
      kind: 'label',
      readFeatureId: init => init.featureId,
      stride: LABEL.stride,
      writeRecord: (bytes, index, init) => writeRecord({ bytes, index, init, texts })
    });
    registerLabelSourceTexts(this, texts);
  }
}

function createTextStorage(options: RecordBufferOptions): string[] {
  if (typeof options !== 'object' || options === null) {
    throw new TypeError('Record buffer options must be an object.');
  }
  const { capacity } = options;
  if (!Number.isInteger(capacity) || capacity < 0) {
    throw new RangeError('Record capacity must be a nonnegative integer with a safe byte length.');
  }
  return Array.from<string>({ length: capacity }).fill('');
}

function writeRecord(options: { bytes: Uint8Array; index: number; init: LabelInit; texts: string[] }): void {
  const { bytes, index, init, texts } = options;
  const position = copyVec3(init.position ?? [0, 0, 0]);
  position.forEach(assertFinite);
  const scale = init.scale ?? 16;
  assertScale(scale);
  const text = init.text ?? '';
  assertText(text);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const offset = index * LABEL.stride;
  position.forEach((value, component) => view.setFloat32(offset + POSITION_OFFSET + component * 4, value, true));
  view.setFloat32(offset + SCALE_OFFSET, scale, true);
  writeLabelColor(view, offset, init.color);
  texts[index] = text;
}

class LabelRecord implements Label {
  readonly index: number;
  readonly position: MutableVector3;

  readonly #notifyMutation: () => void;
  readonly #featureIdSource: object;
  readonly #texts: string[];
  readonly #view: DataView;

  constructor(options: {
    featureIdSource: object;
    index: number;
    notifyMutation: () => void;
    texts: string[];
    view: DataView;
  }) {
    this.index = options.index;
    this.#featureIdSource = options.featureIdSource;
    this.#notifyMutation = options.notifyMutation;
    this.#texts = options.texts;
    this.#view = options.view;
    this.position = new MutableVector3View(options.view, options.index * LABEL.stride + POSITION_OFFSET, {
      notifyMutation: options.notifyMutation
    });
  }

  get color(): RGBA | 'currentColor' {
    if (this.#view.getUint32(this.index * LABEL.stride + USE_CURRENT_COLOR_OFFSET, true) !== 0) {
      return 'currentColor';
    }
    return readPackedColor(this.#view, this.index * LABEL.stride + COLOR_OFFSET);
  }

  set color(value: SceneColor) {
    writeLabelColor(this.#view, this.index * LABEL.stride, value);
    this.#notifyMutation();
  }

  get scale(): number {
    return this.#view.getFloat32(this.index * LABEL.stride + SCALE_OFFSET, true);
  }

  set scale(value: number) {
    assertScale(value);
    this.#view.setFloat32(this.index * LABEL.stride + SCALE_OFFSET, value, true);
    this.#notifyMutation();
  }

  get text(): string {
    return this.#texts[this.index] ?? '';
  }

  set text(value: string) {
    assertText(value);
    if (value === this.text) return;
    this.#texts[this.index] = value;
    this.#notifyMutation();
  }

  get featureId(): number | undefined {
    return getSceneFeatureId(this.#featureIdSource, this.index);
  }

  set featureId(value: number | undefined) {
    setSceneFeatureId(this.#featureIdSource, this.index, value);
  }
}

function initializeRecords(view: DataView, bytes: Uint8Array, capacity: number): void {
  for (let index = 0; index < capacity; index += 1) {
    const offset = index * LABEL.stride;
    view.setFloat32(offset + SCALE_OFFSET, 16, true);
    bytes.fill(255, offset + COLOR_OFFSET, offset + COLOR_OFFSET + 4);
    view.setUint32(offset + USE_CURRENT_COLOR_OFFSET, 1, true);
  }
}

function writeLabelColor(view: DataView, recordOffset: number, value: SceneColor | undefined): void {
  if (value === undefined || isCurrentColor(value)) {
    view.setUint32(recordOffset + USE_CURRENT_COLOR_OFFSET, 1, true);
    return;
  }
  const color = resolveSceneColor(value);
  writePackedColor(view, recordOffset + COLOR_OFFSET, color);
  view.setUint32(recordOffset + USE_CURRENT_COLOR_OFFSET, 0, true);
}

function isCurrentColor(value: SceneColor): value is string {
  return typeof value === 'string' && value.trim().toLowerCase() === 'currentcolor';
}

function assertScale(value: number): void {
  assertFinite(value);
  if (value <= 0) throw new RangeError('Label scale must be greater than zero.');
}

function assertText(value: unknown): asserts value is string {
  if (typeof value !== 'string') throw new TypeError('Label text must be a string.');
}

function copyVec3(value: Readonly<Vec3>): Vec3 {
  return [value[0], value[1], value[2]];
}
