// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { identityPreciseMat4, invertPreciseMat4, multiplyPreciseMat4, transformPointMat4 } from './mat4.js';
import {
  createCameraViewMatrix,
  createOrthographicMatrix,
  createPerspectiveMatrix,
  createProjectionRay,
  isInsideClipVolume,
  ndcToViewport,
  projectPoint,
  unprojectPoint,
  viewportToNdc
} from './projection.js';
import type { Matrix4, Vec3 } from './types.js';

function inverse(matrix: Matrix4) {
  const result = invertPreciseMat4(matrix);
  if (!result) throw new Error('Expected an invertible fixture.');
  return result;
}

function expectPoint(actual: Readonly<Vec3> | null | undefined, expected: Readonly<Vec3>, digits = 10) {
  expect(actual).not.toBeNull();
  expected.forEach((value, axis) => expect(actual?.[axis]).toBeCloseTo(value, digits));
}

describe(createCameraViewMatrix.name, () => {
  it('maps optical right, down, and forward to right, up, and backward and preserves roll', () => {
    const view = createCameraViewMatrix({ position: [0, 0, 0], orientation: [0, 0, 0, 1] });
    expect(transformPointMat4(view, [1, 2, 3])).toEqual([1, -2, -3]);
    const roll = Math.PI / 2;
    const rolled = createCameraViewMatrix({
      position: [0, 0, 0],
      orientation: [0, 0, Math.sin(roll / 2), Math.cos(roll / 2)]
    });
    expectPoint(transformPointMat4(rolled, [0, 1, 0]), [1, 0, 0]);
    expectPoint(transformPointMat4(rolled, [1, 0, 0]), [0, 1, 0]);
  });

  it('normalizes orientation and retains small offsets at a large camera origin', () => {
    const position: Vec3 = [1e12 + 0.125, -1e12, 1e12];
    const view = createCameraViewMatrix({ position, orientation: [0, 0, 0, 3] });
    expect(view).toBeInstanceOf(Float64Array);
    expect(transformPointMat4(view, [position[0] + 0.25, position[1] + 0.5, position[2] + 2])).toEqual([
      0.25, -0.5, -2
    ]);
    expect(position).toEqual([1e12 + 0.125, -1e12, 1e12]);
  });
});

describe('WebGPU projection matrices', () => {
  it('maps perspective near, far, and frustum edges to zero-to-one depth and NDC xy', () => {
    const matrix = createPerspectiveMatrix(Math.PI / 2, 2, 2, 10);
    expect(matrix).toBeInstanceOf(Float64Array);
    expect(matrix[10]).toBe(-1.25);
    expect(matrix[14]).toBe(-2.5);
    expectPoint(projectPoint(matrix, [4, 2, -2]), [1, 1, 0]);
    expectPoint(projectPoint(matrix, [-20, -10, -10]), [-1, -1, 1]);
    expectPoint(projectPoint(matrix, [0, 0, -1]), [0, 0, -1.25]);
    expect(projectPoint(matrix, [0, 0, 1])).toBeNull();
  });

  it('maps orthographic near and far without changing the xy footprint', () => {
    const matrix = createOrthographicMatrix(4, 2, 2, 10);
    expect(matrix).toBeInstanceOf(Float64Array);
    expect(matrix[10]).toBe(-0.125);
    expect(matrix[14]).toBe(-0.25);
    expectPoint(projectPoint(matrix, [4, 2, -2]), [1, 1, 0]);
    expectPoint(projectPoint(matrix, [-4, -2, -10]), [-1, -1, 1]);
    expectPoint(projectPoint(matrix, [4, 2, -6]), [1, 1, 0.5]);
  });

  it.each([Number.NaN, Number.NEGATIVE_INFINITY, 0, -1, Math.PI, Math.PI + 1])(
    'rejects invalid perspective field of view %s',
    fieldOfView => {
      expect(() => createPerspectiveMatrix(fieldOfView, 1, 0.1, 10)).toThrow(RangeError);
    }
  );

  it.each([Number.NaN, Number.POSITIVE_INFINITY, 0, -1])('rejects invalid sizes and aspects %s', value => {
    expect(() => createOrthographicMatrix(value, 1, 0.1, 10)).toThrow(RangeError);
    expect(() => createOrthographicMatrix(4, value, 0.1, 10)).toThrow(RangeError);
    expect(() => createPerspectiveMatrix(1, value, 0.1, 10)).toThrow(RangeError);
  });

  it.each([
    [0, 10],
    [-1, 10],
    [10, 10],
    [11, 10],
    [Number.NaN, 10],
    [1, Number.POSITIVE_INFINITY]
  ])('rejects invalid clipping distances %s, %s', (near, far) => {
    expect(() => createPerspectiveMatrix(1, 1, near, far)).toThrow(RangeError);
    expect(() => createOrthographicMatrix(4, 1, near, far)).toThrow(RangeError);
  });
});

describe('viewport coordinates', () => {
  const size = { width: 800, height: 200 };

  it.each([
    { viewport: [0, 0, 0], ndc: [-1, 1, 0] },
    { viewport: [800, 200, 1], ndc: [1, -1, 1] },
    { viewport: [400, 100, 0.75], ndc: [0, 0, 0.75] },
    { viewport: [100.5, 20.25, -1], ndc: [-0.74875, 0.7975, -1] },
    { viewport: [-400, 300, 2], ndc: [-2, -2, 2] }
  ] satisfies { viewport: Vec3; ndc: Vec3 }[])('maps $viewport to $ndc without rounding or clipping', fixture => {
    expectPoint(viewportToNdc(fixture.viewport, size), fixture.ndc);
    expectPoint(ndcToViewport(fixture.ndc, size), fixture.viewport);
  });
});

describe('homogeneous projection', () => {
  it('retains offscreen coordinates and tiny positive w during forward projection', () => {
    const matrix = identityPreciseMat4();
    matrix[12] = 1 + 2 ** -40;
    matrix[15] = 2;
    expect(projectPoint(matrix, [0, 4, 3])).toEqual([(1 + 2 ** -40) / 2, 2, 1.5]);
    matrix[15] = Number.EPSILON / 2;
    expect(projectPoint(matrix, [0, 0, 0])?.[0]).toBe((1 + 2 ** -40) * (2 / Number.EPSILON));
    matrix[15] = Number.MIN_VALUE;
    expect(projectPoint(matrix, [0, 0, 0])).toEqual([Infinity, Number.NaN, Number.NaN]);
  });

  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])('rejects forward clip w %s', w => {
    const matrix = identityPreciseMat4();
    matrix[15] = w;
    expect(projectPoint(matrix, [0, 0, 1])).toBeNull();
  });

  it('rejects nonfinite clip xyz even when w is positive', () => {
    const matrix = identityPreciseMat4();
    matrix[12] = Number.POSITIVE_INFINITY;
    expect(projectPoint(matrix, [0, 0, 1])).toBeNull();
    expect(projectPoint(identityPreciseMat4(), [Number.NaN, 0, 1])).toBeNull();
  });

  it.each([-2, -Number.EPSILON, Number.EPSILON, 2])('unprojects finite points at signed w %s', w => {
    const matrix = identityPreciseMat4();
    matrix[12] = 1 + 2 ** -40;
    matrix[15] = w;
    expect(unprojectPoint(matrix, [0, 2, 0.75])).toEqual([(1 + 2 ** -40) / w, 2 / w, 0.75 / w]);
  });

  it.each([0, Number.EPSILON / 2, -Number.EPSILON / 2, Number.NaN, Number.POSITIVE_INFINITY])(
    'rejects unsafe unprojection w %s',
    w => {
      const matrix = identityPreciseMat4();
      matrix[15] = w;
      expect(unprojectPoint(matrix, [1, 2, 0.75])).toBeNull();
    }
  );

  it('rejects nonfinite inverse coordinates and overflow after division', () => {
    const matrix = identityPreciseMat4();
    matrix[12] = Number.POSITIVE_INFINITY;
    expect(unprojectPoint(matrix, [0, 0, 0])).toBeNull();
    matrix[12] = Number.MAX_VALUE;
    matrix[15] = Number.EPSILON;
    expect(unprojectPoint(matrix, [0, 0, 0])).toBeNull();
  });

  it('preserves zero-w and tiny-w depth-sample arithmetic through an explicit policy', () => {
    const matrix = identityPreciseMat4();
    matrix[15] = 0;
    expect(unprojectPoint(matrix, [1, 2, 0.75], 'preserve-zero-w')).toEqual([1, 2, 0.75]);
    matrix[15] = Number.EPSILON / 2;
    expect(unprojectPoint(matrix, [1, 2, 0.75], 'preserve-zero-w')).toEqual([
      2 / Number.EPSILON,
      4 / Number.EPSILON,
      1.5 / Number.EPSILON
    ]);
    matrix[12] = Infinity;
    expect(unprojectPoint(matrix, [1, 2, 0.75], 'preserve-zero-w')[0]).toBe(Infinity);
  });

  it.each(['perspective', 'orthographic'] as const)('round trips a rolled, translated %s camera', mode => {
    const projection =
      mode === 'perspective'
        ? createPerspectiveMatrix(Math.PI / 3, 1.7, 0.5, 60)
        : createOrthographicMatrix(12, 1.7, 0.5, 60);
    const view = createCameraViewMatrix({ position: [16, -25, 7], orientation: [0.2, -0.3, 0.4, 0.8] });
    const matrix = multiplyPreciseMat4(projection, view);
    const inverted = inverse(matrix);
    const ndcPoints: Vec3[] = [
      [-0.8, 0.4, 0],
      [0, 0, 0.5],
      [1, -1, 1],
      [2, -3, 0.25]
    ];
    for (const point of ndcPoints) {
      const world = unprojectPoint(inverted, point);
      if (!world) throw new Error('Expected a finite world point.');
      expectPoint(projectPoint(matrix, world), point);
      expectPoint(unprojectPoint(inverted, point, 'preserve-zero-w'), world);
    }
  });
});

describe(isInsideClipVolume.name, () => {
  it.each([
    [-1, -1, 0],
    [1, 1, 1],
    [0, 0, 0.5]
  ] satisfies Vec3[])('includes boundary point %s', (x, y, z) => {
    expect(isInsideClipVolume([x, y, z])).toBe(true);
  });

  it.each([
    [-1.001, 0, 0.5],
    [1.001, 0, 0.5],
    [0, -1.001, 0.5],
    [0, 1.001, 0.5],
    [0, 0, -Number.EPSILON],
    [0, 0, 1 + Number.EPSILON],
    [Number.NaN, 0, 0.5],
    [0, Infinity, 0.5]
  ] satisfies Vec3[])('excludes point %s, %s, %s', (x, y, z) => {
    expect(isInsideClipVolume([x, y, z])).toBe(false);
  });
});

describe(createProjectionRay.name, () => {
  it('creates divergent perspective rays with near-plane origins', () => {
    const matrix = inverse(createPerspectiveMatrix(Math.PI / 2, 2, 2, 10));
    expectPoint(createProjectionRay(matrix, [0, 0])?.origin, [0, 0, -2]);
    expectPoint(createProjectionRay(matrix, [0, 0])?.direction, [0, 0, -1]);
    const corner = createProjectionRay(matrix, [1, 1]);
    expectPoint(corner?.origin, [4, 2, -2]);
    expectPoint(corner?.direction, [4 / Math.sqrt(24), 2 / Math.sqrt(24), -2 / Math.sqrt(24)]);
  });

  it('creates parallel orthographic rays with independent near-plane origins', () => {
    const matrix = inverse(createOrthographicMatrix(4, 2, 2, 10));
    expectPoint(createProjectionRay(matrix, [0, 0])?.origin, [0, 0, -2]);
    expectPoint(createProjectionRay(matrix, [0, 0])?.direction, [0, 0, -1]);
    expectPoint(createProjectionRay(matrix, [1, -1])?.origin, [4, -2, -2]);
    expectPoint(createProjectionRay(matrix, [1, -1])?.direction, [0, 0, -1]);
    expectPoint(createProjectionRay(matrix, [2, -2])?.origin, [8, -4, -2]);
  });

  it('rejects invalid endpoints, zero direction, and overflowing direction lengths', () => {
    const matrix = identityPreciseMat4();
    matrix[11] = -1;
    expect(createProjectionRay(matrix, [0, 0])).toBeNull();
    expect(createProjectionRay(new Float64Array(16), [0, 0])).toBeNull();
    matrix.set(identityPreciseMat4());
    matrix[10] = 0;
    expect(createProjectionRay(matrix, [0, 0])).toBeNull();
    matrix[10] = Number.MAX_VALUE;
    matrix[14] = -Number.MAX_VALUE / 2;
    matrix[15] = 0.5;
    expect(createProjectionRay(matrix, [0, 0])).toBeNull();
  });
});
