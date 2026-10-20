// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { PRIMITIVE_BOUNDS, PRIMITIVE_ENCLOSING_RADII } from './primitive-bounds.js';
import { createPrimitiveGeometry } from './primitive-geometry.js';

describe('primitive bounds', () => {
  it.each(['arrow', 'cone', 'cube', 'cylinder', 'pyramid', 'sphere'] as const)(
    'contains every tessellated %s vertex and encloses its bounding box',
    kind => {
      const { vertices } = createPrimitiveGeometry(kind);
      const bounds = PRIMITIVE_BOUNDS[kind];
      for (let offset = 0; offset < vertices.length; offset += 6) {
        for (let axis = 0; axis < 3; axis++) {
          expect(vertices[offset + axis]!).toBeGreaterThanOrEqual(bounds.minimum[axis]! - 1e-6);
          expect(vertices[offset + axis]!).toBeLessThanOrEqual(bounds.maximum[axis]! + 1e-6);
        }
      }
      const expectedRadius = kind === 'arrow' ? Math.sqrt(3) : Math.sqrt(3) / 2;
      expect(PRIMITIVE_ENCLOSING_RADII[kind]).toBeCloseTo(expectedRadius);
    }
  );

  it('keeps the arrow origin at its tail and centered primitives around zero', () => {
    expect(PRIMITIVE_BOUNDS.arrow).toEqual({ minimum: [-1, -1, 0], maximum: [1, 1, 1] });
    expect(PRIMITIVE_BOUNDS.cube).toEqual({ minimum: [-0.5, -0.5, -0.5], maximum: [0.5, 0.5, 0.5] });
  });
});
