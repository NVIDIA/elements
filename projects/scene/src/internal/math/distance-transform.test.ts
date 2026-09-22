// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { createDistanceTransformWorkspace, squaredEuclideanDistanceTransform } from './distance-transform.js';

describe('squared Euclidean distance transform', () => {
  it('computes squared distances to a single site in a rectangular grid', () => {
    const distances = new Float64Array([Infinity, Infinity, Infinity, Infinity, Infinity, 0]);
    squaredEuclideanDistanceTransform({
      distances,
      width: 3,
      height: 2,
      workspace: createDistanceTransformWorkspace(3)
    });

    expect([...distances]).toEqual([5, 2, 1, 4, 1, 0]);
  });

  it.each([
    { width: 5, height: 1, costs: [Infinity, 2, Infinity, 0, Infinity] },
    { width: 1, height: 5, costs: [Infinity, 2, Infinity, 0, Infinity] },
    { width: 3, height: 2, costs: [0.25, Infinity, 4, 1, 0.5, Infinity] },
    { width: 2, height: 3, costs: [1e20, 1e20, 0, 1e20, 1e20, 0.0625] },
    { width: 1, height: 1, costs: [0.25] },
    { width: 1, height: 1, costs: [Infinity] },
    { width: 3, height: 2, costs: [Infinity, Infinity, Infinity, Infinity, Infinity, Infinity] },
    { width: 2, height: 2, costs: [0, 0, 0, 0] },
    { width: 3, height: 1, costs: [Number.MAX_VALUE, 0, Number.MAX_VALUE] }
  ])('matches brute-force weighted distances for fixture %#', ({ width, height, costs }) => {
    const distances = new Float64Array(costs);
    const workspace = createDistanceTransformWorkspace(Math.max(width, height));
    squaredEuclideanDistanceTransform({ distances, width, height, workspace });

    expect([...distances]).toEqual(bruteForceDistances(costs, width, height));
  });

  it('matches an independent reference over varied weighted grids using one workspace', () => {
    const workspace = createDistanceTransformWorkspace(9);
    let seed = 127;
    for (let fixture = 0; fixture < 100; fixture += 1) {
      const width = (fixture % 9) + 1;
      const height = (Math.floor(fixture / 9) % 7) + 1;
      const costs = Array.from({ length: width * height }, () => {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        return seed % 5 === 0 ? Infinity : (seed % 113) / 8;
      });
      const distances = new Float64Array(costs);
      squaredEuclideanDistanceTransform({ distances, width, height, workspace });

      expect([...distances]).toEqual(bruteForceDistances(costs, width, height));
    }
  });

  it('leaves the array tail untouched and handles empty grids', () => {
    const distances = new Float64Array([Infinity, 0, Infinity, -17, Number.NaN]);
    squaredEuclideanDistanceTransform({
      distances,
      width: 3,
      height: 1,
      workspace: createDistanceTransformWorkspace(3)
    });
    expect([...distances]).toEqual([1, 0, 1, -17, Number.NaN]);
    squaredEuclideanDistanceTransform({
      distances,
      width: 0,
      height: 100,
      workspace: createDistanceTransformWorkspace(0)
    });
    squaredEuclideanDistanceTransform({
      distances,
      width: 100,
      height: 0,
      workspace: createDistanceTransformWorkspace(0)
    });
    expect([...distances]).toEqual([1, 0, 1, -17, Number.NaN]);
  });

  it.each([-1, 0.5, Number.NaN, Infinity, 0x1_0000_0000])('rejects invalid workspace capacity %s', capacity => {
    expect(() => createDistanceTransformWorkspace(capacity)).toThrow(RangeError);
  });

  it.each([
    { width: -1, height: 1 },
    { width: 1, height: -1 },
    { width: 0.5, height: 1 },
    { width: 1, height: 0.5 },
    { width: Number.NaN, height: 1 },
    { width: 1, height: Infinity },
    { width: 3, height: 2 },
    { width: Number.MAX_SAFE_INTEGER, height: 2 }
  ])('rejects invalid grid dimensions %# before mutation', dimensions => {
    const distances = new Float64Array([Infinity, 0, 1, 0]);
    const original = distances.slice();
    expect(() =>
      squaredEuclideanDistanceTransform({
        ...dimensions,
        distances,
        workspace: createDistanceTransformWorkspace(4)
      })
    ).toThrow(RangeError);
    expect(distances).toEqual(original);
  });

  it.each(['line', 'sites', 'boundaries'] as const)('rejects insufficient %s scratch capacity', field => {
    const workspace = createDistanceTransformWorkspace(3);
    const undersized = { ...workspace, [field]: workspace[field].subarray(0, 1) };
    expect(() =>
      squaredEuclideanDistanceTransform({ distances: new Float64Array(3), width: 3, height: 1, workspace: undersized })
    ).toThrow(RangeError);
  });

  it.each([Number.NaN, -Infinity, -1])('rejects invalid cost %s before mutation', cost => {
    const distances = new Float64Array([Infinity, 0, cost]);
    const original = distances.slice();
    expect(() =>
      squaredEuclideanDistanceTransform({
        distances,
        width: 3,
        height: 1,
        workspace: createDistanceTransformWorkspace(3)
      })
    ).toThrow(RangeError);
    expect(distances).toEqual(original);
  });
});

function bruteForceDistances(costs: readonly number[], width: number, height: number): number[] {
  return Array.from({ length: width * height }, (_, point) => {
    let minimum = Infinity;
    for (let site = 0; site < costs.length; site += 1) {
      const dx = (point % width) - (site % width);
      const dy = Math.floor(point / width) - Math.floor(site / width);
      minimum = Math.min(minimum, costs[site]! + dx * dx + dy * dy);
    }
    return minimum;
  });
}
