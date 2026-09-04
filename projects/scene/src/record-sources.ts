// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { LABEL, LINE_VERTEX, MARKER, POINT, TRIANGLE_VERTEX } from './internal/layouts/built-ins.js';
import { MarkerInstanceBuffer } from './internal/instance-buffer.js';
import {
  registerExternalPackedRecordSource,
  type ExternalPackedRecordSource,
  type PackedRecordKind,
  type PackedRecordState
} from './internal/packed-record-source.js';
import { VertexStreamBuffer } from './internal/vertex-stream.js';
import type { LayoutDescriptor } from './internal/layouts/define-layout.js';
import { labelRecordIsValid } from './internal/labels/data.js';
import { registerLabelSourceTexts } from './internal/labels/source.js';

interface ExternalSource<Kind extends string> {
  readonly bytes: Uint8Array;
  readonly capacity: number;
  readonly count: number;
  readonly kind: Kind;
}

export type ExternalMarkerSource = ExternalSource<'marker'>;
export type ExternalPointSource = ExternalSource<'point'>;
export type ExternalLineVertexSource = ExternalSource<'line-vertex'>;
export type ExternalTriangleVertexSource = ExternalSource<'triangle-vertex'>;
export interface ExternalLabelSource extends ExternalSource<'label'> {
  readonly texts: readonly string[];
}

export interface ExternalRecordSourceOptions {
  readonly bytes: Uint8Array;
  readonly count: number;
}

export interface ExternalLabelSourceOptions extends ExternalRecordSourceOptions {
  readonly texts: readonly string[];
}

/** Wraps borrowed bytes using the canonical marker record layout. */
export function createMarkerSource(options: ExternalRecordSourceOptions): ExternalMarkerSource {
  const source = createSource(options, 'marker', MARKER.stride);
  const validation = new MarkerInstanceBuffer();
  validation.replace(source.bytes.subarray(0, source.count * MARKER.stride));
  if (!validation.ready) throw new RangeError('Marker source active records contain invalid values.');
  return source;
}

/** Wraps borrowed bytes using the canonical point record layout. */
export function createPointSource(options: ExternalRecordSourceOptions): ExternalPointSource {
  return createVertexSource(options, 'point', POINT);
}

/** Wraps borrowed bytes and immutable strings using the canonical label record layout. */
export function createLabelSource(options: ExternalLabelSourceOptions): ExternalLabelSource {
  const input = readSourceOptions(options);
  const capacity = getSourceCapacity({ ...input, stride: LABEL.stride });
  const texts = readLabelTexts(options, capacity);
  const source: ExternalLabelSource = {
    bytes: input.bytes,
    capacity,
    count: input.count,
    kind: 'label',
    texts
  };
  const validation = new VertexStreamBuffer(LABEL, { validateRecord: labelRecordIsValid });
  validation.replace(source.bytes, source.count);
  if (!validation.ready) throw new RangeError('Label source active records contain invalid values.');
  const state: PackedRecordState = { bytes: source.bytes, cacheable: false, version: 0 };
  registerExternalPackedRecordSource(source, state);
  registerLabelSourceTexts(source, texts);
  return Object.freeze(source);
}

/** Wraps borrowed bytes using the canonical line-vertex record layout. */
export function createLineVertexSource(options: ExternalRecordSourceOptions): ExternalLineVertexSource {
  return createVertexSource(options, 'line-vertex', LINE_VERTEX);
}

/** Wraps borrowed bytes using the canonical triangle-vertex record layout. */
export function createTriangleVertexSource(options: ExternalRecordSourceOptions): ExternalTriangleVertexSource {
  return createVertexSource(options, 'triangle-vertex', TRIANGLE_VERTEX);
}

function createVertexSource<Kind extends Exclude<PackedRecordKind, 'label' | 'marker'>>(
  options: ExternalRecordSourceOptions,
  kind: Kind,
  layout: LayoutDescriptor
): ExternalPackedRecordSource<Kind> {
  const source = createSource(options, kind, layout.stride);
  const validation = new VertexStreamBuffer(layout);
  validation.replace(source.bytes, source.count);
  if (!validation.ready) throw new RangeError(`${sourceLabel(kind)} active records contain invalid values.`);
  return source;
}

function createSource<Kind extends PackedRecordKind>(
  options: ExternalRecordSourceOptions,
  kind: Kind,
  stride: number
): ExternalPackedRecordSource<Kind> {
  const input = readSourceOptions(options);
  const { bytes, count } = input;
  const capacity = getSourceCapacity({ bytes, count, stride });
  const source: ExternalPackedRecordSource<Kind> = {
    bytes,
    capacity,
    count,
    kind
  };
  const state: PackedRecordState = { bytes, cacheable: false, version: 0 };
  registerExternalPackedRecordSource(source, state);
  return Object.freeze(source);
}

function readSourceOptions(options: ExternalRecordSourceOptions): {
  readonly bytes: Uint8Array;
  readonly count: number;
} {
  if (typeof options !== 'object' || options === null) {
    throw new TypeError('Packed source options must be an object.');
  }
  try {
    const bytes: unknown = Reflect.get(options, 'bytes');
    const count: unknown = Reflect.get(options, 'count');
    if (!(bytes instanceof Uint8Array)) throw new TypeError('Packed source bytes must be a Uint8Array.');
    if (typeof count !== 'number') throw new TypeError('Packed source count must be a number.');
    return { bytes, count };
  } catch (error) {
    if (error instanceof TypeError) throw error;
    throw new TypeError('Packed source options must be readable.', { cause: error });
  }
}

function readLabelTexts(options: ExternalLabelSourceOptions, capacity: number): readonly string[] {
  const value: unknown = Reflect.get(options, 'texts');
  if (!Array.isArray(value) || value.length !== capacity || !value.every(text => typeof text === 'string')) {
    throw new RangeError('Label source texts must contain one string for every record in capacity.');
  }
  return Object.freeze([...value]);
}

function getSourceCapacity(options: {
  readonly bytes: Uint8Array;
  readonly count: number;
  readonly stride: number;
}): number {
  const { bytes, count, stride } = options;
  if (!hasAccessibleStorage(bytes)) throw new TypeError('Packed source storage is unavailable.');
  if (isShared(bytes.buffer)) throw new TypeError('Packed sources do not accept shared memory.');
  if (bytes.byteLength % stride !== 0) {
    throw new RangeError('Packed source bytes must align to the canonical record stride.');
  }
  const capacity = bytes.byteLength / stride;
  if (!Number.isInteger(count) || count < 0 || count > capacity) {
    throw new RangeError('Packed source count must be a nonnegative integer within capacity.');
  }
  return capacity;
}

function hasAccessibleStorage(bytes: Uint8Array): boolean {
  try {
    new DataView(bytes.buffer, bytes.byteOffset, 0);
    return true;
  } catch {
    return false;
  }
}

function isShared(buffer: ArrayBufferLike): boolean {
  return typeof SharedArrayBuffer !== 'undefined' && buffer instanceof SharedArrayBuffer;
}

function sourceLabel(kind: PackedRecordKind): string {
  return kind
    .split('-')
    .map(part => `${part[0]?.toUpperCase() ?? ''}${part.slice(1)}`)
    .join(' ');
}
