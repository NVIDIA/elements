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

export function lineRecordIsValid(records: DataView, byteOffset = 0): boolean {
  const width = records.getFloat32(byteOffset + WIDTH_OFFSET, true);
  const dash = records.getFloat32(byteOffset + DASH_OFFSET, true);
  const gap = records.getFloat32(byteOffset + GAP_OFFSET, true);
  const normalX = records.getFloat32(byteOffset + NORMAL_OFFSET, true);
  const normalY = records.getFloat32(byteOffset + NORMAL_OFFSET + 4, true);
  const normalZ = records.getFloat32(byteOffset + NORMAL_OFFSET + 8, true);
  return (
    Number.isFinite(width) &&
    Number.isFinite(dash) &&
    Number.isFinite(gap) &&
    Number.isFinite(normalX) &&
    Number.isFinite(normalY) &&
    Number.isFinite(normalZ) &&
    styleIsValid(width, dash, gap) &&
    Math.hypot(normalX, normalY, normalZ) > 0
  );
}

export function lineRecordHasTransparency(records: DataView, byteOffset = 0): boolean {
  return (
    records.getFloat32(byteOffset + WIDTH_OFFSET, true) > 0 && records.getUint8(byteOffset + COLOR_OFFSET + 3) !== 255
  );
}

export function lineHasTransparency(bytes: Uint8Array, count: number, topology: LineTopology): boolean {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const step = topology === 'segments' ? 2 : 1;
  const limit = topology === 'loop' ? count : Math.max(0, count - 1);
  for (let index = 0; index < limit; index += step) {
    const offset = index * LINE_VERTEX.stride;
    if (lineRecordHasTransparency(view, offset)) return true;
  }
  return false;
}

function styleIsValid(width: number, dash: number, gap: number): boolean {
  return width >= 0 && dash >= 0 && gap >= 0 && (gap === 0 || dash > 0);
}

function fieldOffset(name: string): number {
  const field = LINE_VERTEX.fields[name];
  if (!field) throw new TypeError(`The line layout has no ${name} field.`);
  return field.offset;
}
