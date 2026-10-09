// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { createPrimitiveGeometry, type PrimitiveKind } from './primitive-geometry.js';

describe('primitive geometry', () => {
  it.each<[PrimitiveKind, number]>([
    ['arrow', 192],
    ['cube', 12],
    ['sphere', 320],
    ['cylinder', 128],
    ['cone', 64],
    ['pyramid', 6]
  ])('should generate %s with the normative triangle count', (kind, triangleCount) => {
    const geometry = createPrimitiveGeometry(kind);
    expect(geometry.triangleCount).toBe(triangleCount);
    expect(geometry.indices).toHaveLength(triangleCount * 3);
    expect(geometry.vertices.length % 6).toBe(0);
    for (let offset = 3; offset < geometry.vertices.length; offset += 6) {
      expect(Math.hypot(...geometry.vertices.slice(offset, offset + 3))).toBeCloseTo(1, 5);
    }
  });

  it('should generate a closed, outward-facing unit arrow along positive z', () => {
    const geometry = createPrimitiveGeometry('arrow');

    expect(geometry.triangleCount).toBe(192);
    expect(getBounds(geometry.vertices)).toEqual({ max: [1, 1, 1], min: [-1, -1, 0] });
    expect(hasVertexAt(geometry.vertices, [1, 0, 0.8])).toBe(true);
    expectOutwardWinding(geometry.vertices, geometry.indices);
    expectClosedTopology(geometry.vertices, geometry.indices);
  });

  it('should generate a closed, flat-shaded, outward-facing unit pyramid', () => {
    const geometry = createPrimitiveGeometry('pyramid');
    const inverseSqrtFive = 1 / Math.sqrt(5);

    expect(geometry.triangleCount).toBe(6);
    expect(geometry.indices).toEqual(new Uint32Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 12, 14, 15]));
    expect(geometry.vertices).toEqual(
      new Float32Array([
        -0.5,
        -0.5,
        -0.5,
        0,
        -2 * inverseSqrtFive,
        inverseSqrtFive,
        0.5,
        -0.5,
        -0.5,
        0,
        -2 * inverseSqrtFive,
        inverseSqrtFive,
        0,
        0,
        0.5,
        0,
        -2 * inverseSqrtFive,
        inverseSqrtFive,
        0.5,
        -0.5,
        -0.5,
        2 * inverseSqrtFive,
        0,
        inverseSqrtFive,
        0.5,
        0.5,
        -0.5,
        2 * inverseSqrtFive,
        0,
        inverseSqrtFive,
        0,
        0,
        0.5,
        2 * inverseSqrtFive,
        0,
        inverseSqrtFive,
        0.5,
        0.5,
        -0.5,
        0,
        2 * inverseSqrtFive,
        inverseSqrtFive,
        -0.5,
        0.5,
        -0.5,
        0,
        2 * inverseSqrtFive,
        inverseSqrtFive,
        0,
        0,
        0.5,
        0,
        2 * inverseSqrtFive,
        inverseSqrtFive,
        -0.5,
        0.5,
        -0.5,
        -2 * inverseSqrtFive,
        0,
        inverseSqrtFive,
        -0.5,
        -0.5,
        -0.5,
        -2 * inverseSqrtFive,
        0,
        inverseSqrtFive,
        0,
        0,
        0.5,
        -2 * inverseSqrtFive,
        0,
        inverseSqrtFive,
        -0.5,
        -0.5,
        -0.5,
        0,
        0,
        -1,
        -0.5,
        0.5,
        -0.5,
        0,
        0,
        -1,
        0.5,
        0.5,
        -0.5,
        0,
        0,
        -1,
        0.5,
        -0.5,
        -0.5,
        0,
        0,
        -1
      ])
    );
    expect(getBounds(geometry.vertices)).toEqual({ max: [0.5, 0.5, 0.5], min: [-0.5, -0.5, -0.5] });
    expectOutwardWinding(geometry.vertices, geometry.indices);
  });
});

function getBounds(vertices: Float32Array): { max: number[]; min: number[] } {
  const max = [-Infinity, -Infinity, -Infinity];
  const min = [Infinity, Infinity, Infinity];
  for (let offset = 0; offset < vertices.length; offset += 6) {
    for (let axis = 0; axis < 3; axis += 1) {
      min[axis] = Math.min(min[axis]!, vertices[offset + axis]!);
      max[axis] = Math.max(max[axis]!, vertices[offset + axis]!);
    }
  }
  return { max, min };
}

function expectOutwardWinding(vertices: Float32Array, indices: Uint32Array): void {
  for (let offset = 0; offset < indices.length; offset += 3) {
    const first = indices[offset]! * 6;
    const second = indices[offset + 1]! * 6;
    const third = indices[offset + 2]! * 6;
    const ab = subtractVertex(vertices, second, first);
    const ac = subtractVertex(vertices, third, first);
    const normal = vertices.subarray(first + 3, first + 6);
    expect(dot(cross(ab, ac), normal)).toBeGreaterThan(0);
  }
}

function expectClosedTopology(vertices: Float32Array, indices: Uint32Array): void {
  const edgeCounts = new Map<string, number>();
  for (let offset = 0; offset < indices.length; offset += 3) {
    const triangle = [indices[offset]!, indices[offset + 1]!, indices[offset + 2]!];
    for (let edge = 0; edge < 3; edge += 1) {
      const start = vertexKey(vertices, triangle[edge]!);
      const end = vertexKey(vertices, triangle[(edge + 1) % 3]!);
      const key = start < end ? `${start}|${end}` : `${end}|${start}`;
      edgeCounts.set(key, (edgeCounts.get(key) ?? 0) + 1);
    }
  }
  expect([...edgeCounts].filter(([, count]) => count !== 2)).toEqual([]);
}

function vertexKey(vertices: Float32Array, index: number): string {
  const offset = index * 6;
  return [vertices[offset], vertices[offset + 1], vertices[offset + 2]]
    .map(value => (Math.abs(value ?? 0) < 0.0000005 ? 0 : (value ?? 0)).toFixed(6))
    .join(',');
}

function hasVertexAt(vertices: Float32Array, expected: [number, number, number]): boolean {
  for (let offset = 0; offset < vertices.length; offset += 6) {
    if (expected.every((value, index) => Math.abs(vertices[offset + index]! - value) < 0.000001)) return true;
  }
  return false;
}

function subtractVertex(values: Float32Array, left: number, right: number): [number, number, number] {
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
