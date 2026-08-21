// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { LINE_VERTEX } from '../layouts/built-ins.js';

const COLOR_OFFSET = fieldOffset('color');
const DASH_OFFSET = fieldOffset('dash');
const GAP_OFFSET = fieldOffset('gap');
const NORMAL_OFFSET = fieldOffset('normal');
const WIDTH_OFFSET = fieldOffset('width');

export type LineTopology = 'strip' | 'loop' | 'segments';
export type LineWidthUnit = 'pixel' | 'world';

export function normalizeLineTopology(value: unknown): LineTopology {
  return value === 'loop' || value === 'segments' ? value : 'strip';
}

export function normalizeLineWidthUnit(value: unknown): LineWidthUnit {
  return value === 'pixel' ? 'pixel' : 'world';
}

export function lineSegmentCount(count: number, topology: LineTopology): number {
  if (topology === 'segments') return Math.floor(count / 2);
  if (topology === 'loop') return count >= 3 ? count : 0;
  return Math.max(0, count - 1);
}

export function lineCountIsValid(count: number, topology: LineTopology): boolean {
  if (topology === 'segments') return count % 2 === 0;
  if (topology === 'loop') return count === 0 || count >= 3;
  return true;
}

export function lineRecordIsValid(record: DataView): boolean {
  const width = record.getFloat32(WIDTH_OFFSET, true);
  const dash = record.getFloat32(DASH_OFFSET, true);
  const gap = record.getFloat32(GAP_OFFSET, true);
  const normal = [
    record.getFloat32(NORMAL_OFFSET, true),
    record.getFloat32(NORMAL_OFFSET + 4, true),
    record.getFloat32(NORMAL_OFFSET + 8, true)
  ];
  return valuesAreFinite([width, dash, gap, ...normal]) && styleIsValid(width, dash, gap) && normalIsValid(normal);
}

export function lineHasTransparency(bytes: Uint8Array, count: number, topology: LineTopology): boolean {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const step = topology === 'segments' ? 2 : 1;
  const limit = topology === 'loop' ? count : Math.max(0, count - 1);
  for (let index = 0; index < limit; index += step) {
    const offset = index * LINE_VERTEX.stride;
    if (view.getFloat32(offset + WIDTH_OFFSET, true) > 0 && bytes[offset + COLOR_OFFSET + 3] !== 255) return true;
  }
  return false;
}

function valuesAreFinite(values: readonly number[]): boolean {
  return values.every(Number.isFinite);
}

function styleIsValid(width: number, dash: number, gap: number): boolean {
  return width >= 0 && dash >= 0 && gap >= 0 && (gap === 0 || dash > 0);
}

function normalIsValid(normal: readonly number[]): boolean {
  return Math.hypot(...normal) > 0;
}

function fieldOffset(name: string): number {
  const field = LINE_VERTEX.fields[name];
  if (!field) throw new TypeError(`The line layout has no ${name} field.`);
  return field.offset;
}
