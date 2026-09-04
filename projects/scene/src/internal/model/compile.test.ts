// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { createModelPrimitiveGeometry, compileParts, type ModelPart } from './compile.js';
import { createPrimitiveGeometry, type PrimitiveKind } from '../primitive-geometry.js';

describe(compileParts.name, () => {
  it('should compile an identity cube from its unit tessellation with opaque white colors', () => {
    const source = createModelPrimitiveGeometry('cube');
    const compiled = compileParts([{ shape: 'cube' }]);

    expect(compiled.positions).toEqual(deinterleave(source.vertices, 0));
    expect(compiled.normals).toEqual(deinterleave(source.vertices, 3));
    expect(compiled.indices).toEqual(source.indices);
    expect(compiled.colors).toEqual(new Float32Array((source.vertices.length / 6) * 4).fill(1));
  });

  it('should apply translation, orientation, and nonuniform scale to positions and inverse-transpose normals', () => {
    const compiled = compileParts([
      {
        shape: 'cube',
        position: [3, 5, 7],
        orientation: [0, 0, Math.SQRT1_2, Math.SQRT1_2],
        scale: [2, 3, 4]
      }
    ]);

    // The first cube vertex is [0.5, -0.5, -0.5], face normal +X.
    expect([...compiled.positions.subarray(0, 3)]).toEqual([4.5, 6, 5]);
    expect(compiled.normals[0]).toBeCloseTo(0, 6);
    expect(compiled.normals[1]).toBeCloseTo(1, 6);
    expect(compiled.normals[2]).toBeCloseTo(0, 6);
    for (let offset = 0; offset < compiled.normals.length; offset += 3) {
      expect(Math.hypot(...compiled.normals.subarray(offset, offset + 3))).toBeCloseTo(1, 6);
    }

    const sphere = compileParts([
      { shape: 'sphere', orientation: [0, 0, Math.SQRT1_2, Math.SQRT1_2], scale: [2, 3, 4] }
    ]);
    // The first icosphere normal is normalized [-1, φ, 0]. Its inverse-transpose normal, then Z-axis rotation, is:
    // [-0.7333492283, -0.6798521231, 0]. An orientation-only normal transform would not produce these values.
    expect(sphere.normals[0]).toBeCloseTo(-0.7333492283, 6);
    expect(sphere.normals[1]).toBeCloseTo(-0.6798521231, 6);
    expect(sphere.normals[2]).toBeCloseTo(0, 6);
  });

  it('should retain outward-facing winding after a mirrored transform', () => {
    const compiled = compileParts([{ shape: 'cube', scale: [-1, 2, 3] }]);
    for (let offset = 0; offset < compiled.indices.length; offset += 3) {
      const first = compiled.indices[offset]! * 3;
      const second = compiled.indices[offset + 1]! * 3;
      const third = compiled.indices[offset + 2]! * 3;
      const ab = subtract(compiled.positions, second, first);
      const ac = subtract(compiled.positions, third, first);
      const normal = compiled.normals.subarray(first, first + 3);
      expect(dot(cross(ab, ac), normal)).toBeGreaterThan(0);
    }
  });

  it('should concatenate part buffers with deterministic index offsets and colors', () => {
    const first = createModelPrimitiveGeometry('cube');
    const second = createModelPrimitiveGeometry('pyramid');
    const compiled = compileParts([
      { shape: 'cube', color: [1, 0, 0, 1] },
      { shape: 'pyramid', position: [2, 0, 0], color: [0, 1, 0, 0.5] }
    ]);
    const firstVertices = first.vertices.length / 6;

    expect(compiled.indices.subarray(0, first.indices.length)).toEqual(first.indices);
    expect(compiled.indices.subarray(first.indices.length)).toEqual(
      new Uint32Array([...second.indices].map(index => index + firstVertices))
    );
    expect([...compiled.colors.subarray(0, 4)]).toEqual([1, 0, 0, 1]);
    expect([...compiled.colors.subarray(firstVertices * 4, firstVertices * 4 + 4)]).toEqual([0, 1, 0, 0.5]);
  });

  it('should reject malformed part structures and noninvertible transforms', () => {
    const invalid: unknown[] = [
      null,
      {},
      { shape: 'torus' },
      { shape: 'cube', position: [0, 0] },
      { shape: 'cube', orientation: [0, 0, 0, 0] },
      { shape: 'cube', scale: [1, 0, 1] },
      { shape: 'cube', color: [1, 1, 1, 2] },
      new Array<ModelPart>(1)
    ];

    for (const parts of invalid) expect(() => compileParts(parts as ModelPart[])).toThrow();
    expect(() => compileParts(new Array<ModelPart>(250_000))).toThrow(RangeError);
  });

  it('should compile no parts into empty planar arrays', () => {
    expect(compileParts([])).toEqual({
      positions: new Float32Array(),
      normals: new Float32Array(),
      colors: new Float32Array(),
      indices: new Uint32Array()
    });
  });
});

describe('model primitive tessellators', () => {
  it.each<PrimitiveKind>(['cube', 'sphere', 'cylinder', 'cone', 'pyramid'])(
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
    ['pyramid', '80077345', 'd3fbbac7']
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

function deinterleave(vertices: Float32Array, start: number): Float32Array {
  const values = new Float32Array((vertices.length / 6) * 3);
  for (let source = start, target = 0; source < vertices.length; source += 6, target += 3) {
    values.set(vertices.subarray(source, source + 3), target);
  }
  return values;
}

function subtract(values: Float32Array, left: number, right: number): [number, number, number] {
  return [
    values[left]! - values[right]!,
    values[left + 1]! - values[right + 1]!,
    values[left + 2]! - values[right + 2]!
  ];
}

function cross(
  left: readonly [number, number, number],
  right: readonly [number, number, number]
): [number, number, number] {
  return [
    left[1] * right[2] - left[2] * right[1],
    left[2] * right[0] - left[0] * right[2],
    left[0] * right[1] - left[1] * right[0]
  ];
}

function dot(left: readonly number[], right: ArrayLike<number>): number {
  return left[0]! * (right[0] ?? 0) + left[1]! * (right[1] ?? 0) + left[2]! * (right[2] ?? 0);
}
