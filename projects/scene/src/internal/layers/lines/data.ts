// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { LINE_VERTEX } from '../../records/layouts/built-ins.js';
import { getFieldOffset } from '../../records/layouts/define-layout.js';
import { lineDimensionsAreValid, lineNormalIsValid } from './style.js';

const COLOR_OFFSET = getFieldOffset(LINE_VERTEX, 'color');
const DASH_OFFSET = getFieldOffset(LINE_VERTEX, 'dash');
const GAP_OFFSET = getFieldOffset(LINE_VERTEX, 'gap');
const NORMAL_OFFSET = getFieldOffset(LINE_VERTEX, 'normal');
const WIDTH_OFFSET = getFieldOffset(LINE_VERTEX, 'width');

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
  return lineDimensionsAreValid(width, dash, gap) && lineNormalIsValid(normalX, normalY, normalZ);
}

export function lineRecordHasTransparency(records: DataView, byteOffset = 0): boolean {
  const alpha = records.getUint8(byteOffset + COLOR_OFFSET + 3);
  return records.getFloat32(byteOffset + WIDTH_OFFSET, true) > 0 && alpha > 0 && alpha < 255;
}

export function lineRecordIsOpaque(records: DataView, byteOffset = 0): boolean {
  return (
    records.getFloat32(byteOffset + WIDTH_OFFSET, true) > 0 && records.getUint8(byteOffset + COLOR_OFFSET + 3) === 255
  );
}
