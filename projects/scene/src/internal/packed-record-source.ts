// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export type PackedRecordKind = 'line-vertex' | 'marker' | 'point' | 'triangle-vertex';

export const PACKED_RECORD_SOURCE = Symbol.for('nve.scene.packed-record-source');
export const PACKED_RECORD_STATE = Symbol.for('nve.scene.packed-record-state');

export interface PackedRecordState {
  readonly bytes: Uint8Array;
  readonly cacheable: boolean;
  readonly version: number;
}

export interface PackedRecordSource<Kind extends PackedRecordKind = PackedRecordKind> {
  readonly bytes: Uint8Array;
  readonly capacity: number;
  readonly count: number;
  readonly [PACKED_RECORD_SOURCE]: Kind;
}

export interface VersionedPackedRecordSource<Kind extends PackedRecordKind = PackedRecordKind>
  extends PackedRecordSource<Kind> {
  readonly version: number;
  [PACKED_RECORD_STATE](): PackedRecordState;
}

export function getPackedRecordState(value: unknown): PackedRecordState | undefined {
  if (typeof value !== 'object' || value === null) return undefined;
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

export function isPackedRecordSource(value: unknown): value is PackedRecordSource {
  const capacity = Reflect.get(value ?? {}, 'capacity');
  const count = Reflect.get(value ?? {}, 'count');
  const bytes = getPackedRecordState(value)?.bytes ?? Reflect.get(value ?? {}, 'bytes');
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof Reflect.get(value, PACKED_RECORD_SOURCE) === 'string' &&
    bytes instanceof Uint8Array &&
    isValidRecordRange(capacity, count)
  );
}

function isValidRecordRange(capacity: unknown, count: unknown): capacity is number {
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
