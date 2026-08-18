// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { createPrimitiveGeometry, type UnitPrimitiveKind } from '../internal/primitive-geometry.js';
import { createModelPrimitiveGeometry } from './primitives.js';

describe('model primitive tessellators', () => {
  it.each<UnitPrimitiveKind>(['cube', 'sphere', 'cylinder', 'cone', 'pyramid'])(
    'should retain the marker bytes for the %s tessellation',
    shape => {
      const marker = createPrimitiveGeometry(shape);
      const model = createModelPrimitiveGeometry(shape);

      expect(model.triangleCount).toBe(marker.triangleCount);
      expect(model.vertices).toEqual(marker.vertices);
      expect(model.indices).toEqual(marker.indices);
    }
  );

  it.each([
    ['cube', '3b486745', '4db830c5'],
    ['sphere', 'e23578b5', '5bf9535'],
    ['cylinder', '406f95d9', 'c0dfd685'],
    ['cone', '17b547a0', '3cdfcb45'],
    ['pyramid', '80077345', 'd3fbbac7'],
    ['arrow', 'ef069c7e', '703bf18d']
  ] as const)('should retain the established %s tessellation bytes', (shape, vertexFingerprint, indexFingerprint) => {
    const geometry = createPrimitiveGeometry(shape);

    expect(fingerprint(geometry.vertices)).toBe(vertexFingerprint);
    expect(fingerprint(geometry.indices)).toBe(indexFingerprint);
  });
});

function fingerprint(values: ArrayBufferView): string {
  let hash = 0x811c9dc5;
  const bytes = new Uint8Array(values.buffer, values.byteOffset, values.byteLength);
  for (const byte of bytes) {
    hash ^= byte;
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16);
}
