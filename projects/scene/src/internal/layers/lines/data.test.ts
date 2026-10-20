// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { LINE_VERTEX } from '../../records/layouts/built-ins.js';
import { writeLineVertex } from '../../records/layouts/codecs.js';
import {
  lineRecordHasTransparency,
  lineRecordIsOpaque,
  lineRecordIsValid,
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

  it('should validate raw styles and classify only visible outgoing transparency', () => {
    const bytes = new Uint8Array(3 * LINE_VERTEX.stride);
    writeLineVertex(bytes, 0, { position: [0, 0, 0] });
    writeLineVertex(bytes, 1, { position: [1, 0, 0], color: [1, 1, 1, 0.5], width: 0 });
    writeLineVertex(bytes, 2, { position: [2, 0, 0], color: [1, 1, 1, 0.5] });

    expect(lineRecordIsValid(new DataView(bytes.buffer, 0, LINE_VERTEX.stride))).toBe(true);
    const outgoing = new DataView(bytes.buffer, LINE_VERTEX.stride, LINE_VERTEX.stride);
    expect(lineRecordHasTransparency(outgoing)).toBe(false);
    expect(lineRecordIsOpaque(outgoing)).toBe(false);
    expect(lineRecordHasTransparency(new DataView(bytes.buffer, 2 * LINE_VERTEX.stride, LINE_VERTEX.stride))).toBe(
      true
    );

    writeLineVertex(bytes, 1, { position: [1, 0, 0], color: [1, 1, 1, 0.5] });
    expect(lineRecordHasTransparency(outgoing)).toBe(true);

    writeLineVertex(bytes, 1, { position: [1, 0, 0], color: [1, 1, 1, 0] });
    const hidden = new DataView(bytes.buffer, LINE_VERTEX.stride, LINE_VERTEX.stride);
    expect(lineRecordHasTransparency(hidden)).toBe(false);
    expect(lineRecordIsOpaque(hidden)).toBe(false);
  });
});
