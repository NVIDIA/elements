// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { LAYER_CHILD, LAYOUT_STRIDE_MISMATCH, LAYOUT_VALUE_INVALID } from '../../errors.js';
import { DiagnosticEpisodes } from '../diagnostic-episodes.js';
import { LABEL } from '../layouts/built-ins.js';
import {
  getPackedRecordBytes,
  getPackedRecordKind,
  isPackedRecordSource,
  resolvePublishOptions
} from '../packed-record-source.js';
import { replacePreparedVertexSource } from '../prepared-record-source.js';
import { notifyOwningScene } from '../scene/notifications.js';
import { VertexStreamBuffer, type VertexStreamIssue } from '../vertex-stream.js';
import { hasVisibleLabelText, labelRecordIsValid } from './data.js';
import { getLabelSourceTexts } from './source.js';
import type { LabelSource } from './buffer.js';
import type { ScenePublishOptions } from '../packed-record-source.js';
import type { UploadRange } from '../upload-ranges.js';

export interface LabelLayerRenderData {
  readonly bytes: Uint8Array | null;
  readonly capacity: number;
  readonly count: number;
  readonly hasVisibleText: boolean;
  readonly opaque: false;
  readonly pickable: boolean;
  readonly ready: boolean;
  readonly sourceCount: number;
  readonly texts: readonly string[];
  readonly textVersion: number;
  readonly transparent: boolean;
  readonly uploadRanges: readonly UploadRange[];
  readonly version: number;
}

interface LabelLayerState {
  readonly buffer: VertexStreamBuffer;
  childError: boolean;
  readonly episodes: DiagnosticEpisodes;
  mutationObserver?: MutationObserver;
  publicationError: boolean;
  source: LabelSource | null;
  sourceCount: number;
  texts: string[];
  textVersion: number;
  version: number;
}

const states = new WeakMap<HTMLElement, LabelLayerState>();

export function registerLabelLayer(layer: HTMLElement): void {
  states.set(layer, {
    buffer: new VertexStreamBuffer(LABEL, { validateRecord: labelRecordIsValid }),
    childError: false,
    episodes: new DiagnosticEpisodes(),
    publicationError: false,
    source: null,
    sourceCount: 0,
    texts: [],
    textVersion: 0,
    version: 0
  });
}

export function connectLabelLayer(layer: HTMLElement): void {
  const state = getState(layer);
  state.mutationObserver = new MutationObserver(() => reconcileChildren(layer, state));
  state.mutationObserver.observe(layer, { childList: true });
  reconcileChildren(layer, state);
}

export function disconnectLabelLayer(layer: HTMLElement): void {
  getState(layer).mutationObserver?.disconnect();
}

export function getLabelLayerSource(layer: HTMLElement): LabelSource | null {
  return getState(layer).source;
}

export function setLabelLayerSource(layer: HTMLElement, source: LabelSource | null): void {
  const state = getState(layer);
  assertMatchingSource(source);
  state.source = source;
  state.publicationError = false;
  if (source === null) {
    state.buffer.replace(null);
    state.sourceCount = 0;
    state.texts = [];
  } else {
    replacePreparedVertexSource(state.buffer, source, source.count);
    state.sourceCount = source.count;
    state.texts = copySourceTexts(source);
  }
  state.textVersion += 1;
  state.version += 1;
  updateDiagnostics(layer, state);
  notifyOwningScene(layer);
}

export function getLabelLayerCount(layer: HTMLElement): number | undefined {
  return getState(layer).buffer.count;
}

export function setLabelLayerCount(layer: HTMLElement, count: number | undefined): void {
  const state = getState(layer);
  state.buffer.setCount(count);
  state.version += 1;
  updateDiagnostics(layer, state);
  notifyOwningScene(layer);
}

export function publishLabelLayer(layer: HTMLElement, options?: ScenePublishOptions): void {
  const state = getState(layer);
  const source = state.source;
  if (source === null) return;
  const resolved = resolvePublishOptions({
    capacity: source.capacity,
    currentActiveCount: state.sourceCount,
    requested: options,
    sourceActiveCount: source.count
  });
  const sourceBytes = getPackedRecordBytes(source);
  const candidateReady = state.buffer.sourceRecordsAreValid(sourceBytes, resolved.activeCount);
  state.publicationError = !candidateReady;
  if (!state.publicationError) applyPublication(state, source, resolved);
  updateDiagnostics(layer, state);
  notifyOwningScene(layer);
}

function applyPublication(
  state: LabelLayerState,
  source: LabelSource,
  resolved: { readonly activeCount: number; readonly count: number; readonly start: number }
): void {
  state.buffer.commit(resolved.start, resolved.count);
  const textChanged = copyPublishedTexts({ count: resolved.count, source, start: resolved.start, state });
  state.sourceCount = resolved.activeCount;
  state.buffer.setSourceCount(resolved.activeCount);
  if (textChanged) state.textVersion += 1;
  state.version += 1;
}

export function getLabelLayerVersion(layer: HTMLElement): number {
  return getState(layer).version;
}

export function takeLabelLayerRenderData(layer: HTMLElement): LabelLayerRenderData {
  const state = getState(layer);
  const data = state.buffer.toRenderData({ consumeUploadRanges: !state.childError && !state.publicationError });
  const ready = !state.childError && !state.publicationError && data.ready;
  const count = ready ? data.count : 0;
  const hasVisibleText = activeTextsHaveVisibleContent(state.texts, count);
  return {
    bytes: ready ? data.bytes : null,
    capacity: data.capacity,
    count,
    hasVisibleText,
    opaque: false,
    pickable: hasVisibleText,
    ready,
    sourceCount: state.sourceCount,
    texts: state.texts,
    textVersion: state.textVersion,
    transparent: hasVisibleText,
    uploadRanges: ready ? data.uploadRanges : [],
    version: state.version
  };
}

function activeTextsHaveVisibleContent(texts: readonly string[], count: number): boolean {
  for (let index = 0; index < count; index += 1) {
    if (hasVisibleLabelText(texts[index] ?? '')) return true;
  }
  return false;
}

export function isLabelLayerRegistered(layer: HTMLElement): boolean {
  return states.has(layer);
}

function copyPublishedTexts(options: {
  readonly count: number;
  readonly source: LabelSource;
  readonly start: number;
  readonly state: LabelLayerState;
}): boolean {
  const { count, source, start, state } = options;
  const sourceTexts = getLabelSourceTexts(source);
  if (!sourceTexts) throw new TypeError('Label source text is unavailable.');
  let changed = false;
  const end = start + count;
  if (state.texts.length !== source.capacity) {
    state.texts = Array.from<string>({ length: source.capacity }).fill('');
    changed = true;
  }
  for (let index = start; index < end; index += 1) {
    const text = sourceTexts[index] ?? '';
    if (state.texts[index] !== text) {
      state.texts[index] = text;
      changed = true;
    }
  }
  return changed;
}

function copySourceTexts(source: LabelSource): string[] {
  const texts = getLabelSourceTexts(source);
  if (!texts || texts.length !== source.capacity) throw new TypeError('Label source text is unavailable.');
  return [...texts];
}

function reconcileChildren(layer: HTMLElement, state: LabelLayerState): void {
  const childError = layer.children.length > 0;
  if (childError !== state.childError) state.version += 1;
  state.childError = childError;
  state.episodes.update({
    active: childError,
    code: LAYER_CHILD,
    element: layer,
    message: 'Label layers do not accept element children.',
    severity: 'error'
  });
  notifyOwningScene(layer);
}

function updateDiagnostics(layer: HTMLElement, state: LabelLayerState): void {
  const issues = state.buffer.getIssues();
  for (const code of [LAYOUT_STRIDE_MISMATCH, LAYOUT_VALUE_INVALID] as const) {
    state.episodes.update({
      active: issues.has(code as VertexStreamIssue) || (code === LAYOUT_VALUE_INVALID && state.publicationError),
      code,
      element: layer,
      message:
        code === LAYOUT_STRIDE_MISMATCH
          ? 'Streamed label bytes must align to the canonical record stride.'
          : 'Streamed label fields contain invalid values.',
      severity: 'error'
    });
  }
}

function assertMatchingSource(source: LabelSource | null): void {
  if (source === null) return;
  if (!isPackedRecordSource(source) || getPackedRecordKind(source) !== 'label' || !getLabelSourceTexts(source)) {
    throw new TypeError('Label layers require a label record source.');
  }
}

function getState(layer: HTMLElement): LabelLayerState {
  const state = states.get(layer);
  if (!state) throw new TypeError('Element is not a registered label layer.');
  return state;
}
