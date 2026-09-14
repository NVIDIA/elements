// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { MarkerInstanceBuffer, PreparedMarkerSnapshot } from './instance-buffer.js';
import { getPackedRecordState, type AnyPackedRecordSource } from './packed-record-source.js';
import type { PreparedVertexSnapshot, VertexStreamBuffer } from './vertex-stream.js';

interface PreparedMarkerEntry {
  readonly snapshot: PreparedMarkerSnapshot;
  readonly version: number;
}

interface PreparedVertexEntry {
  readonly snapshot: PreparedVertexSnapshot;
  readonly version: number;
}

const markerSources = new WeakMap<AnyPackedRecordSource<'marker'>, PreparedMarkerEntry>();
const vertexSources = new WeakMap<AnyPackedRecordSource, PreparedVertexEntry>();

/** Replaces a marker target, reusing a cached prepared snapshot when available. */
export function replacePreparedMarkerSource(
  target: MarkerInstanceBuffer,
  source: AnyPackedRecordSource<'marker'>
): void {
  const state = getPackedRecordState(source);
  if (!state) throw new TypeError('Packed marker source state is unavailable.');
  if (!state.cacheable) {
    target.replace(state.bytes, source.count);
    return;
  }
  const prepared = markerSources.get(source);
  if (prepared?.version === state.version) {
    target.replacePrepared(state.bytes, prepared.snapshot, source.count);
    return;
  }
  target.replace(state.bytes, source.count);
  const snapshot = target.createPreparedSnapshot();
  if (snapshot) markerSources.set(source, { snapshot, version: state.version });
}

/** Replaces a vertex target, reusing a cached prepared snapshot when available. */
export function replacePreparedVertexSource(
  target: VertexStreamBuffer,
  source: AnyPackedRecordSource,
  sourceCount: number
): void {
  const state = getPackedRecordState(source);
  if (!state) throw new TypeError('Packed vertex source state is unavailable.');
  if (!state.cacheable) {
    target.replace(state.bytes, sourceCount);
    return;
  }
  const prepared = vertexSources.get(source);
  if (prepared?.version === state.version && prepared.snapshot.layoutName === target.layout.name) {
    target.replacePrepared(state.bytes, sourceCount, prepared.snapshot);
    return;
  }
  target.replace(state.bytes, sourceCount);
  const snapshot = target.createPreparedSnapshot();
  if (snapshot) vertexSources.set(source, { snapshot, version: state.version });
}
