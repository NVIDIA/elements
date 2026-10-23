// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { SRGB_TO_LINEAR_WGSL } from '../color/transfer.js';
import { LINE_WGSL } from '../records/layouts/wgsl.js';
import { CHECKERBOARD_SHADER } from './checkerboard-shader.js';
import { OIT_WGSL } from './transparency.js';

describe('checkerboard shader', () => {
  it('composes canonical packed-line, color conversion, and transparency helpers once', () => {
    for (const helper of [LINE_WGSL, SRGB_TO_LINEAR_WGSL, OIT_WGSL]) {
      expect(CHECKERBOARD_SHADER.split(helper)).toHaveLength(2);
    }
    expect(CHECKERBOARD_SHADER).toContain('nve_load_line_vertex(0u)');
    expect(CHECKERBOARD_SHADER).toContain('nve_load_line_vertex(1u)');
    expect(CHECKERBOARD_SHADER).toContain('srgbToLinear(value.rgb) * value.a');
  });

  it('keeps opaque and translucent fragments in separate passes', () => {
    expect(CHECKERBOARD_SHADER).toContain('if (value.a < 1.0) { discard; }');
    expect(CHECKERBOARD_SHADER).toContain('if (value.a <= 0.0 || value.a >= 1.0) { discard; }');
    expect(CHECKERBOARD_SHADER).toContain('nve_oit(value, input.position.z)');
  });
});
