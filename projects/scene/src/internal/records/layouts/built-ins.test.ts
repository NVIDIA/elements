// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from 'vitest';
import * as layouts from './built-ins.js';
import { FIELD_BYTE_WIDTHS } from './define-layout.js';
import { readMarker, writeMarker } from './codecs.js';

describe('built-in packed layouts', () => {
  it('defines distinct immutable protocols with aligned fields that fit one record', () => {
    const descriptors = Object.values(layouts);
    expect(new Set(descriptors.map(layout => layout.name)).size).toBe(descriptors.length);
    for (const layout of descriptors) {
      expect(Object.isFrozen(layout)).toBe(true);
      expect(Object.isFrozen(layout.fields)).toBe(true);
      const fields = Object.values(layout.fields).sort((a, b) => a.offset - b.offset);
      let end = 0;
      for (const field of fields) {
        expect(field.offset % 4).toBe(0);
        expect(field.offset).toBeGreaterThanOrEqual(end);
        end = field.offset + FIELD_BYTE_WIDTHS[field.type];
      }
      expect(end).toBe(layout.stride);
    }
  });
  it('keeps consecutive marker records independent when encoded through the public codec', () => {
    const bytes = new Uint8Array(layouts.MARKER.stride * 2);
    writeMarker(bytes, 0, { position: [1, 2, 3], color: [1, 0, 0, 1] });
    const first = bytes.slice(0, layouts.MARKER.stride);
    writeMarker(bytes, 1, { position: [4, 5, 6], scale: [2, 3, 4], outlineColor: [0, 1, 0, 1] });
    expect(bytes.slice(0, layouts.MARKER.stride)).toEqual(first);
    expect(readMarker(bytes, 1)).toEqual({
      position: [4, 5, 6],
      orientation: [0, 0, 0, 1],
      scale: [2, 3, 4],
      color: [1, 1, 1, 1],
      outlineColor: [0, 1, 0, 1]
    });
  });
});
