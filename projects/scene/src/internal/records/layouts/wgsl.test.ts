// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from 'vitest';
import { LINE_WGSL, MARKER_WGSL, STREAM_WGSL } from './wgsl.js';
import { LINE_VERTEX, MARKER, POINT, TRIANGLE_VERTEX } from './built-ins.js';
import { getFieldOffset } from './define-layout.js';

describe('packed storage shader layouts', () => {
  it.each([
    [MARKER_WGSL, MARKER, 'nve_marker_words'],
    [LINE_WGSL, LINE_VERTEX, 'nve_line_words'],
    [STREAM_WGSL, POINT, 'nve_stream_words'],
    [STREAM_WGSL, TRIANGLE_VERTEX, 'nve_stream_words']
  ] as const)('keeps shader addressing consistent with the %s protocol', (code, layout, words) => {
    expect(code).toContain(`let base = i * ${layout.stride / 4}u;`);
    const colorWord = getFieldOffset(layout, 'color') / 4;
    expect(code).toContain(`nve_unpack_unorm8x4(${words}[base + ${colorWord}u])`);
    expect(code.match(/fn nve_unpack_unorm8x4/g)).toHaveLength(1);
    expect(code).toContain('(word >> 24u) & 0xffu');
  });
  it('loads marker outline colors from the separate packed field', () => {
    const word = getFieldOffset(MARKER, 'outline-color') / 4;
    expect(MARKER_WGSL).toContain(`nve_unpack_unorm8x4(nve_marker_words[base + ${word}u])`);
  });
});
