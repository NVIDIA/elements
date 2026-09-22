// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { LineVertexBuffer } from './buffer.js';
import { lineRecordIsValid } from './data.js';
import { LINE_VERTEX } from '../../records/layouts/built-ins.js';
import { getFieldOffset } from '../../records/layouts/define-layout.js';
import { readLineVertex, writeLineVertex } from '../../records/layouts/codecs.js';
import type { Vec3 } from '../../math/types.js';

const DIMENSION_ERROR = 'Line width, dash, and gap must be nonnegative, with a positive dash before a gap.';
const NORMAL_ERROR = 'Line normal length must be greater than zero.';

interface StyleCase {
  name: string;
  normal: Vec3;
  width: number;
  dash: number;
  gap: number;
  handleError?: string;
  layoutError?: string;
}

const valid: StyleCase = { name: 'solid', normal: [0, 0, 1], width: 0.1, dash: 0, gap: 0 };
const cases: StyleCase[] = [
  valid,
  { ...valid, name: 'hidden', width: 0 },
  { ...valid, name: 'dashed', dash: 2, gap: 1 },
  ...(['width', 'dash', 'gap'] as const).map(field => ({
    ...valid,
    name: `negative ${field}`,
    [field]: -1,
    handleError: DIMENSION_ERROR,
    layoutError: DIMENSION_ERROR
  })),
  { ...valid, name: 'gap without dash', gap: 1, handleError: DIMENSION_ERROR, layoutError: DIMENSION_ERROR },
  { ...valid, name: 'zero normal', normal: [0, 0, 0], handleError: NORMAL_ERROR, layoutError: NORMAL_ERROR },
  {
    ...valid,
    name: 'zero normal and negative width',
    normal: [0, 0, 0],
    width: -1,
    handleError: NORMAL_ERROR,
    layoutError: DIMENSION_ERROR
  },
  ...(['width', 'dash', 'gap'] as const).flatMap(field =>
    [NaN, Infinity].map(value => ({
      ...valid,
      name: `${field} ${value}`,
      [field]: value,
      handleError: 'Record values must be finite.',
      layoutError: 'Numeric layout values must be finite.'
    }))
  ),
  ...([0, 1, 2] as const).flatMap(component =>
    [NaN, Infinity].map(value => {
      const normal: Vec3 = [0, 0, 1];
      normal[component] = value;
      return {
        ...valid,
        name: `normal ${component} ${value}`,
        normal,
        handleError: 'Record values must be finite.',
        layoutError: 'Numeric layout values must be finite.'
      };
    })
  )
];

describe('line style boundaries', () => {
  it.each(cases)('preserves validation and atomic writes for $name', style => {
    const buffer = new LineVertexBuffer({ capacity: 1 });
    const vertex = buffer.add();
    const original = buffer.mutableBytes.slice();
    const version = buffer.version;
    const bytes = original.slice();
    if (style.handleError) {
      expect(() => vertex.setStyle(style)).toThrow(style.handleError);
      expect(buffer.mutableBytes).toEqual(original);
      expect(buffer.version).toBe(version);
      expect(() => writeLineVertex(bytes, 0, { ...style, position: [0, 0, 0] })).toThrow(style.layoutError);
      expect(bytes).toEqual(original);
    } else {
      vertex.setStyle(style);
      writeLineVertex(bytes, 0, { ...style, position: [0, 0, 0] });
      expect(buffer.mutableBytes).toEqual(bytes);
      expect(buffer.version).toBe(version + 1);
    }

    const view = new DataView(bytes.buffer);
    for (const field of ['width', 'dash', 'gap'] as const) {
      view.setFloat32(getFieldOffset(LINE_VERTEX, field), style[field], true);
    }
    style.normal.forEach((value, component) =>
      view.setFloat32(getFieldOffset(LINE_VERTEX, 'normal') + component * 4, value, true)
    );
    expect(lineRecordIsValid(view)).toBe(!style.handleError);
    if (style.layoutError) expect(() => readLineVertex(bytes, 0)).toThrow(style.layoutError);
    else expect(readLineVertex(bytes, 0).normal).toEqual(style.normal);
  });
});
