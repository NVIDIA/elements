// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { FEATURE_ID_MAP_INVALID } from '../errors.js';
import { DiagnosticEpisodes } from './diagnostic-episodes.js';
import { notifyOwningScene } from './scene/notifications.js';

/** Maps logical layer targets to stable, application-owned uint32 identities. */
export interface SceneFeatureIdMap {
  /** Scene copies these producer values when an application assigns the property. */
  readonly values: Uint32Array;
  /** First value index. Defaults to zero. */
  readonly offset?: number;
  /** Value-index distance between mapped groups. Defaults to one. */
  readonly stride?: number;
  /** Number of consecutive logical targets that share a value. Defaults to one. */
  readonly repeat?: number;
  /** Optional value that represents a target without application identity. */
  readonly nullFeatureId?: number;
}

/**
 * Stable identities assigned to a layer's logical pick targets. A number
 * broadcasts to every target, an array maps directly by target index, and a
 * descriptor maps target i from offset + floor(i / repeat) * stride.
 */
export type SceneFeatureIds = number | Uint32Array | SceneFeatureIdMap;

export type SceneFeatureIdSnapshot =
  | { readonly kind: 'scalar'; readonly value: number }
  | { readonly kind: 'direct'; readonly values: Uint32Array }
  | {
      readonly kind: 'map';
      readonly values: Uint32Array;
      readonly offset: number;
      readonly stride: number;
      readonly repeat: number;
      readonly nullFeatureId?: number;
    };

interface FeatureIdLayerState {
  readonly episodes: DiagnosticEpisodes;
  snapshot: SceneFeatureIdSnapshot | null;
  source: SceneFeatureIds | null;
  version: number;
}

const states = new WeakMap<HTMLElement, FeatureIdLayerState>();

export function registerSceneFeatureIdLayer(layer: HTMLElement): void {
  states.set(layer, {
    episodes: new DiagnosticEpisodes(),
    snapshot: null,
    source: null,
    version: 0
  });
}

export function getSceneFeatureIds(layer: HTMLElement): SceneFeatureIds | null {
  return getState(layer).source;
}

/** Captures producer-owned values before publishing a new feature identity generation. */
export function setSceneFeatureIds(layer: HTMLElement, source: SceneFeatureIds | null): void {
  const snapshot = source === null ? null : captureFeatureIds(source);
  const state = getState(layer);
  if (source === null && state.source === null) return;
  state.snapshot = snapshot;
  state.source = source;
  state.version += 1;
  notifyOwningScene(layer);
}

export function getSceneFeatureIdVersion(layer: HTMLElement): number {
  return states.get(layer)?.version ?? 0;
}

/** Captures the already-owned mapping into a render frame and updates coverage diagnostics. */
export function takeSceneFeatureIdSnapshot(
  layer: HTMLElement,
  targetCount: number
): SceneFeatureIdSnapshot | undefined {
  const state = states.get(layer);
  if (!state) return undefined;
  const snapshot = state.snapshot;
  const insufficient = snapshot !== null && !snapshotCoversTargets(snapshot, targetCount);
  state.episodes.update({
    active: insufficient,
    code: FEATURE_ID_MAP_INVALID,
    element: layer,
    message: 'Feature IDs do not cover every logical target in the layer.',
    severity: 'warning'
  });
  return snapshot ?? undefined;
}

/** Resolves one logical target without expanding compressed mappings or allocating lookup objects. */
export function resolveSceneFeatureId(
  snapshot: SceneFeatureIdSnapshot | undefined,
  targetIndex: number
): number | undefined {
  if (!snapshot) return undefined;
  if (snapshot.kind === 'scalar') return snapshot.value;
  if (snapshot.kind === 'direct') return snapshot.values[targetIndex];
  const valueIndex = snapshot.offset + Math.floor(targetIndex / snapshot.repeat) * snapshot.stride;
  const value = snapshot.values[valueIndex];
  return value === undefined || value === snapshot.nullFeatureId ? undefined : value;
}

function captureFeatureIds(source: SceneFeatureIds): SceneFeatureIdSnapshot {
  if (typeof source === 'number') {
    assertUint32(source, 'Feature ID');
    return Object.freeze({ kind: 'scalar', value: source });
  }
  if (source instanceof Uint32Array) {
    return Object.freeze({ kind: 'direct', values: captureValues(source) });
  }
  if (typeof source !== 'object' || source === null) {
    throw new TypeError('Feature IDs must be a uint32 ID, Uint32Array, descriptor, or null.');
  }
  return captureMap(source);
}

function captureMap(source: SceneFeatureIdMap): SceneFeatureIdSnapshot {
  const values = source.values;
  if (!(values instanceof Uint32Array)) {
    throw new TypeError('Feature ID map values must be a Uint32Array.');
  }
  const offset = optionalIndex(source.offset, 'Feature ID map offset', { allowZero: true, fallback: 0 });
  const stride = optionalIndex(source.stride, 'Feature ID map stride', { allowZero: false, fallback: 1 });
  const repeat = optionalIndex(source.repeat, 'Feature ID map repeat', { allowZero: false, fallback: 1 });
  const nullFeatureId = source.nullFeatureId;
  if (nullFeatureId !== undefined) assertUint32(nullFeatureId, 'Null feature ID');
  const captured = captureValues(values);
  return Object.freeze({
    kind: 'map',
    values: captured,
    offset,
    stride,
    repeat,
    ...(nullFeatureId === undefined ? {} : { nullFeatureId })
  });
}

function captureValues(values: Uint32Array): Uint32Array {
  try {
    return new Uint32Array(values);
  } catch {
    throw new TypeError('Feature ID values must have readable storage.');
  }
}

function optionalIndex(
  value: number | undefined,
  name: string,
  options: { readonly allowZero: boolean; readonly fallback: number }
): number {
  if (value === undefined) return options.fallback;
  if (!Number.isSafeInteger(value) || value < (options.allowZero ? 0 : 1)) {
    throw new RangeError(`${name} must be ${options.allowZero ? 'a nonnegative' : 'a positive'} safe integer.`);
  }
  return value;
}

function assertUint32(value: number, name: string): void {
  if (!Number.isInteger(value) || value < 0 || value > 0xffffffff) {
    throw new RangeError(`${name} must be an unsigned 32-bit integer.`);
  }
}

function snapshotCoversTargets(snapshot: SceneFeatureIdSnapshot, targetCount: number): boolean {
  if (snapshot.kind === 'scalar' || targetCount === 0) return true;
  if (snapshot.kind === 'direct') return targetCount <= snapshot.values.length;
  const lastIndex = snapshot.offset + Math.floor((targetCount - 1) / snapshot.repeat) * snapshot.stride;
  return Number.isSafeInteger(lastIndex) && lastIndex < snapshot.values.length;
}

function getState(layer: HTMLElement): FeatureIdLayerState {
  const state = states.get(layer);
  if (!state) throw new TypeError('Element is not a registered feature ID layer.');
  return state;
}
