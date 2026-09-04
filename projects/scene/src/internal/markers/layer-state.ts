// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  LAYER_CHILD,
  LAYER_DUAL_SOURCE,
  LAYOUT_STRIDE_MISMATCH,
  LAYOUT_VALUE_INVALID,
  type SceneErrorCode
} from '../../errors.js';
import { MARKER } from '../layouts/built-ins.js';
import { writeMarker, type MarkerFields } from '../layouts/helpers.js';
import type { PrimitiveKind } from '../primitive-geometry.js';
import { DiagnosticEpisodes } from '../diagnostic-episodes.js';
import { MarkerInstanceBuffer, markerSourceRecordsAreValid } from '../instance-buffer.js';
import type { UploadRange } from '../upload-ranges.js';
import { registerMarkerLayerNotifications } from './layer-notifications.js';
import { compileMarker } from './state.js';
import { notifyOwningScene } from '../scene/notifications.js';
import type { MarkerSource } from './buffer.js';
import {
  getPackedRecordBytes,
  getPackedRecordKind,
  isPackedRecordSource,
  resolvePublishOptions,
  type AnyPackedRecordSource,
  type ScenePublishOptions
} from '../packed-record-source.js';
import { replacePreparedMarkerSource } from '../prepared-record-source.js';
import type { MarkerBounds } from './bounds.js';
import { SCENE_MARKER_TAG, SCENE_MODEL_TAG, SCENE_PART_TAG } from '../layer-tags.js';

interface MarkerLayerState {
  buffer: MarkerInstanceBuffer;
  readonly compiledFields: WeakMap<HTMLElement, MarkerFields>;
  readonly episodes: DiagnosticEpisodes;
  readonly kind: PrimitiveKind;
  childError: boolean;
  compiledMarkers: readonly HTMLElement[];
  count: number | undefined;
  markerBytes: Uint8Array | null;
  markerChildren: readonly HTMLElement[];
  mutationObserver?: MutationObserver;
  notifyCleanup?: () => void;
  pendingMarkers: Set<HTMLElement>;
  publicationError: boolean;
  reconcileQueued: boolean;
  streamedSource: MarkerSource | null;
  streamedCount: number;
  version: number;
}

export interface MarkerLayerRenderData {
  readonly bounds?: MarkerBounds | null;
  readonly bytes: Uint8Array | null;
  readonly count: number;
  readonly kind: PrimitiveKind;
  /** Element identities captured with declarative instance bytes. */
  readonly markers?: readonly HTMLElement[];
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
    compiledFields: new WeakMap(),
    compiledMarkers: [],
    count: undefined,
    episodes: new DiagnosticEpisodes(),
    kind,
    markerBytes: null,
    markerChildren: [],
    pendingMarkers: new Set(),
    publicationError: false,
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

export function getLayerInstances(layer: HTMLElement): MarkerSource | null {
  return getLayerState(layer).streamedSource;
}

export function setLayerInstances(layer: HTMLElement, value: MarkerSource | null): void {
  if (value !== null && !isMarkerSource(value)) {
    throw new TypeError('Layer instances must be a marker buffer, marker source, or null.');
  }
  const state = getLayerState(layer);
  state.streamedSource = value;
  state.publicationError = false;
  replaceStreamedBuffer(state, value);
  const replacementCount = value === null ? state.compiledMarkers.length : sourceCount(value);
  state.streamedCount = value === null ? 0 : replacementCount;
  const replacementCapacity = value === null ? state.compiledMarkers.length : sourceCapacity(value);
  if (state.count !== undefined && state.count > replacementCapacity) {
    state.count = undefined;
  }
  reconcileMarkerLayer(layer, state, true);
}

export function getLayerCount(layer: HTMLElement): number | undefined {
  return getLayerState(layer).count;
}

export function setLayerCount(layer: HTMLElement, value: number | undefined): void {
  const state = getLayerState(layer);
  const capacity = state.buffer.capacity;
  if (value !== undefined && (!Number.isInteger(value) || value < 0 || value > capacity)) {
    throw new RangeError('Layer count must be a nonnegative integer within capacity.');
  }
  if (value !== state.count) {
    state.count = value;
    state.version += 1;
    notifyOwningScene(layer);
  }
}

export function publishLayerInstances(layer: HTMLElement, options?: ScenePublishOptions): void {
  const state = getLayerState(layer);
  const source = state.streamedSource;
  if (source === null) return;
  const capacity = sourceCapacity(source);
  const resolved = resolvePublishOptions({
    capacity,
    currentActiveCount: state.streamedCount,
    requested: options,
    sourceActiveCount: isPackedRecordSource(source) ? source.count : state.streamedCount
  });
  state.publicationError = !markerPublicationIsValid(source, resolved.activeCount);
  if (!state.publicationError) {
    applyMarkerPublication(state, resolved);
  }
  updateBufferIssues(layer, state);
  state.version += 1;
  notifyOwningScene(layer);
}

function markerPublicationIsValid(source: MarkerSource, activeCount: number): boolean {
  try {
    return markerSourceRecordsAreValid(sourceBytes(source), activeCount);
  } catch {
    return false;
  }
}

function applyMarkerPublication(state: MarkerLayerState, resolved: ReturnType<typeof resolvePublishOptions>): void {
  state.buffer.commit(resolved.start, resolved.count);
  state.streamedCount = resolved.activeCount;
  state.buffer.setSourceCount(resolved.activeCount);
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
  const ready = !state.childError && !state.publicationError && state.buffer.ready;
  const publishedCount = getPublishedCount(state);
  const count = ready ? Math.min(state.count ?? publishedCount, publishedCount) : 0;
  const facePasses = getFacePasses(state.buffer, count, ready);
  const outlinePasses = getOutlinePasses(state.buffer, count, ready && state.kind === 'cube');
  return {
    bounds: ready ? state.buffer.getBounds(count) : null,
    bytes,
    count,
    kind: state.kind,
    markers: getDeclarativeMarkers(state),
    opaque: facePasses.opaque,
    outlineOpaque: outlinePasses.opaque,
    outlineTransparent: outlinePasses.transparent,
    outlineVisible: markerOutlineIsVisible(state, count, ready),
    ready,
    transparent: ready && state.buffer.hasPartialFaceAlpha(count),
    uploadRanges: ready ? state.buffer.takeUploadRanges() : [],
    version: state.version
  };
}

function getDeclarativeMarkers(state: MarkerLayerState): readonly HTMLElement[] | undefined {
  return state.streamedSource === null ? state.compiledMarkers : undefined;
}

function markerOutlineIsVisible(state: MarkerLayerState, count: number, ready: boolean): boolean {
  return ready && state.kind === 'cube' && state.buffer.hasVisibleOutlineAlpha(count);
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

/** Returns whether a decoded declarative marker still belongs to its original layer. */
export function isCurrentMarkerLayerMarker(layer: HTMLElement, marker: HTMLElement): boolean {
  const state = layerStates.get(layer);
  return (
    state !== undefined &&
    state.streamedSource === null &&
    !marker.hidden &&
    marker.parentElement === layer &&
    state.compiledMarkers.includes(marker)
  );
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
      layer.localName === SCENE_MODEL_TAG
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
  const membershipChanged = structural || !sameElements(markerChildren, state.markerChildren);
  if (membershipChanged || state.markerBytes === null) {
    compileAllMarkerChildren(state, markerChildren);
  } else {
    compileChangedMarkerChildren(state);
  }
  state.markerChildren = Object.freeze([...markerChildren]);
  updateBufferIssues(layer, state);
}

function compileAllMarkerChildren(state: MarkerLayerState, markerChildren: readonly HTMLElement[]): void {
  const compiled = markerChildren
    .map(marker => ({ marker, fields: compileMarker(marker) }))
    .filter((entry): entry is { marker: HTMLElement; fields: MarkerFields } => entry.fields !== null);
  for (const marker of markerChildren) state.compiledFields.delete(marker);
  for (const { marker, fields } of compiled) state.compiledFields.set(marker, fields);
  replaceCompiledMarkers(state, compiled);
}

function compileChangedMarkerChildren(state: MarkerLayerState): void {
  let validityChanged = false;
  for (const marker of state.pendingMarkers) {
    if (!state.markerChildren.includes(marker)) continue;
    const wasValid = state.compiledFields.has(marker);
    const fields = compileMarker(marker);
    if (fields) state.compiledFields.set(marker, fields);
    else state.compiledFields.delete(marker);
    validityChanged ||= wasValid !== Boolean(fields);
  }
  if (validityChanged) replaceCompiledMarkers(state, collectCompiledMarkers(state));
  else commitChangedMarkers(state);
}

function collectCompiledMarkers(state: MarkerLayerState): Array<{ marker: HTMLElement; fields: MarkerFields }> {
  return state.markerChildren.flatMap(marker => {
    const fields = state.compiledFields.get(marker);
    return fields ? [{ marker, fields }] : [];
  });
}

function commitChangedMarkers(state: MarkerLayerState): void {
  const markerBytes = state.markerBytes;
  if (!markerBytes) {
    return;
  }
  state.compiledMarkers.forEach((marker, index) => {
    if (state.pendingMarkers.has(marker)) {
      const fields = state.compiledFields.get(marker);
      if (!fields) return;
      writeMarker(markerBytes, index, fields);
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
  state.compiledMarkers = Object.freeze(compiled.map(entry => entry.marker));
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
    active: issues.has(LAYOUT_VALUE_INVALID) || state.publicationError,
    code: LAYOUT_VALUE_INVALID,
    layer,
    message: 'Marker data must contain finite values and a nonzero quaternion.',
    state
  });
}

function updateIssue(options: {
  active: boolean;
  code: SceneErrorCode;
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

function getPublishedCount(state: MarkerLayerState): number {
  return state.streamedSource === null ? state.compiledMarkers.length : state.streamedCount;
}

function replaceStreamedBuffer(state: MarkerLayerState, source: MarkerSource | null): void {
  if (source === null) {
    state.buffer.replace(null);
    return;
  }
  replacePreparedMarkerSource(state.buffer, source);
}

function sourceCount(source: MarkerSource): number {
  return source.count;
}

function sourceCapacity(source: MarkerSource): number {
  return source.capacity;
}

function sourceBytes(source: MarkerSource): Uint8Array {
  return getPackedRecordBytes(source);
}

function isMarkerSource(value: unknown): value is AnyPackedRecordSource<'marker'> {
  return isPackedRecordSource(value) && getPackedRecordKind(value) === 'marker';
}

function sameElements(left: readonly HTMLElement[], right: readonly HTMLElement[]): boolean {
  return left.length === right.length && left.every((element, index) => element === right[index]);
}

function isMarkerElement(element: Element): element is HTMLElement {
  return element.localName === SCENE_MARKER_TAG;
}

function isAllowedLayerChild(layer: HTMLElement, child: Element): boolean {
  return isMarkerElement(child) || (layer.localName === SCENE_MODEL_TAG && child.localName === SCENE_PART_TAG);
}

function getLayerState(layer: HTMLElement): MarkerLayerState {
  const state = layerStates.get(layer);
  if (!state) {
    throw new TypeError('Element is not a registered marker layer.');
  }
  return state;
}
