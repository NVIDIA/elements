// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { MarkerInstanceBuffer, PreparedMarkerSnapshot } from './instance-buffer.js';
import { getPackedRecordState, type PackedRecordSource } from './packed-record-source.js';
import type { PreparedVertexSnapshot, VertexStreamBuffer } from './vertex-stream.js';
import type { MarkerBuffer } from './markers/buffer.js';

interface PreparedMarkerEntry {
  readonly snapshot: PreparedMarkerSnapshot;
  readonly version: number;
}

interface PreparedVertexEntry {
  readonly snapshot: PreparedVertexSnapshot;
  readonly version: number;
}

const markerSources = new WeakMap<MarkerBuffer, PreparedMarkerEntry>();
const vertexSources = new WeakMap<PackedRecordSource, PreparedVertexEntry>();

/** Replaces a marker target and reports whether it created the cached prepared snapshot. */
export function replacePreparedMarkerSource(target: MarkerInstanceBuffer, source: MarkerBuffer): boolean {
  const state = getPackedRecordState(source);
  if (!state?.cacheable) {
    target.replace(state?.bytes ?? source.bytes);
    return false;
  }
  const prepared = markerSources.get(source);
  if (prepared?.version === state.version) {
    target.replacePrepared(state.bytes, prepared.snapshot);
    return false;
  }
  target.replace(state.bytes);
  const snapshot = target.createPreparedSnapshot();
  if (snapshot) markerSources.set(source, { snapshot, version: state.version });
  return snapshot !== null;
}

/** Replaces a vertex target and reports whether it created the cached prepared snapshot. */
export function replacePreparedVertexSource(
  target: VertexStreamBuffer,
  source: PackedRecordSource,
  sourceCount: number
): boolean {
  const state = getPackedRecordState(source);
  if (!state?.cacheable) {
    target.replace(state?.bytes ?? source.bytes, sourceCount);
    return false;
  }
  const prepared = vertexSources.get(source);
  if (prepared?.version === state.version && prepared.snapshot.layoutName === target.layout.name) {
    target.replacePrepared(state.bytes, sourceCount, prepared.snapshot);
    return false;
  }
  target.replace(state.bytes, sourceCount);
  const snapshot = target.createPreparedSnapshot();
  if (snapshot) vertexSources.set(source, { snapshot, version: state.version });
  return snapshot !== null;
}
