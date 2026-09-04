// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { parseCSSColor } from './color.js';
import {
  PACKED_RECORD_SOURCE,
  PACKED_RECORD_STATE,
  type PackedRecordKind,
  type PackedRecordState,
  type VersionedPackedRecordSource
} from './packed-record-source.js';
import type { RGBA, Vec3 } from './types.js';

export type SceneColor = string | Readonly<RGBA>;

export interface RecordBufferOptions {
  readonly capacity: number;
}

export interface MutableVector3 {
  x: number;
  y: number;
  z: number;
  set(x: number, y: number, z: number): this;
  toArray(): Vec3;
}

export class PackedRecordBuffer<Kind extends PackedRecordKind, Init, RecordHandle>
  implements VersionedPackedRecordSource<Kind>
{
  /** Record capacity for this allocation. */
  readonly capacity: number;
  readonly [PACKED_RECORD_SOURCE]: Kind;

  readonly #bytes: Uint8Array;
  #mutableStateEscaped = false;
  #count = 0;
  readonly #createHandle: (view: DataView, index: number) => RecordHandle;
  readonly #defaultInit: () => Init;
  readonly #handles = new Map<number, RecordHandle>();
  readonly #view: DataView;
  #version = 0;
  readonly #writeRecord: (bytes: Uint8Array, index: number, init: Init) => void;

  protected constructor(options: {
    capacity: number;
    createHandle: (view: DataView, index: number) => RecordHandle;
    defaultInit: () => Init;
    initialize: (view: DataView, bytes: Uint8Array, capacity: number) => void;
    kind: Kind;
    stride: number;
    writeRecord: (bytes: Uint8Array, index: number, init: Init) => void;
  }) {
    const { capacity, createHandle, defaultInit, initialize, kind, stride, writeRecord } = options;
    const byteLength = capacity * stride;
    if (!Number.isInteger(capacity) || capacity < 0 || !Number.isSafeInteger(byteLength)) {
      throw new RangeError('Record capacity must be a nonnegative integer with a safe byte length.');
    }
    this.capacity = capacity;
    this.#bytes = new Uint8Array(byteLength);
    this.#createHandle = createHandle;
    this.#defaultInit = defaultInit;
    this.#view = new DataView(this.#bytes.buffer, this.#bytes.byteOffset, this.#bytes.byteLength);
    this[PACKED_RECORD_SOURCE] = kind;
    this.#writeRecord = writeRecord;
    initialize(this.#view, this.#bytes, capacity);
  }

  /** Complete fixed-capacity byte allocation in the canonical packed layout. Call commit after direct writes. */
  get bytes(): Uint8Array {
    this.#mutableStateEscaped = true;
    return this.#bytes;
  }

  /** Number of records in the active contiguous prefix. */
  get count(): number {
    return this.#count;
  }

  /** Monotonically increasing mutation version used by Scene's prepared-source cache. */
  get version(): number {
    return this.#version;
  }

  /** Appends a record and returns its stable mutable handle. Call commit after handle writes before source reuse. */
  add(init: Init = this.#defaultInit()): RecordHandle {
    const index = this.#count;
    this.set(index, init);
    return this.at(index);
  }

  /** Lazily creates and caches a stable mutable handle. Call commit after mutating it. */
  at(index: number): RecordHandle {
    this.#assertActiveIndex(index);
    this.#mutableStateEscaped = true;
    const existing = this.#handles.get(index);
    if (existing) {
      return existing;
    }
    const handle = this.#createHandle(this.#view, index);
    this.#handles.set(index, handle);
    return handle;
  }

  /** Writes an active record or appends at count without allocating a handle. */
  set(index: number, init: Init): this {
    if (!Number.isInteger(index) || index < 0 || index > this.#count || index >= this.capacity) {
      throw new RangeError('Record index must address an active record or append at the current count.');
    }
    this.#writeRecord(this.#bytes, index, init);
    if (index === this.#count) {
      this.#count += 1;
    }
    this.#version += 1;
    return this;
  }

  /** Commits mutations made through bytes or record handles and activates the committed contiguous prefix. */
  commit(start = 0, count?: number): this {
    assertCommitRange(start, count, this.capacity);
    const resolvedCount = count ?? this.capacity - start;
    if (resolvedCount === 0) return this;
    this.#count = Math.max(this.#count, start + resolvedCount);
    this.#mutableStateEscaped = false;
    this.#version += 1;
    return this;
  }

  [PACKED_RECORD_STATE](): PackedRecordState {
    return { bytes: this.#bytes, cacheable: !this.#mutableStateEscaped, version: this.#version };
  }

  #assertActiveIndex(index: number): void {
    if (!Number.isInteger(index) || index < 0 || index >= this.#count) {
      throw new RangeError('Record index must identify an active record.');
    }
  }
}

export class MutableVector3View implements MutableVector3 {
  readonly #offset: number;
  readonly #validate: ((value: Readonly<Vec3>) => void) | undefined;
  readonly #view: DataView;

  constructor(view: DataView, offset: number, validate?: (value: Readonly<Vec3>) => void) {
    this.#view = view;
    this.#offset = offset;
    this.#validate = validate;
  }

  get x(): number {
    return this.#view.getFloat32(this.#offset, true);
  }

  set x(value: number) {
    this.#setComponent(0, value);
  }

  get y(): number {
    return this.#view.getFloat32(this.#offset + 4, true);
  }

  set y(value: number) {
    this.#setComponent(1, value);
  }

  get z(): number {
    return this.#view.getFloat32(this.#offset + 8, true);
  }

  set z(value: number) {
    this.#setComponent(2, value);
  }

  set(x: number, y: number, z: number): this {
    const next: Vec3 = [x, y, z];
    assertFiniteTuple(next);
    this.#validate?.(next);
    next.forEach((value, index) => this.#view.setFloat32(this.#offset + index * 4, value, true));
    return this;
  }

  toArray(): Vec3 {
    return [this.x, this.y, this.z];
  }

  #setComponent(component: number, value: number): void {
    assertFinite(value);
    const next = this.toArray();
    next[component] = value;
    this.#validate?.(next);
    this.#view.setFloat32(this.#offset + component * 4, value, true);
  }
}

function assertCommitRange(start: number, count: number | undefined, capacity: number): void {
  const resolvedCount = count ?? capacity - start;
  if (
    !Number.isInteger(start) ||
    start < 0 ||
    !Number.isInteger(resolvedCount) ||
    resolvedCount < 0 ||
    start + resolvedCount > capacity
  ) {
    throw new RangeError('Committed records must describe a nonnegative range within capacity.');
  }
}

export function resolveSceneColor(value: SceneColor): RGBA {
  if (typeof value === 'string') {
    const color = parseCSSColor(value);
    if (!color) {
      throw new TypeError(`Record color must be a supported CSS color: "${value}".`);
    }
    return color;
  }
  if (value.length !== 4) {
    throw new RangeError('Record colors must contain four channels.');
  }
  return [value[0], value[1], value[2], value[3]];
}

export function readPackedColor(view: DataView, offset: number): RGBA {
  return [
    view.getUint8(offset) / 255,
    view.getUint8(offset + 1) / 255,
    view.getUint8(offset + 2) / 255,
    view.getUint8(offset + 3) / 255
  ];
}

export function writePackedColor(view: DataView, offset: number, color: SceneColor): void {
  resolveSceneColor(color).forEach((value, channel) => {
    assertFinite(value);
    view.setUint8(offset + channel, Math.floor(Math.min(1, Math.max(0, value)) * 255 + 0.5));
  });
}

export function assertFinite(value: number): void {
  if (!Number.isFinite(value)) {
    throw new RangeError('Record values must be finite.');
  }
}

function assertFiniteTuple(value: readonly number[]): void {
  value.forEach(assertFinite);
}
