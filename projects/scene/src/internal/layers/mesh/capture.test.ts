// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { prepareMeshGeometryCapture } from './capture.js';

describe('mesh geometry capture', () => {
  it('owns vertex and index arrays and counts float alpha values', async () => {
    const positions = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]);
    const colors = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0.25, 0, 0, 1, 1]);
    const indices = new Uint32Array([0, 1, 2]);
    const captured = await prepareMeshGeometryCapture(
      { positions, colors, indices },
      { isCurrent: () => true, yield: async () => {} }
    );

    positions[3] = 2;
    colors[7] = 1;
    indices[1] = 2;

    expect(captured?.geometry.positions?.[3]).toBe(1);
    expect(captured?.geometry.colors?.[7]).toBe(0.25);
    expect(captured?.geometry.indices).toEqual(new Uint32Array([0, 1, 2]));
    expect(captured?.alphaSummary).toEqual({ zero: 1, partial: 1, opaque: 1 });
  });
});
