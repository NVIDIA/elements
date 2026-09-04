// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { LINE_VERTEX } from '../layouts/built-ins.js';
import { writeLineVertex } from '../layouts/helpers.js';
import {
  lineCountIsValid,
  lineHasTransparency,
  lineRecordHasTransparency,
  lineRecordIsOpaque,
  lineRecordIsValid,
  lineSegmentCount,
  normalizeLineTopology,
  normalizeLineWidthUnit
} from './data.js';

describe('line data', () => {
  it('should normalize public line options', () => {
    expect(normalizeLineTopology('loop')).toBe('loop');
    expect(normalizeLineTopology('segments')).toBe('segments');
    expect(normalizeLineTopology('unknown')).toBe('strip');
    expect(normalizeLineWidthUnit('pixel')).toBe('pixel');
    expect(normalizeLineWidthUnit('world')).toBe('world');
    expect(normalizeLineWidthUnit('unknown')).toBe('world');
  });

  it('should validate topology-specific counts and calculate segment counts', () => {
    expect(lineCountIsValid(2, 'loop')).toBe(false);
    expect(lineCountIsValid(3, 'loop')).toBe(true);
    expect(lineCountIsValid(3, 'segments')).toBe(false);
    expect(lineCountIsValid(4, 'segments')).toBe(true);
    expect(lineSegmentCount(5, 'strip')).toBe(4);
    expect(lineSegmentCount(5, 'loop')).toBe(5);
    expect(lineSegmentCount(6, 'segments')).toBe(3);
  });

  it('should represent one million segments without CPU-side geometry expansion', () => {
    expect(lineSegmentCount(1_000_001, 'strip')).toBe(1_000_000);
    expect(lineSegmentCount(1_000_000, 'loop')).toBe(1_000_000);
    expect(lineSegmentCount(2_000_000, 'segments')).toBe(1_000_000);
  });

  it('should validate raw styles and classify only visible outgoing transparency', () => {
    const bytes = new Uint8Array(3 * LINE_VERTEX.stride);
    writeLineVertex(bytes, 0, { position: [0, 0, 0] });
    writeLineVertex(bytes, 1, { position: [1, 0, 0], color: [1, 1, 1, 0.5], width: 0 });
    writeLineVertex(bytes, 2, { position: [2, 0, 0], color: [1, 1, 1, 0.5] });

    expect(lineRecordIsValid(new DataView(bytes.buffer, 0, LINE_VERTEX.stride))).toBe(true);
    expect(lineHasTransparency(bytes, 3, 'strip')).toBe(false);
    expect(lineHasTransparency(bytes, 3, 'loop')).toBe(true);

    writeLineVertex(bytes, 1, { position: [1, 0, 0], color: [1, 1, 1, 0.5] });
    expect(lineHasTransparency(bytes, 3, 'strip')).toBe(true);

    writeLineVertex(bytes, 1, { position: [1, 0, 0], color: [1, 1, 1, 0] });
    const hidden = new DataView(bytes.buffer, LINE_VERTEX.stride, LINE_VERTEX.stride);
    expect(lineRecordHasTransparency(hidden)).toBe(false);
    expect(lineRecordIsOpaque(hidden)).toBe(false);
  });
});
