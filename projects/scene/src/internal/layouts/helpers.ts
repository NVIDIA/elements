// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { normalizeQuaternion } from '../math/quaternion.js';
import type { Quaternion, RGBA, Vec3 } from '../types.js';
import { LINE_VERTEX, MARKER, POINT, TRI_VERTEX } from './built-ins.js';
import type { LayoutDescriptor } from './define-layout.js';

export interface MarkerFields {
  position: Vec3;
  orientation?: Quaternion;
  scale?: Vec3;
  color?: RGBA;
  outlineColor?: RGBA;
}

export interface PointFields {
  position: Vec3;
  color?: RGBA;
}

export interface LineVertexFields extends PointFields {
  /** Frame-local ribbon normal. Ignored by pixel-width lines. */
  normal?: Vec3;
  /** Full segment width. Defaults to 0.1; zero suppresses the outgoing segment. */
  width?: number;
  /** Visible length in each dash period. */
  dash?: number;
  /** Hidden length in each dash period. Zero renders a solid segment. */
  gap?: number;
}

export type TriVertexFields = PointFields;

const DEFAULT_COLOR: RGBA = [1, 1, 1, 1];
const DEFAULT_OUTLINE_COLOR: RGBA = [0, 0, 0, 0];
const DEFAULT_SCALE: Vec3 = [1, 1, 1];
const DEFAULT_LINE_NORMAL: Vec3 = [0, 0, 1];
const DEFAULT_LINE_WIDTH = 0.1;
const MARKER_POSITION_OFFSET = offsetOf(MARKER, 'position');
const MARKER_ORIENTATION_OFFSET = offsetOf(MARKER, 'orientation');
const MARKER_SCALE_OFFSET = offsetOf(MARKER, 'scale');
const MARKER_COLOR_OFFSET = offsetOf(MARKER, 'color');
const MARKER_OUTLINE_COLOR_OFFSET = offsetOf(MARKER, 'outline-color');
const dataViews = new WeakMap<ArrayBufferView, DataView>();

export function writeMarker(view: ArrayBufferView, index: number, fields: MarkerFields): void {
  const offset = getRecordOffset(view, index, MARKER);
  const records = getDataView(view);
  const orientation = fields.orientation;

  writeFloat3(records, offset + MARKER_POSITION_OFFSET, fields.position);
  if (orientation === undefined) {
    writeIdentityQuaternion(records, offset + MARKER_ORIENTATION_OFFSET);
  } else {
    writeFloat4(records, offset + MARKER_ORIENTATION_OFFSET, normalizeQuaternion(orientation));
  }
  writeFloat3(records, offset + MARKER_SCALE_OFFSET, fields.scale ?? DEFAULT_SCALE);
  writeColor(records, offset + MARKER_COLOR_OFFSET, fields.color ?? DEFAULT_COLOR);
  writeColor(records, offset + MARKER_OUTLINE_COLOR_OFFSET, fields.outlineColor ?? DEFAULT_OUTLINE_COLOR);
}

export function readMarker(view: ArrayBufferView, index: number): Required<MarkerFields> {
  const record = getRecordView(view, index, MARKER);
  const orientation = readFloat4(record, offsetOf(MARKER, 'orientation'));
  assertNonzeroQuaternion(orientation);

  return {
    position: readFloat3(record, offsetOf(MARKER, 'position')),
    orientation,
    scale: readFloat3(record, offsetOf(MARKER, 'scale')),
    color: readColor(record, offsetOf(MARKER, 'color')),
    outlineColor: readColor(record, offsetOf(MARKER, 'outline-color'))
  };
}

export function writePoint(view: ArrayBufferView, index: number, fields: PointFields): void {
  writePointRecord(view, index, { fields, layout: POINT });
}

export function readPoint(view: ArrayBufferView, index: number): Required<PointFields> {
  return readPointRecord(view, index, POINT);
}

export function writeLineVertex(view: ArrayBufferView, index: number, fields: LineVertexFields): void {
  const record = getRecordView(view, index, LINE_VERTEX);
  const width = fields.width ?? DEFAULT_LINE_WIDTH;
  const dash = fields.dash ?? 0;
  const gap = fields.gap ?? 0;
  const normal = fields.normal ?? DEFAULT_LINE_NORMAL;
  assertLineStyle({ dash, gap, normal, width });
  writeFloatTuple(record, offsetOf(LINE_VERTEX, 'position'), fields.position);
  writeColor(record, offsetOf(LINE_VERTEX, 'color'), fields.color ?? DEFAULT_COLOR);
  writeFloatTuple(record, offsetOf(LINE_VERTEX, 'normal'), normal);
  record.setFloat32(offsetOf(LINE_VERTEX, 'width'), width, true);
  record.setFloat32(offsetOf(LINE_VERTEX, 'dash'), dash, true);
  record.setFloat32(offsetOf(LINE_VERTEX, 'gap'), gap, true);
}

export function readLineVertex(view: ArrayBufferView, index: number): Required<LineVertexFields> {
  const record = getRecordView(view, index, LINE_VERTEX);
  const fields = {
    position: readFloat3(record, offsetOf(LINE_VERTEX, 'position')),
    color: readColor(record, offsetOf(LINE_VERTEX, 'color')),
    normal: readFloat3(record, offsetOf(LINE_VERTEX, 'normal')),
    width: readFiniteFloat(record, offsetOf(LINE_VERTEX, 'width')),
    dash: readFiniteFloat(record, offsetOf(LINE_VERTEX, 'dash')),
    gap: readFiniteFloat(record, offsetOf(LINE_VERTEX, 'gap'))
  };
  assertLineStyle(fields);
  return fields;
}

export function writeTriVertex(view: ArrayBufferView, index: number, fields: TriVertexFields): void {
  writePointRecord(view, index, { fields, layout: TRI_VERTEX });
}

export function readTriVertex(view: ArrayBufferView, index: number): Required<TriVertexFields> {
  return readPointRecord(view, index, TRI_VERTEX);
}

function writePointRecord(
  view: ArrayBufferView,
  index: number,
  options: { fields: PointFields; layout: LayoutDescriptor }
): void {
  const { fields, layout } = options;
  const record = getRecordView(view, index, layout);
  writeFloatTuple(record, offsetOf(layout, 'position'), fields.position);
  writeColor(record, offsetOf(layout, 'color'), fields.color ?? DEFAULT_COLOR);
}

function readPointRecord(view: ArrayBufferView, index: number, layout: LayoutDescriptor): Required<PointFields> {
  const record = getRecordView(view, index, layout);
  return {
    position: readFloat3(record, offsetOf(layout, 'position')),
    color: readColor(record, offsetOf(layout, 'color'))
  };
}

function getRecordView(view: ArrayBufferView, index: number, layout: LayoutDescriptor): DataView {
  const byteOffset = getRecordOffset(view, index, layout);
  return new DataView(view.buffer, view.byteOffset + byteOffset, layout.stride);
}

function getRecordOffset(view: ArrayBufferView, index: number, layout: LayoutDescriptor): number {
  if (!Number.isInteger(index) || index < 0) {
    throw new RangeError('Record index must be a nonnegative integer.');
  }
  if (!ArrayBuffer.isView(view)) {
    throw new TypeError('Layout helpers require an ArrayBufferView.');
  }

  const byteOffset = index * layout.stride;
  if (!Number.isSafeInteger(byteOffset) || byteOffset + layout.stride > view.byteLength) {
    throw new RangeError('The requested record is outside the provided view.');
  }
  return byteOffset;
}

function getDataView(view: ArrayBufferView): DataView {
  if (!ArrayBuffer.isView(view)) {
    throw new TypeError('Layout helpers require an ArrayBufferView.');
  }
  if (view instanceof DataView) {
    return view;
  }
  const cached = dataViews.get(view);
  if (cached) {
    return cached;
  }
  const records = new DataView(view.buffer, view.byteOffset, view.byteLength);
  if (!bufferCanResize(view.buffer)) {
    dataViews.set(view, records);
  }
  return records;
}

function bufferCanResize(buffer: ArrayBufferLike): boolean {
  return Reflect.get(buffer, 'resizable') === true || Reflect.get(buffer, 'growable') === true;
}

function offsetOf(layout: LayoutDescriptor, name: string): number {
  const field = layout.fields[name];
  if (!field) {
    throw new TypeError(`Layout "${layout.name}" has no field named "${name}".`);
  }
  return field.offset;
}

function writeFloatTuple(record: DataView, offset: number, values: readonly number[]): void {
  values.forEach((value, index) => {
    assertFinite(value);
    record.setFloat32(offset + index * 4, value, true);
  });
}

function writeFloat3(record: DataView, offset: number, values: readonly number[]): void {
  const x = values[0];
  const y = values[1];
  const z = values[2];
  assertFinite(x);
  assertFinite(y);
  assertFinite(z);
  record.setFloat32(offset, x, true);
  record.setFloat32(offset + 4, y, true);
  record.setFloat32(offset + 8, z, true);
}

function writeFloat4(record: DataView, offset: number, values: readonly number[]): void {
  const x = values[0];
  const y = values[1];
  const z = values[2];
  const w = values[3];
  assertFinite(x);
  assertFinite(y);
  assertFinite(z);
  assertFinite(w);
  record.setFloat32(offset, x, true);
  record.setFloat32(offset + 4, y, true);
  record.setFloat32(offset + 8, z, true);
  record.setFloat32(offset + 12, w, true);
}

function writeIdentityQuaternion(record: DataView, offset: number): void {
  record.setFloat32(offset, 0, true);
  record.setFloat32(offset + 4, 0, true);
  record.setFloat32(offset + 8, 0, true);
  record.setFloat32(offset + 12, 1, true);
}

function readFloat3(record: DataView, offset: number): Vec3 {
  return [readFiniteFloat(record, offset), readFiniteFloat(record, offset + 4), readFiniteFloat(record, offset + 8)];
}

function readFloat4(record: DataView, offset: number): Quaternion {
  return [
    readFiniteFloat(record, offset),
    readFiniteFloat(record, offset + 4),
    readFiniteFloat(record, offset + 8),
    readFiniteFloat(record, offset + 12)
  ];
}

function readFiniteFloat(record: DataView, offset: number): number {
  const value = record.getFloat32(offset, true);
  assertFinite(value);
  return value;
}

function writeColor(record: DataView, offset: number, color: readonly number[]): void {
  for (let channel = 0; channel < 4; channel += 1) {
    const value = color[channel];
    assertFinite(value);
    record.setUint8(offset + channel, Math.floor(Math.min(1, Math.max(0, value)) * 255 + 0.5));
  }
}

function readColor(record: DataView, offset: number): RGBA {
  return [
    record.getUint8(offset) / 255,
    record.getUint8(offset + 1) / 255,
    record.getUint8(offset + 2) / 255,
    record.getUint8(offset + 3) / 255
  ];
}

function assertFinite(value: unknown): asserts value is number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new RangeError('Numeric layout values must be finite.');
  }
}

function assertNonzeroQuaternion(orientation: Quaternion): void {
  if (Math.hypot(...orientation) === 0) {
    throw new RangeError('Quaternion length must be greater than zero.');
  }
}

function assertLineStyle(fields: Pick<Required<LineVertexFields>, 'dash' | 'gap' | 'normal' | 'width'>): void {
  const { dash, gap, normal, width } = fields;
  [width, dash, gap, ...normal].forEach(assertFinite);
  if (width < 0 || dash < 0 || gap < 0 || (gap > 0 && dash === 0)) {
    throw new RangeError('Line width, dash, and gap must be nonnegative, with a positive dash before a gap.');
  }
  if (Math.hypot(...normal) === 0) {
    throw new RangeError('Line normal length must be greater than zero.');
  }
}
