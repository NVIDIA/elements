// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { FEATURE_ID_MAP_INVALID } from '../errors.js';
import { diagnosticReporterService } from './services/diagnostic-reporter.service.js';

/** Maps logical source records to stable, application-owned uint32 identities. */
export interface SceneFeatureIdMap {
  /** Scene copies these producer values when an application assigns the property. */
  readonly values: Uint32Array;
  /** First value index. Defaults to zero. */
  readonly offset?: number;
  /** Value-index distance between mapped groups. Defaults to one. */
  readonly stride?: number;
  /** Number of consecutive logical targets that share a value. Defaults to one. */
  readonly repeat?: number;
  /** LSB-first validity bits. Omit to make every mapped value valid. */
  readonly validity?: Uint8Array;
}

/**
 * Stable identities assigned to a source's logical pick targets. A number
 * broadcasts to every target, an array maps directly by target index, and a
 * descriptor maps target i from offset + floor(i / repeat) * stride.
 */
export type SceneFeatureIds = number | Uint32Array | SceneFeatureIdMap;

export type SceneFeatureIdSnapshot =
  | { readonly kind: 'scalar'; readonly value: number }
  | { readonly kind: 'direct'; readonly values: Uint32Array; readonly validity?: Uint8Array }
  | {
      readonly kind: 'map';
      readonly values: Uint32Array;
      readonly offset: number;
      readonly stride: number;
      readonly repeat: number;
      readonly validity?: Uint8Array;
    };

interface MutableSceneFeatureIdSnapshot {
  readonly kind: 'direct';
  readonly values: Uint32Array;
  readonly validity: Uint8Array;
}

interface FeatureIdSourceState {
  readonly capacity: number;
  mutableSnapshot?: MutableSceneFeatureIdSnapshot;
  publishedSnapshot?: SceneFeatureIdSnapshot;
  publishedVersion: number;
  version: number;
  workingSnapshot?: SceneFeatureIdSnapshot;
}

interface FeatureIdListState {
  readonly snapshot?: SceneFeatureIdSnapshot;
  readonly versions: readonly number[];
}

const states = new WeakMap<object, FeatureIdSourceState>();
const listStates = new WeakMap<object, FeatureIdListState>();

/** Registers a record source and indexes its identities by logical record. */
export function registerSceneFeatureIdSource(source: object, capacity: number): void {
  if (!Number.isSafeInteger(capacity) || capacity < 0) {
    throw new RangeError('Feature ID source capacity must be a nonnegative safe integer.');
  }
  states.set(source, { capacity, publishedVersion: -1, version: 0 });
}

/** Returns a producer-safe copy of the source's current unpublished identity mapping. */
export function getSceneFeatureIds(source: object): SceneFeatureIds | null {
  const snapshot = getState(source).workingSnapshot;
  return snapshot ? copySnapshotAsFeatureIds(snapshot) : null;
}

/** Captures producer-owned values into a new unpublished identity generation. */
export function setSceneFeatureIds(source: object, featureIds: SceneFeatureIds | null): void {
  const state = getState(source);
  state.workingSnapshot = featureIds === null ? undefined : captureFeatureIds(featureIds);
  state.mutableSnapshot = undefined;
  state.version += 1;
}

/** Returns one current record identity without publishing it. */
export function getSceneFeatureId(source: object, index: number): number | undefined {
  const state = getState(source);
  assertFeatureIndex(index, state.capacity);
  return resolveSceneFeatureId(state.workingSnapshot, index);
}

/** Sets or clears one current record identity without changing packed geometry bytes. */
export function setSceneFeatureId(source: object, index: number, featureId: number | undefined): void {
  const state = getState(source);
  assertFeatureIndex(index, state.capacity);
  if (featureId !== undefined) assertSceneFeatureId(featureId, 'Feature ID');
  const previous = resolveSceneFeatureId(state.workingSnapshot, index);
  if (previous === featureId) return;
  const { validity, values } = materializeDenseState(state);
  if (featureId === undefined) {
    clearBit(validity, index);
  } else {
    values[index] = featureId;
    setBit(validity, index);
  }
  state.version += 1;
}

/** Publishes one immutable identity generation for all consumers of a source. */
export function publishSceneFeatureIds(source: object): void {
  const state = getState(source);
  if (state.publishedVersion === state.version) return;
  state.publishedSnapshot =
    state.workingSnapshot === undefined
      ? undefined
      : state.mutableSnapshot
        ? cloneSnapshot(state.mutableSnapshot)
        : state.workingSnapshot;
  state.publishedVersion = state.version;
}

/** Reads the published mapping into a render frame and updates coverage diagnostics. */
export function takeSceneFeatureIdSnapshot(
  source: object | null | undefined,
  targetCount: number,
  diagnosticElement?: HTMLElement
): SceneFeatureIdSnapshot | undefined {
  const snapshot = source ? states.get(source)?.publishedSnapshot : undefined;
  updateCoverageDiagnostic(snapshot, targetCount, diagnosticElement);
  return snapshot;
}

/** Captures published singular identities from a list of declarative records. */
export function takeSceneFeatureIdListSnapshot(
  sources: readonly object[],
  diagnosticElement?: HTMLElement
): SceneFeatureIdSnapshot | undefined {
  const cached = listStates.get(sources);
  if (cached && listVersionsMatch(sources, cached.versions)) {
    updateCoverageDiagnostic(cached.snapshot, sources.length, diagnosticElement);
    return cached.snapshot;
  }
  const versions = new Array<number>(sources.length);
  let values: Uint32Array | undefined;
  let validity: Uint8Array | undefined;
  sources.forEach((source, index) => {
    const state = states.get(source);
    versions[index] = state?.publishedVersion ?? -1;
    const featureId = resolveSceneFeatureId(state?.publishedSnapshot, 0);
    if (featureId === undefined) return;
    values ??= new Uint32Array(sources.length);
    validity ??= new Uint8Array(Math.ceil(sources.length / 8));
    values[index] = featureId;
    setBit(validity, index);
  });
  const snapshot = values && validity ? Object.freeze({ kind: 'direct' as const, values, validity }) : undefined;
  listStates.set(sources, { snapshot, versions });
  updateCoverageDiagnostic(snapshot, sources.length, diagnosticElement);
  return snapshot;
}

/** Resolves one logical target without expanding compressed mappings or allocating lookup objects. */
export function resolveSceneFeatureId(
  snapshot: SceneFeatureIdSnapshot | undefined,
  targetIndex: number
): number | undefined {
  if (!snapshot || !Number.isInteger(targetIndex) || targetIndex < 0) return undefined;
  if (snapshot.kind === 'scalar') return snapshot.value;
  const valueIndex =
    snapshot.kind === 'direct'
      ? targetIndex
      : snapshot.offset + Math.floor(targetIndex / snapshot.repeat) * snapshot.stride;
  if (valueIndex >= snapshot.values.length || !isValidValue(snapshot.validity, valueIndex)) return undefined;
  return snapshot.values[valueIndex];
}

export function assertSceneFeatureId(value: number, name = 'Feature ID'): void {
  if (!Number.isInteger(value) || value < 0 || value > 0xffffffff) {
    throw new RangeError(`${name} must be an unsigned 32-bit integer.`);
  }
}

function captureFeatureIds(source: SceneFeatureIds): SceneFeatureIdSnapshot {
  if (typeof source === 'number') {
    assertSceneFeatureId(source);
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
  const validity = source.validity;
  if (validity !== undefined) {
    if (!(validity instanceof Uint8Array)) {
      throw new TypeError('Feature ID map validity must be a Uint8Array.');
    }
    if (validity.byteLength < Math.ceil(values.length / 8)) {
      throw new RangeError('Feature ID map validity must contain one bit for every value.');
    }
  }
  return Object.freeze({
    kind: 'map',
    values: captureValues(values),
    offset,
    stride,
    repeat,
    ...(validity === undefined ? {} : { validity: captureValidity(validity, values.length) })
  });
}

function captureValues(values: Uint32Array): Uint32Array {
  try {
    return new Uint32Array(values);
  } catch {
    throw new TypeError('Feature ID values must have readable storage.');
  }
}

function captureValidity(validity: Uint8Array, valueCount: number): Uint8Array {
  try {
    return new Uint8Array(validity.slice(0, Math.ceil(valueCount / 8)));
  } catch {
    throw new TypeError('Feature ID validity must have readable storage.');
  }
}

function copySnapshotAsFeatureIds(snapshot: SceneFeatureIdSnapshot): SceneFeatureIds {
  if (snapshot.kind === 'scalar') return snapshot.value;
  if (snapshot.kind === 'direct') {
    const { validity } = snapshot;
    if (validity === undefined) return new Uint32Array(snapshot.values);
    return { values: new Uint32Array(snapshot.values), validity: new Uint8Array(validity) };
  }
  return {
    values: new Uint32Array(snapshot.values),
    offset: snapshot.offset,
    stride: snapshot.stride,
    repeat: snapshot.repeat,
    ...(snapshot.validity === undefined ? {} : { validity: new Uint8Array(snapshot.validity) })
  };
}

function cloneSnapshot(snapshot: SceneFeatureIdSnapshot): SceneFeatureIdSnapshot {
  if (snapshot.kind === 'scalar') return snapshot;
  return Object.freeze({
    ...snapshot,
    values: new Uint32Array(snapshot.values),
    ...(snapshot.validity === undefined ? {} : { validity: new Uint8Array(snapshot.validity) })
  });
}

function materializeDenseState(state: FeatureIdSourceState): MutableSceneFeatureIdSnapshot {
  if (state.mutableSnapshot) return state.mutableSnapshot;
  const values = new Uint32Array(state.capacity);
  const validity = new Uint8Array(Math.ceil(state.capacity / 8));
  for (let index = 0; index < state.capacity; index += 1) {
    const featureId = resolveSceneFeatureId(state.workingSnapshot, index);
    if (featureId === undefined) continue;
    values[index] = featureId;
    setBit(validity, index);
  }
  const snapshot = Object.freeze({ kind: 'direct' as const, values, validity });
  state.mutableSnapshot = snapshot;
  state.workingSnapshot = snapshot;
  return snapshot;
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

function snapshotCoversTargets(snapshot: SceneFeatureIdSnapshot, targetCount: number): boolean {
  if (snapshot.kind === 'scalar' || targetCount === 0) return true;
  if (snapshot.kind === 'direct') return targetCount <= snapshot.values.length;
  const lastIndex = snapshot.offset + Math.floor((targetCount - 1) / snapshot.repeat) * snapshot.stride;
  return Number.isSafeInteger(lastIndex) && lastIndex < snapshot.values.length;
}

function updateCoverageDiagnostic(
  snapshot: SceneFeatureIdSnapshot | undefined,
  targetCount: number,
  element: HTMLElement | undefined
): void {
  if (!element) return;
  diagnosticReporterService.update({
    active: snapshot !== undefined && !snapshotCoversTargets(snapshot, targetCount),
    code: FEATURE_ID_MAP_INVALID,
    element,
    message: 'Feature IDs do not cover every logical target in the source.',
    severity: 'warning'
  });
}

function listVersionsMatch(sources: readonly object[], versions: readonly number[]): boolean {
  return (
    sources.length === versions.length &&
    sources.every((source, index) => (states.get(source)?.publishedVersion ?? -1) === versions[index])
  );
}

function getState(source: object): FeatureIdSourceState {
  const state = states.get(source);
  if (!state) throw new TypeError('Object is not a registered feature ID source.');
  return state;
}

function assertFeatureIndex(index: number, capacity: number): void {
  if (!Number.isInteger(index) || index < 0 || index >= capacity) {
    throw new RangeError('Feature ID index must identify a record within capacity.');
  }
}

function isValidValue(validity: Uint8Array | undefined, index: number): boolean {
  return validity === undefined || bitIsSet(validity, index);
}

function bitIsSet(validity: Uint8Array, index: number): boolean {
  const byte = validity[index >> 3];
  return byte !== undefined && (byte & (1 << (index & 7))) !== 0;
}

function setBit(validity: Uint8Array, index: number): void {
  const byteIndex = index >> 3;
  validity[byteIndex] = (validity[byteIndex] ?? 0) | (1 << (index & 7));
}

function clearBit(validity: Uint8Array, index: number): void {
  const byteIndex = index >> 3;
  validity[byteIndex] = (validity[byteIndex] ?? 0) & ~(1 << (index & 7));
}
