// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { readRGBA8 } from '../src/internal/color/rgba8.js';
import { registerSceneFeatureIdSource } from '../src/internal/interaction/feature-ids.js';
import type { Vec3 } from '../src/internal/math/types.js';
import { LINE_VERTEX, MARKER, POINT } from '../src/internal/records/layouts/built-ins.js';
import {
  registerExternalPackedRecordSource,
  type ExternalPackedRecordSource
} from '../src/internal/records/packed-record-source.js';

function record(bytes: ArrayBufferView, index: number, stride: number): DataView {
  return new DataView(bytes.buffer, bytes.byteOffset + index * stride, stride);
}

function vector(view: DataView, offset: number): Vec3 {
  return [view.getFloat32(offset, true), view.getFloat32(offset + 4, true), view.getFloat32(offset + 8, true)];
}

export function readMarker(bytes: ArrayBufferView, index: number) {
  const view = record(bytes, index, MARKER.stride);
  return {
    position: vector(view, 0),
    orientation: [
      view.getFloat32(12, true),
      view.getFloat32(16, true),
      view.getFloat32(20, true),
      view.getFloat32(24, true)
    ],
    scale: vector(view, 28),
    color: readRGBA8(view, 40),
    outlineColor: readRGBA8(view, 44)
  };
}

export function readPoint(bytes: ArrayBufferView, index: number) {
  const view = record(bytes, index, POINT.stride);
  return { position: vector(view, 0), color: readRGBA8(view, 12) };
}

export function readLineVertex(bytes: ArrayBufferView, index: number) {
  const view = record(bytes, index, LINE_VERTEX.stride);
  return {
    position: vector(view, 0),
    color: readRGBA8(view, 12),
    normal: vector(view, 16),
    width: view.getFloat32(28, true),
    dash: view.getFloat32(32, true),
    gap: view.getFloat32(36, true)
  };
}

export const readTriangleVertex = readPoint;

export function createExternalRecordFixture<Kind extends 'marker' | 'point' | 'triangle-vertex'>(
  kind: Kind,
  options: { readonly bytes: Uint8Array; readonly count: number }
): ExternalPackedRecordSource<Kind> {
  const { bytes, count } = options;
  const source = {
    bytes,
    count,
    capacity: bytes.byteLength / (kind === 'marker' ? MARKER.stride : POINT.stride),
    kind,
    featureIds: null
  };
  registerExternalPackedRecordSource(source, { bytes, cacheable: false, version: 0 });
  registerSceneFeatureIdSource(source, source.capacity);
  return source;
}
