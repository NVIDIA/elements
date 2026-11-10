// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { LINE_VERTEX } from '../../records/layouts/built-ins.js';
import {
  registerExternalPackedRecordSource,
  type ExternalLineVertexSource,
  type ExternalPackedRecordSource,
  type PackedRecordKind,
  type PackedRecordState
} from '../../records/packed-record-source.js';
import { VertexStreamBuffer } from '../streaming/vertex-stream.js';
import type { LayoutDescriptor } from '../../records/layouts/define-layout.js';
import {
  getSceneFeatureIds,
  publishSceneFeatureIds,
  registerSceneFeatureIdSource,
  setSceneFeatureIds,
  type SceneFeatureIds
} from '../../interaction/feature-ids.js';

interface ExternalRecordSourceOptions {
  readonly bytes: Uint8Array;
  readonly count: number;
  readonly featureIds?: SceneFeatureIds | null;
}

/** Wraps borrowed bytes using the canonical line-vertex record layout. */
export function createLineVertexSource(options: ExternalRecordSourceOptions): ExternalLineVertexSource {
  return createVertexSource(options, 'line-vertex', LINE_VERTEX);
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
    kind,
    get featureIds() {
      return getSceneFeatureIds(source);
    }
  };
  const state: PackedRecordState = { bytes, cacheable: false, version: 0 };
  registerExternalPackedRecordSource(source, state);
  registerFeatureIds(source, capacity, options.featureIds);
  return Object.freeze(source);
}

function registerFeatureIds(source: object, capacity: number, featureIds: SceneFeatureIds | null | undefined): void {
  registerSceneFeatureIdSource(source, capacity);
  if (featureIds !== undefined) setSceneFeatureIds(source, featureIds);
  publishSceneFeatureIds(source);
}

function readSourceOptions(options: ExternalRecordSourceOptions): ExternalRecordSourceOptions {
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
