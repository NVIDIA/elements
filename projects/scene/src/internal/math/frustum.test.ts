// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { createOrthographicMatrix, createPerspectiveMatrix } from '../composition/camera/math.js';
import { classifyAabbFrustum, type AabbBounds, type FrustumRelation } from './frustum.js';
import {
  composePreciseMat4,
  identityMat4,
  identityPreciseMat4,
  multiplyPreciseMat4,
  multiplyMat4Vec4
} from './mat4.js';
import type { Matrix4, Vec3 } from './types.js';

function box(minimum: Readonly<Vec3>, maximum: Readonly<Vec3>): AabbBounds {
  return {
    minimumX: minimum[0],
    minimumY: minimum[1],
    minimumZ: minimum[2],
    maximumX: maximum[0],
    maximumY: maximum[1],
    maximumZ: maximum[2]
  };
}

// Reference evaluates all eight transformed corners instead of center/radius support distances.
function classifyCorners(bounds: AabbBounds, transform: Matrix4): FrustumRelation {
  const corners: number[][] = [];
  for (const x of [bounds.minimumX, bounds.maximumX]) {
    for (const y of [bounds.minimumY, bounds.maximumY]) {
      for (const z of [bounds.minimumZ, bounds.maximumZ]) {
        const [clipX, clipY, clipZ, clipW] = multiplyMat4Vec4(transform, [x, y, z, 1]);
        corners.push([clipW + clipX, clipW - clipX, clipW + clipY, clipW - clipY, clipZ, clipW - clipZ]);
      }
    }
  }
  if (Array.from({ length: 6 }, (_, plane) => corners.every(corner => corner[plane]! < 0)).some(Boolean))
    return 'outside';
  return corners.every(corner => corner.every(distance => distance >= 0)) ? 'inside' : 'intersecting';
}

describe(classifyAabbFrustum.name, () => {
  it.each([
    { name: 'left', bounds: box([-2, -0.5, 0.25], [-1.25, 0.5, 0.75]) },
    { name: 'right', bounds: box([1.25, -0.5, 0.25], [2, 0.5, 0.75]) },
    { name: 'bottom', bounds: box([-0.5, -2, 0.25], [0.5, -1.25, 0.75]) },
    { name: 'top', bounds: box([-0.5, 1.25, 0.25], [0.5, 2, 0.75]) },
    { name: 'near', bounds: box([-0.5, -0.5, -0.75], [0.5, 0.5, -0.25]) },
    { name: 'far', bounds: box([-0.5, -0.5, 1.25], [0.5, 0.5, 2]) }
  ])('rejects a box beyond the $name WebGPU plane', ({ bounds }) => {
    expect(classifyAabbFrustum(bounds, identityMat4())).toBe('outside');
  });

  it.each([
    box([-1, -1, 0], [1, 1, 1]),
    box([-1, 0, 0.5], [-1, 0, 0.5]),
    box([1, 0, 0.5], [1, 0, 0.5]),
    box([0, -1, 0.5], [0, -1, 0.5]),
    box([0, 1, 0.5], [0, 1, 0.5]),
    box([0, 0, 0], [0, 0, 0]),
    box([0, 0, 1], [0, 0, 1])
  ])('includes exact plane boundaries and degenerate boxes %#', bounds => {
    expect(classifyAabbFrustum(bounds, identityPreciseMat4())).toBe('inside');
  });

  it.each([
    box([-2, -0.5, 0.25], [-1, 0.5, 0.75]),
    box([1, -0.5, 0.25], [2, 0.5, 0.75]),
    box([-0.5, -2, 0.25], [0.5, -1, 0.75]),
    box([-0.5, 1, 0.25], [0.5, 2, 0.75]),
    box([-0.5, -0.5, -1], [0.5, 0.5, 0]),
    box([-0.5, -0.5, 1], [0.5, 0.5, 2]),
    box([-2, -2, -1], [2, 2, 2])
  ])('keeps touching and spanning boxes as conservative candidates %#', bounds => {
    expect(classifyAabbFrustum(bounds, identityMat4())).toBe('intersecting');
  });

  it('rejects a later plane even after an earlier plane intersects', () => {
    expect(classifyAabbFrustum(box([-2, -0.5, 2], [0, 0.5, 3]), identityMat4())).toBe('outside');
  });

  it('distinguishes points immediately inside and outside a boundary without a tolerance', () => {
    expect(
      classifyAabbFrustum(box([1 - Number.EPSILON, 0, 0.5], [1 - Number.EPSILON, 0, 0.5]), identityPreciseMat4())
    ).toBe('inside');
    expect(
      classifyAabbFrustum(box([1 + Number.EPSILON, 0, 0.5], [1 + Number.EPSILON, 0, 0.5]), identityPreciseMat4())
    ).toBe('outside');
  });

  it('preserves Float64 translations below the Float32 precision boundary', () => {
    const transform = identityPreciseMat4();
    transform[12] = 1 + Number.EPSILON;
    const point = box([0, 0, 0.5], [0, 0, 0.5]);
    expect(classifyAabbFrustum(point, transform)).toBe('outside');
    expect(classifyAabbFrustum(point, new Float32Array(transform))).toBe('inside');
  });

  it('classifies perspective depth and boxes behind the camera conservatively', () => {
    const projection = createPerspectiveMatrix(Math.PI / 3, 1, 1, 10);
    expect(classifyAabbFrustum(box([-0.1, -0.1, -3], [0.1, 0.1, -2]), projection)).toBe('inside');
    expect(classifyAabbFrustum(box([-0.1, -0.1, -1.5], [0.1, 0.1, -0.5]), projection)).toBe('intersecting');
    expect(classifyAabbFrustum(box([-0.1, -0.1, 1], [0.1, 0.1, 2]), projection)).toBe('outside');
    expect(classifyAabbFrustum(box([-0.1, -0.1, -12], [0.1, 0.1, -11]), projection)).toBe('outside');
  });

  it('handles finite zero planes without normalization', () => {
    const transform = new Float64Array(16);
    expect(classifyAabbFrustum(box([-2, -2, -2], [2, 2, 2]), transform)).toBe('inside');
  });

  it('matches exhaustive corner classification under seeded affine and perspective transforms', () => {
    let state = 7;
    const random = () => (state = (Math.imul(state, 1664525) + 1013904223) >>> 0) / 0x1_0000_0000;
    const projections = [
      identityPreciseMat4(),
      createOrthographicMatrix(8, 1.5, 0.1, 40),
      createPerspectiveMatrix((55 * Math.PI) / 180, 1.4, 0.1, 40)
    ];
    for (let fixture = 0; fixture < 600; fixture += 1) {
      const minimum: Vec3 = [random() * 4 - 2, random() * 4 - 2, random() * 4 - 2];
      const maximum: Vec3 = [minimum[0] + random() * 2, minimum[1] + random() * 2, minimum[2] + random() * 2];
      const bounds = box(minimum, maximum);
      const frame = composePreciseMat4(
        [random() * 20 - 10, random() * 20 - 10, -random() * 50],
        [random(), random(), random(), 1],
        [random() * 4 - 2, random() * 4 - 2, random() * 4 - 2]
      );
      const transform = multiplyPreciseMat4(projections[fixture % projections.length]!, frame);
      const source = structuredClone(bounds);
      expect(classifyAabbFrustum(bounds, transform)).toBe(classifyCorners(bounds, transform));
      expect(bounds).toEqual(source);
    }
  });
});
