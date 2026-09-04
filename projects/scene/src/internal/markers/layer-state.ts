// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { LAYER_CHILD, LAYER_DUAL_SOURCE, LAYOUT_STRIDE_MISMATCH, LAYOUT_VALUE_INVALID } from '../../errors.js';
import { MARKER } from '../layouts/built-ins.js';
import { writeMarker, type MarkerFields } from '../layouts/helpers.js';
import type { PrimitiveKind } from '../primitive-geometry.js';
import { DiagnosticEpisodes } from '../diagnostic-episodes.js';
import { MarkerInstanceBuffer } from '../instance-buffer.js';
import type { UploadRange } from '../upload-ranges.js';
import { registerMarkerLayerNotifications } from './layer-notifications.js';
import { compileMarker } from './state.js';
import { notifyOwningScene } from '../label/notifications.js';
import type { MarkerBuffer, MarkerInstanceSource } from './buffer.js';
import { PACKED_RECORD_SOURCE, isPackedRecordSource } from '../packed-record-source.js';
import { replacePreparedMarkerSource } from '../prepared-record-source.js';
import type { MarkerBounds } from './bounds.js';

interface MarkerLayerState {
  buffer: MarkerInstanceBuffer;
  readonly episodes: DiagnosticEpisodes;
  readonly kind: PrimitiveKind;
  childError: boolean;
  compiledMarkers: HTMLElement[];
  count: number | undefined;
  markerBytes: Uint8Array | null;
  mutationObserver?: MutationObserver;
  notifyCleanup?: () => void;
  pendingMarkers: Set<HTMLElement>;
  reconcileQueued: boolean;
  streamedSource: MarkerInstanceSource | null;
  streamedCount: number;
  version: number;
}

export interface MarkerLayerRenderData {
  readonly bounds?: MarkerBounds | null;
  readonly bytes: Uint8Array | null;
  readonly count: number;
  readonly kind: PrimitiveKind;
  readonly opaque: boolean;
  readonly outlineOpaque: boolean;
  readonly outlineTransparent: boolean;
  readonly outlineVisible: boolean;
  readonly ready: boolean;
  readonly transparent: boolean;
  readonly uploadRanges: readonly UploadRange[];
  readonly version: number;
}

const layerStates = new WeakMap<HTMLElement, MarkerLayerState>();

export function registerMarkerLayer(layer: HTMLElement, kind: PrimitiveKind): void {
  layerStates.set(layer, {
    buffer: new MarkerInstanceBuffer(),
    childError: false,
    compiledMarkers: [],
    count: undefined,
    episodes: new DiagnosticEpisodes(),
    kind,
    markerBytes: null,
    pendingMarkers: new Set(),
    reconcileQueued: false,
    streamedSource: null,
    streamedCount: 0,
    version: 0
  });
}

export function connectMarkerLayer(layer: HTMLElement): void {
  const state = getLayerState(layer);
  const observer = new MutationObserver(records => handleLayerMutations(layer, state, records));
  state.mutationObserver = observer;
  observer.observe(layer, { attributes: true, childList: true, subtree: true });
  state.notifyCleanup = registerMarkerLayerNotifications(layer, marker => queueMarkerReconcile(layer, state, marker));
  // Native HTML parsing can connect the layer before its marker children upgrade.
  queueMicrotask(() => {
    if (state.mutationObserver === observer) {
      reconcileMarkerLayer(layer, state, true);
    }
  });
}

export function disconnectMarkerLayer(layer: HTMLElement): void {
  const state = getLayerState(layer);
  state.mutationObserver?.disconnect();
  state.mutationObserver = undefined;
  state.notifyCleanup?.();
  state.notifyCleanup = undefined;
}

export function getLayerInstances(layer: HTMLElement): MarkerInstanceSource | null {
  return getLayerState(layer).streamedSource;
}

export function setLayerInstances(layer: HTMLElement, value: MarkerInstanceSource | null): void {
  if (value !== null && !ArrayBuffer.isView(value) && !isMarkerBuffer(value)) {
    throw new TypeError('Layer instances must be an ArrayBufferView, MarkerBuffer, or null.');
  }
  const state = getLayerState(layer);
  state.streamedSource = value;
  replaceStreamedBuffer(state, value);
  const replacementCount = value === null ? state.compiledMarkers.length : sourceCount(value);
  state.streamedCount = value === null ? 0 : replacementCount;
  if (state.count !== undefined && state.count > replacementCount) {
    state.count = undefined;
  }
  reconcileMarkerLayer(layer, state, true);
}

export function getLayerCount(layer: HTMLElement): number | undefined {
  return getLayerState(layer).count;
}

export function setLayerCount(layer: HTMLElement, value: number | undefined): void {
  const state = getLayerState(layer);
  const capacity = getCapacity(state);
  if (value !== undefined && (!Number.isInteger(value) || value < 0 || value > capacity)) {
    throw new RangeError('Layer count must be a nonnegative integer within capacity.');
  }
  if (value !== state.count) {
    state.count = value;
    state.version += 1;
    notifyOwningScene(layer);
  }
}

export function commitLayerInstances(layer: HTMLElement, start = 0, count?: number): void {
  const state = getLayerState(layer);
  if (state.streamedSource === null) {
    return;
  }
  state.buffer.commit(start, count);
  const commitEnd = start + (count ?? state.buffer.capacity - start);
  if (start <= state.streamedCount && commitEnd > state.streamedCount) {
    state.streamedCount = Math.min(sourceCount(state.streamedSource), commitEnd);
  }
  if (state.count !== undefined && state.count > state.streamedCount) {
    state.count = undefined;
  }
  updateBufferIssues(layer, state);
  state.version += 1;
  notifyOwningScene(layer);
}

export function getMarkerLayerVersion(layer: HTMLElement): number {
  return getLayerState(layer).version;
}

export function isMarkerLayerRegistered(layer: HTMLElement): boolean {
  return layerStates.has(layer);
}

export function takeMarkerLayerRenderData(layer: HTMLElement): MarkerLayerRenderData {
  const state = getLayerState(layer);
  const bytes = state.buffer.getUploadBytes();
  const ready = !state.childError && state.buffer.ready;
  const capacity = getCapacity(state);
  const count = ready ? Math.min(state.count ?? capacity, capacity) : 0;
  const facePasses = getFacePasses(state.buffer, count, ready);
  const outlinePasses = getOutlinePasses(state.buffer, count, ready && state.kind === 'cube');
  return {
    bounds: ready ? state.buffer.getBounds(count) : null,
    bytes,
    count,
    kind: state.kind,
    opaque: facePasses.opaque,
    outlineOpaque: outlinePasses.opaque,
    outlineTransparent: outlinePasses.transparent,
    outlineVisible: ready && state.kind === 'cube' && state.buffer.hasVisibleOutlineAlpha(count),
    ready,
    transparent: ready && state.buffer.hasPartialFaceAlpha(count),
    uploadRanges: ready ? state.buffer.takeUploadRanges() : [],
    version: state.version
  };
}

interface RenderPasses {
  readonly opaque: boolean;
  readonly transparent: boolean;
}

function getFacePasses(buffer: MarkerInstanceBuffer, count: number, active: boolean): RenderPasses {
  if (!active) return { opaque: false, transparent: false };
  return { opaque: buffer.hasOpaqueFaceAlpha(count), transparent: buffer.hasPartialFaceAlpha(count) };
}

function getOutlinePasses(buffer: MarkerInstanceBuffer, count: number, active: boolean): RenderPasses {
  if (!active) return { opaque: false, transparent: false };
  return { opaque: buffer.hasOpaqueOutlineAlpha(count), transparent: buffer.hasPartialOutlineAlpha(count) };
}

/** Returns the element-authored marker at an instance index, when one exists. */
export function getMarkerLayerMarker(layer: HTMLElement, instanceIndex: number): HTMLElement | undefined {
  const state = getLayerState(layer);
  return state.streamedSource === null ? state.compiledMarkers[instanceIndex] : undefined;
}

function handleLayerMutations(layer: HTMLElement, state: MarkerLayerState, records: MutationRecord[]): void {
  const structural = records.some(record => record.type === 'childList');
  for (const record of records) {
    if (record.type === 'attributes' && record.target instanceof HTMLElement) {
      state.pendingMarkers.add(record.target);
    }
  }
  reconcileMarkerLayer(layer, state, structural);
}

function queueMarkerReconcile(layer: HTMLElement, state: MarkerLayerState, marker: HTMLElement): void {
  state.pendingMarkers.add(marker);
  if (!state.reconcileQueued) {
    state.reconcileQueued = true;
    queueMicrotask(() => {
      state.reconcileQueued = false;
      reconcileMarkerLayer(layer, state, false);
    });
  }
}

function reconcileMarkerLayer(layer: HTMLElement, state: MarkerLayerState, structural: boolean): void {
  const markerChildren = [...layer.children].filter(isMarkerElement);
  state.childError = [...layer.children].some(child => !isAllowedLayerChild(layer, child));
  state.episodes.update({
    element: layer,
    code: LAYER_CHILD,
    active: state.childError,
    message:
      layer.localName === 'nve-scene-model'
        ? 'Scene models allow only direct scene part and scene marker children.'
        : 'Instance layers allow only direct scene marker children.',
    severity: 'error'
  });
  const streamed = state.streamedSource !== null;
  state.episodes.update({
    element: layer,
    code: LAYER_DUAL_SOURCE,
    active: streamed && markerChildren.length > 0,
    message: 'The streamed instance source takes precedence over marker children.',
    severity: 'warning'
  });
  if (streamed) {
    updateBufferIssues(layer, state);
  } else {
    compileMarkerChildren({ layer, markerChildren, state, structural });
  }
  state.pendingMarkers.clear();
  state.version += 1;
  notifyOwningScene(layer);
}

function compileMarkerChildren(options: {
  layer: HTMLElement;
  markerChildren: HTMLElement[];
  state: MarkerLayerState;
  structural: boolean;
}): void {
  const { layer, markerChildren, state, structural } = options;
  const compiled = markerChildren
    .map(marker => ({ marker, fields: compileMarker(marker) }))
    .filter((entry): entry is { marker: HTMLElement; fields: MarkerFields } => entry.fields !== null);
  const nextMarkers = compiled.map(entry => entry.marker);
  const canCommit = !structural && sameElements(nextMarkers, state.compiledMarkers) && state.markerBytes !== null;
  if (canCommit) {
    commitChangedMarkers(state, compiled);
  } else {
    replaceCompiledMarkers(state, compiled);
  }
  state.compiledMarkers = nextMarkers;
  updateBufferIssues(layer, state);
}

function commitChangedMarkers(
  state: MarkerLayerState,
  compiled: Array<{ marker: HTMLElement; fields: MarkerFields }>
): void {
  const markerBytes = state.markerBytes;
  if (!markerBytes) {
    return;
  }
  compiled.forEach((entry, index) => {
    if (state.pendingMarkers.has(entry.marker)) {
      writeMarker(markerBytes, index, entry.fields);
      state.buffer.commit(index, 1);
    }
  });
}

function replaceCompiledMarkers(
  state: MarkerLayerState,
  compiled: Array<{ marker: HTMLElement; fields: MarkerFields }>
): void {
  const bytes = new Uint8Array(compiled.length * MARKER.stride);
  compiled.forEach((entry, index) => writeMarker(bytes, index, entry.fields));
  state.markerBytes = bytes;
  state.buffer.replace(bytes);
  if (state.count !== undefined && state.count > compiled.length) {
    state.count = undefined;
  }
}

function updateBufferIssues(layer: HTMLElement, state: MarkerLayerState): void {
  const issues = state.buffer.getIssues();
  updateIssue({
    active: issues.has(LAYOUT_STRIDE_MISMATCH),
    code: LAYOUT_STRIDE_MISMATCH,
    layer,
    message: 'Instance bytes must align to the marker stride.',
    state
  });
  updateIssue({
    active: issues.has(LAYOUT_VALUE_INVALID),
    code: LAYOUT_VALUE_INVALID,
    layer,
    message: 'Marker data must contain finite values and a nonzero quaternion.',
    state
  });
}

function updateIssue(options: {
  active: boolean;
  code: string;
  layer: HTMLElement;
  message: string;
  state: MarkerLayerState;
}): void {
  options.state.episodes.update({
    active: options.active,
    code: options.code,
    element: options.layer,
    message: options.message,
    severity: 'error'
  });
}

function getCapacity(state: MarkerLayerState): number {
  return state.streamedSource === null ? state.compiledMarkers.length : state.streamedCount;
}

function replaceStreamedBuffer(state: MarkerLayerState, source: MarkerInstanceSource | null): void {
  if (!isMarkerBuffer(source)) {
    state.buffer.replace(source);
    return;
  }
  replacePreparedMarkerSource(state.buffer, source);
}

function sourceCount(source: MarkerInstanceSource): number {
  return isMarkerBuffer(source) ? source.count : Math.floor(source.byteLength / MARKER.stride);
}

function isMarkerBuffer(value: unknown): value is MarkerBuffer {
  return isPackedRecordSource(value) && value[PACKED_RECORD_SOURCE] === 'marker';
}

function sameElements(left: readonly HTMLElement[], right: readonly HTMLElement[]): boolean {
  return left.length === right.length && left.every((element, index) => element === right[index]);
}

function isMarkerElement(element: Element): element is HTMLElement {
  return element.localName === 'nve-scene-marker';
}

function isAllowedLayerChild(layer: HTMLElement, child: Element): boolean {
  return isMarkerElement(child) || (layer.localName === 'nve-scene-model' && child.localName === 'nve-scene-part');
}

function getLayerState(layer: HTMLElement): MarkerLayerState {
  const state = layerStates.get(layer);
  if (!state) {
    throw new TypeError('Element is not a registered marker layer.');
  }
  return state;
}
