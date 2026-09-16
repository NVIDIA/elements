// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { LAYER_CHILD, LAYOUT_STRIDE_MISMATCH, LAYOUT_VALUE_INVALID, type SceneErrorCode } from '../../errors.js';
import { takeSceneFeatureIdSnapshot, type SceneFeatureIdSnapshot } from '../feature-ids.js';
import { MarkerInstanceBuffer, markerSourceRecordsAreValid } from '../instance-buffer.js';
import { SCENE_MODEL_TAG, SCENE_PART_TAG } from '../layer-tags.js';
import {
  getPackedRecordBytes,
  getPackedRecordKind,
  isPackedRecordSource,
  type AnyPackedRecordSource,
  type ScenePublishOptions
} from '../packed-record-source.js';
import {
  publishPackedSourceGeneration,
  resolvePackedSourcePublication,
  type PackedSourcePublication
} from '../packed-source-publication.js';
import { replacePreparedMarkerSource } from '../prepared-record-source.js';
import type { PrimitiveKind } from '../primitive-geometry.js';
import { notifyOwningScene } from '../scene/notifications.js';
import { diagnosticReporterService } from '../services/diagnostic-reporter.service.js';
import type { UploadRange } from '../upload-ranges.js';
import type { MarkerBounds } from './bounds.js';

interface MarkerLayerState {
  readonly buffer: MarkerInstanceBuffer;
  childError: boolean;
  count: number | undefined;
  readonly kind: PrimitiveKind;
  mutationObserver?: MutationObserver;
  publicationError: boolean;
  source: AnyPackedRecordSource<'marker'> | null;
  sourceCount: number;
  sourceVersion: number;
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
    count: undefined,
    kind,
    publicationError: false,
    source: null,
    sourceCount: 0,
    sourceVersion: -1,
    version: 0
  });
}

export function connectMarkerLayer(layer: HTMLElement): void {
  const state = getLayerState(layer);
  const observer = new MutationObserver(() => validateLayerChildren(layer, state));
  state.mutationObserver = observer;
  observer.observe(layer, { childList: true });
  validateLayerChildren(layer, state);
}

export function disconnectMarkerLayer(layer: HTMLElement): void {
  const state = getLayerState(layer);
  state.mutationObserver?.disconnect();
  state.mutationObserver = undefined;
}

export function getLayerInstances(layer: HTMLElement): AnyPackedRecordSource<'marker'> | null {
  return getLayerState(layer).source;
}

export function setLayerInstances(layer: HTMLElement, value: AnyPackedRecordSource<'marker'> | null): void {
  if (value !== null && !isMarkerSource(value)) {
    throw new TypeError('Layer instances must be a marker buffer, external marker source, or null.');
  }
  const state = getLayerState(layer);
  state.source = value;
  state.publicationError = false;
  replaceStreamedBuffer(state, value);
  state.sourceVersion = publishPackedSourceGeneration(value);
  state.sourceCount = value?.count ?? 0;
  if (state.count !== undefined && state.count > (value?.capacity ?? 0)) state.count = undefined;
  state.version += 1;
  updateBufferIssues(layer, state);
  notifyOwningScene(layer);
}

export function getLayerCount(layer: HTMLElement): number | undefined {
  return getLayerState(layer).count;
}

export function setLayerCount(layer: HTMLElement, value: number | undefined): void {
  const state = getLayerState(layer);
  const capacity = state.source?.capacity ?? 0;
  if (value !== undefined && (!Number.isInteger(value) || value < 0 || value > capacity)) {
    throw new RangeError('Layer count must be a nonnegative integer within capacity.');
  }
  if (value === state.count) return;
  state.count = value;
  state.version += 1;
  notifyOwningScene(layer);
}

export function publishLayerInstances(layer: HTMLElement, options?: ScenePublishOptions): void {
  const state = getLayerState(layer);
  const source = state.source;
  if (source === null) return;
  const publication = resolvePackedSourcePublication({
    currentActiveCount: state.sourceCount,
    currentSourceVersion: state.sourceVersion,
    requested: options,
    source,
    unavailableStateMessage: 'Packed marker source state is unavailable.'
  });
  state.publicationError = !markerPublicationIsValid(source, publication.resolved.activeCount);
  const visualChanged = applyValidPublication(source, state, publication);
  updateBufferIssues(layer, state);
  state.version += 1;
  notifyOwningScene(layer, visualChanged ? 'render' : 'identity');
}

export function isMarkerLayerRegistered(layer: HTMLElement): boolean {
  return layerStates.has(layer);
}

// eslint-disable-next-line complexity -- The render snapshot keeps independent pass flags explicit.
export function takeMarkerLayerRenderData(layer: HTMLElement): MarkerLayerRenderData {
  const state = getLayerState(layer);
  const bytes = state.buffer.getUploadBytes();
  const ready = !state.childError && !state.publicationError && state.source !== null && state.buffer.ready;
  const count = ready ? Math.min(state.count ?? state.sourceCount, state.sourceCount) : 0;
  const faces = getFacePasses(state.buffer, count, ready);
  const outlines = getOutlinePasses(state.buffer, count, ready && state.kind === 'cube');
  return {
    bounds: ready ? state.buffer.getBounds(count) : null,
    bytes,
    count,
    kind: state.kind,
    opaque: faces.opaque,
    outlineOpaque: outlines.opaque,
    outlineTransparent: outlines.transparent,
    outlineVisible: ready && state.kind === 'cube' && state.buffer.hasVisibleOutlineAlpha(count),
    ready,
    transparent: ready && state.buffer.hasPartialFaceAlpha(count),
    uploadRanges: ready ? state.buffer.takeUploadRanges() : [],
    version: state.version
  };
}

export function takeMarkerLayerFeatureIdSnapshot(
  layer: HTMLElement,
  targetCount: number
): SceneFeatureIdSnapshot | undefined {
  const source = getLayerState(layer).source;
  return source === null ? undefined : takeSceneFeatureIdSnapshot(source, targetCount, layer);
}

function applyValidPublication(
  source: AnyPackedRecordSource<'marker'>,
  state: MarkerLayerState,
  publication: PackedSourcePublication
): boolean {
  if (state.publicationError) return false;
  if (publication.geometryChanged) state.buffer.commit(publication.resolved.start, publication.resolved.count);
  state.sourceCount = publication.resolved.activeCount;
  state.buffer.setSourceCount(publication.resolved.activeCount);
  state.sourceVersion = publishPackedSourceGeneration(source, publication.sourceVersion);
  return publication.visualChanged;
}

function markerPublicationIsValid(source: AnyPackedRecordSource<'marker'>, activeCount: number): boolean {
  try {
    return markerSourceRecordsAreValid(getPackedRecordBytes(source), activeCount);
  } catch {
    return false;
  }
}

function validateLayerChildren(layer: HTMLElement, state: MarkerLayerState): void {
  state.childError = [...layer.children].some(
    child => layer.localName !== SCENE_MODEL_TAG || child.localName !== SCENE_PART_TAG
  );
  diagnosticReporterService.update({
    active: state.childError,
    code: LAYER_CHILD,
    element: layer,
    message:
      layer.localName === SCENE_MODEL_TAG
        ? 'Scene models allow only direct scene part children.'
        : 'Source-backed instance layers do not accept element children.',
    severity: 'error'
  });
  state.version += 1;
  notifyOwningScene(layer);
}

function updateBufferIssues(layer: HTMLElement, state: MarkerLayerState): void {
  const issues = state.buffer.getIssues();
  updateIssue({
    active: issues.has(LAYOUT_STRIDE_MISMATCH),
    code: LAYOUT_STRIDE_MISMATCH,
    layer,
    message: 'Instance bytes must align to the marker stride.'
  });
  updateIssue({
    active: issues.has(LAYOUT_VALUE_INVALID) || state.publicationError,
    code: LAYOUT_VALUE_INVALID,
    layer,
    message: 'Marker data must contain finite values and a nonzero quaternion.'
  });
}

function updateIssue(options: { active: boolean; code: SceneErrorCode; layer: HTMLElement; message: string }): void {
  diagnosticReporterService.update({
    active: options.active,
    code: options.code,
    element: options.layer,
    message: options.message,
    severity: 'error'
  });
}

interface RenderPasses {
  readonly opaque: boolean;
  readonly transparent: boolean;
}

function getFacePasses(buffer: MarkerInstanceBuffer, count: number, active: boolean): RenderPasses {
  return active
    ? { opaque: buffer.hasOpaqueFaceAlpha(count), transparent: buffer.hasPartialFaceAlpha(count) }
    : { opaque: false, transparent: false };
}

function getOutlinePasses(buffer: MarkerInstanceBuffer, count: number, active: boolean): RenderPasses {
  return active
    ? { opaque: buffer.hasOpaqueOutlineAlpha(count), transparent: buffer.hasPartialOutlineAlpha(count) }
    : { opaque: false, transparent: false };
}

function replaceStreamedBuffer(state: MarkerLayerState, source: AnyPackedRecordSource<'marker'> | null): void {
  if (source === null) state.buffer.replace(null);
  else replacePreparedMarkerSource(state.buffer, source);
}

function isMarkerSource(value: unknown): value is AnyPackedRecordSource<'marker'> {
  return isPackedRecordSource(value) && getPackedRecordKind(value) === 'marker';
}

function getLayerState(layer: HTMLElement): MarkerLayerState {
  const state = layerStates.get(layer);
  if (!state) throw new TypeError('Element is not a registered marker layer.');
  return state;
}
