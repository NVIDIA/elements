// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { LAYER_CHILD, LINES_COUNT } from '../errors.js';
import type { LayoutDescriptor } from './layouts/define-layout.js';
import { LINE_VERTEX } from './layouts/built-ins.js';
import { DiagnosticEpisodes } from './diagnostic-episodes.js';
import {
  lineCountIsValid,
  lineRecordHasTransparency,
  lineRecordIsOpaque,
  lineRecordIsValid,
  type LineTopology,
  type LineWidthUnit
} from './lines/data.js';
import { VertexStreamBuffer, type VertexStreamIssue, type VertexStreamRenderData } from './vertex-stream.js';
import { notifyOwningScene } from './label/notifications.js';
import {
  PACKED_RECORD_SOURCE,
  isPackedRecordSource,
  type PackedRecordKind,
  type PackedRecordSource
} from './packed-record-source.js';
import { replacePreparedVertexSource } from './prepared-record-source.js';

export type StreamingLayerKind = 'point' | 'line' | 'triangle';

interface StreamingLayerOptions {
  readonly allowChildren?: boolean;
  readonly kind: StreamingLayerKind;
  readonly layout: LayoutDescriptor;
  readonly countDivisor?: number;
  readonly topology?: LineTopology;
  readonly widthUnit?: LineWidthUnit;
  /** Internal ID-pass participation. It deliberately has no element API. */
  readonly pickable?: boolean;
  /** Internal color-pass depth bias. It deliberately has no element API. */
  readonly depthBias?: boolean;
}

export interface StreamingLayerRenderData extends VertexStreamRenderData {
  readonly kind: StreamingLayerKind;
  readonly depthBias: boolean;
  readonly pickable: boolean;
  readonly topology: LineTopology;
  readonly widthUnit: LineWidthUnit;
}

interface StreamingLayerState {
  buffer: VertexStreamBuffer;
  readonly episodes: DiagnosticEpisodes;
  readonly kind: StreamingLayerKind;
  readonly allowChildren: boolean;
  readonly depthBias: boolean;
  readonly pickable: boolean;
  topology: LineTopology;
  widthUnit: LineWidthUnit;
  childError: boolean;
  mutationObserver?: MutationObserver;
  source: StreamingLayerSource | null;
  streamedCount: number;
}

export type StreamingLayerSource = ArrayBufferView | PackedRecordSource;

const states = new WeakMap<HTMLElement, StreamingLayerState>();

export function registerStreamingLayer(layer: HTMLElement, options: StreamingLayerOptions): void {
  states.set(layer, {
    allowChildren: options.allowChildren ?? false,
    buffer: createVertexStreamBuffer(options),
    childError: false,
    depthBias: options.depthBias ?? false,
    episodes: new DiagnosticEpisodes(),
    kind: options.kind,
    pickable: options.pickable ?? true,
    source: null,
    streamedCount: 0,
    topology: options.topology ?? 'strip',
    widthUnit: options.widthUnit ?? 'world'
  });
}

export function connectStreamingLayer(layer: HTMLElement): void {
  const state = getState(layer);
  state.mutationObserver = new MutationObserver(() => reconcileChildren(layer, state));
  state.mutationObserver.observe(layer, { childList: true });
  reconcileChildren(layer, state);
}

export function disconnectStreamingLayer(layer: HTMLElement): void {
  getState(layer).mutationObserver?.disconnect();
}

export function getStreamingLayerSource(layer: HTMLElement): StreamingLayerSource | null {
  return getState(layer).source;
}

export function setStreamingLayerSource(layer: HTMLElement, source: StreamingLayerSource | null): void {
  const state = getState(layer);
  assertMatchingSource(state.kind, source);
  state.source = source;
  replaceStreamedBuffer(state, source);
  updateDataDiagnostics(layer, state);
  notifyOwningScene(layer);
}

export function getStreamingLayerCount(layer: HTMLElement): number | undefined {
  return getState(layer).buffer.count;
}

export function setStreamingLayerCount(layer: HTMLElement, count: number | undefined): void {
  const state = getState(layer);
  if (count !== undefined && isPackedRecordSource(state.source) && count > state.streamedCount) {
    throw new RangeError('The streamed vertex count cannot exceed the committed buffer count.');
  }
  state.buffer.setCount(count);
  updateDataDiagnostics(layer, state);
  notifyOwningScene(layer);
}

export function commitStreamingLayer(layer: HTMLElement, start = 0, count?: number): void {
  const state = getState(layer);
  state.buffer.commit(start, count);
  if (isPackedRecordSource(state.source)) {
    const commitEnd = start + (count ?? state.buffer.capacity - start);
    if (start <= state.streamedCount && commitEnd > state.streamedCount) {
      state.streamedCount = Math.min(state.source.count, commitEnd);
      state.buffer.setSourceCount(state.streamedCount);
    }
  }
  updateDataDiagnostics(layer, state);
  notifyOwningScene(layer);
}

export function getStreamingLineTopology(layer: HTMLElement): LineTopology {
  return getLineState(layer).topology;
}

export function setStreamingLineTopology(layer: HTMLElement, topology: LineTopology): void {
  const state = getLineState(layer);
  state.topology = topology;
  updateDataDiagnostics(layer, state);
  notifyOwningScene(layer);
}

export function getStreamingLineWidthUnit(layer: HTMLElement): LineWidthUnit {
  return getLineState(layer).widthUnit;
}

export function setStreamingLineWidthUnit(layer: HTMLElement, widthUnit: LineWidthUnit): void {
  const state = getLineState(layer);
  state.widthUnit = widthUnit;
  notifyOwningScene(layer);
}

export function getStreamingLayerKind(layer: HTMLElement): StreamingLayerKind {
  return getState(layer).kind;
}

/** Returns the mutation version without consuming pending upload ranges. */
export function getStreamingLayerVersion(layer: HTMLElement): number {
  return getState(layer).buffer.getVersion();
}

export function takeStreamingLayerRenderData(layer: HTMLElement): StreamingLayerRenderData {
  const state = getState(layer);
  const countValid = lineCountIsValidForState(state);
  // Keep ranges queued while structural errors make the layer inert. This
  // lets recovery upload bytes changed during the invalid episode.
  const data = state.buffer.toRenderData({ consumeUploadRanges: !state.childError && countValid });
  updateDataDiagnostics(layer, state);
  const issues = new Set<VertexStreamIssue>(data.issues);
  const ready = !state.childError && countValid && data.ready;
  const passes = getStreamPasses(state, data, ready);
  return {
    ...data,
    count: ready ? data.count : 0,
    depthBias: state.depthBias,
    issues,
    kind: state.kind,
    opaque: passes.opaque,
    pickable: state.pickable,
    ready,
    topology: state.topology,
    transparent: passes.transparent,
    widthUnit: state.widthUnit
  };
}

interface StreamPasses {
  readonly opaque: boolean;
  readonly transparent: boolean;
}

function createVertexStreamBuffer(options: StreamingLayerOptions): VertexStreamBuffer {
  const shared = { requireCountMultipleOf: options.countDivisor };
  if (options.kind !== 'line' || options.layout !== LINE_VERTEX) {
    return new VertexStreamBuffer(options.layout, shared);
  }
  return new VertexStreamBuffer(options.layout, {
    ...shared,
    opaqueRecord: lineRecordIsOpaque,
    transparentRecord: lineRecordHasTransparency,
    validateRecord: lineRecordIsValid
  });
}

function getStreamPasses(state: StreamingLayerState, data: VertexStreamRenderData, ready: boolean): StreamPasses {
  if (!ready) return { opaque: false, transparent: false };
  if (state.kind !== 'line') return { opaque: data.opaque, transparent: data.transparent };
  const count = state.topology === 'loop' ? data.count : Math.max(0, data.count - 1);
  const evenOnly = state.topology === 'segments';
  return {
    opaque: state.buffer.hasOpacity(count, evenOnly),
    transparent: state.buffer.hasTransparency(count, evenOnly)
  };
}

export function isStreamingLayerRegistered(layer: HTMLElement): boolean {
  return states.has(layer);
}

function reconcileChildren(layer: HTMLElement, state: StreamingLayerState): void {
  state.childError = !state.allowChildren && layer.children.length > 0;
  state.episodes.update({
    active: state.childError,
    code: LAYER_CHILD,
    element: layer,
    message: 'Streaming layers do not accept element children.',
    severity: 'error'
  });
  notifyOwningScene(layer);
}

function updateDataDiagnostics(layer: HTMLElement, state: StreamingLayerState): void {
  const issues = state.buffer.getIssues();
  for (const code of ['layout-stride-mismatch', 'layout-value-invalid', 'triangles-count'] as const) {
    state.episodes.update({
      active: issues.has(code),
      code,
      element: layer,
      message:
        code === 'triangles-count'
          ? 'Triangle vertex count must be divisible by three.'
          : code === 'layout-stride-mismatch'
            ? 'Streamed vertex bytes must align to the layout stride.'
            : 'Streamed vertex fields contain invalid values.',
      severity: 'error'
    });
  }
  state.episodes.update({
    active: !lineCountIsValidForState(state),
    code: LINES_COUNT,
    element: layer,
    message: 'Loop lines need at least three vertices, and segment lines need complete vertex pairs.',
    severity: 'error'
  });
}

function lineCountIsValidForState(state: StreamingLayerState): boolean {
  return state.kind !== 'line' || lineCountIsValid(state.buffer.effectiveCount, state.topology);
}

function replaceStreamedBuffer(state: StreamingLayerState, source: StreamingLayerSource | null): void {
  if (!isPackedRecordSource(source)) {
    state.streamedCount = source === null ? 0 : Math.floor(source.byteLength / state.buffer.layout.stride);
    state.buffer.replace(source);
    return;
  }
  state.streamedCount = source.count;
  replacePreparedVertexSource(state.buffer, source, source.count);
}

function getLineState(layer: HTMLElement): StreamingLayerState {
  const state = getState(layer);
  if (state.kind !== 'line') throw new TypeError('Element is not a streamed line layer.');
  return state;
}

function getState(layer: HTMLElement): StreamingLayerState {
  const state = states.get(layer);
  if (!state) {
    throw new TypeError('Element is not a registered streaming layer.');
  }
  return state;
}

function assertMatchingSource(kind: StreamingLayerKind, source: StreamingLayerSource | null): void {
  if (source === null || ArrayBuffer.isView(source)) {
    return;
  }
  if (!isPackedRecordSource(source)) {
    throw new TypeError('A streamed vertex source must be an ArrayBufferView, a matching record buffer, or null.');
  }
  const expectedKind: PackedRecordKind =
    kind === 'point' ? 'point' : kind === 'line' ? 'line-vertex' : 'triangle-vertex';
  if (source[PACKED_RECORD_SOURCE] !== expectedKind) {
    throw new TypeError(`The ${kind} layer requires a ${expectedKind} record buffer.`);
  }
}
