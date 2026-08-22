// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { LAYER_CHILD, LINES_COUNT } from '../errors.js';
import type { LayoutDescriptor } from './layouts/define-layout.js';
import { LINE_VERTEX } from './layouts/built-ins.js';
import { DiagnosticEpisodes } from './diagnostic-episodes.js';
import {
  lineCountIsValid,
  lineRecordHasTransparency,
  lineRecordIsValid,
  type LineTopology,
  type LineWidthUnit
} from './lines/data.js';
import { VertexStreamBuffer, type VertexStreamIssue, type VertexStreamRenderData } from './vertex-stream.js';
import { notifyOwningScene } from './label/notifications.js';

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
  readonly buffer: VertexStreamBuffer;
  readonly episodes: DiagnosticEpisodes;
  readonly kind: StreamingLayerKind;
  readonly allowChildren: boolean;
  readonly depthBias: boolean;
  readonly pickable: boolean;
  topology: LineTopology;
  widthUnit: LineWidthUnit;
  childError: boolean;
  mutationObserver?: MutationObserver;
}

const states = new WeakMap<HTMLElement, StreamingLayerState>();

export function registerStreamingLayer(layer: HTMLElement, options: StreamingLayerOptions): void {
  states.set(layer, {
    allowChildren: options.allowChildren ?? false,
    buffer: new VertexStreamBuffer(options.layout, {
      requireCountMultipleOf: options.countDivisor,
      transparentRecord:
        options.kind === 'line' && options.layout === LINE_VERTEX ? lineRecordHasTransparency : undefined,
      validateRecord: options.kind === 'line' && options.layout === LINE_VERTEX ? lineRecordIsValid : undefined
    }),
    childError: false,
    depthBias: options.depthBias ?? false,
    episodes: new DiagnosticEpisodes(),
    kind: options.kind,
    pickable: options.pickable ?? true,
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

export function getStreamingLayerSource(layer: HTMLElement): ArrayBufferView | null {
  return getState(layer).buffer.source;
}

export function setStreamingLayerSource(layer: HTMLElement, source: ArrayBufferView | null): void {
  const state = getState(layer);
  state.buffer.replace(source);
  updateDataDiagnostics(layer, state);
  notifyOwningScene(layer);
}

export function getStreamingLayerCount(layer: HTMLElement): number | undefined {
  return getState(layer).buffer.count;
}

export function setStreamingLayerCount(layer: HTMLElement, count: number | undefined): void {
  const state = getState(layer);
  state.buffer.setCount(count);
  updateDataDiagnostics(layer, state);
  notifyOwningScene(layer);
}

export function commitStreamingLayer(layer: HTMLElement, start = 0, count?: number): void {
  const state = getState(layer);
  state.buffer.commit(start, count);
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
  return {
    ...data,
    count: ready ? data.count : 0,
    depthBias: state.depthBias,
    issues,
    kind: state.kind,
    pickable: state.pickable,
    ready,
    topology: state.topology,
    transparent:
      ready && state.kind === 'line'
        ? state.buffer.hasTransparency(
            state.topology === 'loop' ? data.count : Math.max(0, data.count - 1),
            state.topology === 'segments'
          )
        : data.transparent,
    widthUnit: state.widthUnit
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
