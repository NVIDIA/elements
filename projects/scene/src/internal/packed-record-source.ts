// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export type PackedRecordKind = 'label' | 'line-vertex' | 'marker' | 'point' | 'triangle-vertex';

/** Selects the changed records and complete active prefix captured by a layer publication. */
export interface ScenePublishOptions {
  readonly activeCount?: number;
  readonly count?: number;
  readonly start?: number;
}

export const PACKED_RECORD_SOURCE = Symbol.for('nve.scene.packed-record-source');
export const PACKED_RECORD_STATE = Symbol.for('nve.scene.packed-record-state');

export interface PackedRecordState {
  readonly bytes: Uint8Array;
  readonly cacheable: boolean;
  readonly version: number;
}

interface PackedRecordSource<Kind extends PackedRecordKind = PackedRecordKind> {
  readonly capacity: number;
  readonly count: number;
  readonly mutableBytes: Uint8Array;
  readonly [PACKED_RECORD_SOURCE]: Kind;
}

/** Borrowed, explicitly typed packed bytes from an external producer. */
export interface ExternalPackedRecordSource<Kind extends PackedRecordKind = PackedRecordKind> {
  readonly bytes: Uint8Array;
  readonly capacity: number;
  readonly count: number;
  readonly kind: Kind;
}

export type AnyPackedRecordSource<Kind extends PackedRecordKind = PackedRecordKind> =
  | ExternalPackedRecordSource<Kind>
  | PackedRecordSource<Kind>;

export interface VersionedPackedRecordSource<Kind extends PackedRecordKind = PackedRecordKind>
  extends PackedRecordSource<Kind> {
  readonly version: number;
  [PACKED_RECORD_STATE](): PackedRecordState;
}

const externalSources = new WeakMap<object, { readonly kind: PackedRecordKind; readonly state: PackedRecordState }>();

export function registerExternalPackedRecordSource<Kind extends PackedRecordKind>(
  source: ExternalPackedRecordSource<Kind>,
  state: PackedRecordState
): void {
  externalSources.set(source, { kind: source.kind, state });
}

export function getPackedRecordState(value: unknown): PackedRecordState | undefined {
  if (typeof value !== 'object' || value === null) return undefined;
  const external = externalSources.get(value);
  if (external) return external.state;
  const readState = Reflect.get(value, PACKED_RECORD_STATE);
  if (typeof readState !== 'function') return undefined;
  const state: unknown = Reflect.apply(readState, value, []);
  if (typeof state !== 'object' || state === null) return undefined;
  const bytes = Reflect.get(state, 'bytes');
  const cacheable = Reflect.get(state, 'cacheable');
  const version = Reflect.get(state, 'version');
  return bytes instanceof Uint8Array && typeof cacheable === 'boolean' && typeof version === 'number'
    ? { bytes, cacheable, version }
    : undefined;
}

export function isPackedRecordSource(value: unknown): value is AnyPackedRecordSource {
  if (typeof value !== 'object' || value === null) return false;
  const external = externalSources.get(value);
  const capacity = Reflect.get(value, 'capacity');
  const count = Reflect.get(value, 'count');
  const bytes = getPackedRecordState(value)?.bytes ?? Reflect.get(value, 'bytes');
  const recognized = external !== undefined || typeof Reflect.get(value, PACKED_RECORD_SOURCE) === 'string';
  return recognized && bytes instanceof Uint8Array && isValidRecordRange(capacity, count);
}

export function getPackedRecordKind(source: AnyPackedRecordSource): PackedRecordKind {
  const external = externalSources.get(source);
  return external?.kind ?? sourceKind(source);
}

function sourceKind(source: AnyPackedRecordSource): PackedRecordKind {
  return Reflect.get(source, PACKED_RECORD_SOURCE) as PackedRecordKind;
}

function isValidRecordRange(capacity: unknown, count: unknown): boolean {
  return (
    typeof capacity === 'number' &&
    Number.isInteger(capacity) &&
    capacity >= 0 &&
    typeof count === 'number' &&
    Number.isInteger(count) &&
    count >= 0 &&
    count <= capacity
  );
}

export function getPackedRecordBytes(source: AnyPackedRecordSource): Uint8Array {
  const state = getPackedRecordState(source);
  if (!state) throw new TypeError('Packed record source state is unavailable.');
  return state.bytes;
}

export function resolvePublishOptions(options: {
  readonly capacity: number;
  readonly currentActiveCount: number;
  readonly requested?: ScenePublishOptions;
  readonly sourceActiveCount: number;
}): { readonly activeCount: number; readonly count: number; readonly start: number } {
  const { capacity, currentActiveCount, requested = {}, sourceActiveCount } = options;
  const activeCount = requested.activeCount ?? sourceActiveCount;
  assertRecordCount(activeCount, capacity, 'Published active count');
  const start = requested.start ?? 0;
  const count = requested.count ?? activeCount - start;
  assertRecordRange(start, count, capacity);
  const dirtyEnd = start + count;
  return activeCount > currentActiveCount
    ? {
        activeCount,
        start: Math.min(start, currentActiveCount),
        count: Math.max(dirtyEnd, activeCount) - Math.min(start, currentActiveCount)
      }
    : { activeCount, count, start };
}

function assertRecordCount(value: number, capacity: number, label: string): void {
  if (!Number.isInteger(value) || value < 0 || value > capacity) {
    throw new RangeError(`${label} must be a nonnegative integer within capacity.`);
  }
}

function assertRecordRange(start: number, count: number, capacity: number): void {
  if (!Number.isInteger(start) || start < 0 || !Number.isInteger(count) || count < 0 || start + count > capacity) {
    throw new RangeError('Published records must describe a nonnegative range within capacity.');
  }
}
