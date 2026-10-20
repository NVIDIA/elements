// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it } from 'vitest';
import { MAX_GEOMETRY_BYTES, GEOMETRY_TRIANGLE_BYTES } from './limits.js';
import { compileBodyGeometry } from './geometry.js';

describe('body allocation budget', () => {
  it('accounts for every compiled attribute and index of an imported triangle', () => {
    const compiled = compileBodyGeometry([{ geometry: { positions: new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]) } }]);
    const bytes = [compiled.positions, compiled.normals, compiled.colors, compiled.indices, compiled.uvs].reduce(
      (sum, array) => sum + (array?.byteLength ?? 0),
      0
    );
    expect(GEOMETRY_TRIANGLE_BYTES).toBe(bytes);
    expect(MAX_GEOMETRY_BYTES).toBeGreaterThan(bytes);
    expect(Number.isSafeInteger(MAX_GEOMETRY_BYTES)).toBe(true);
    expect(MAX_GEOMETRY_BYTES % Uint32Array.BYTES_PER_ELEMENT).toBe(0);
  });
});
