// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { classifyPointInRing, pointInPolygon, ringsIntersect, ringSelfIntersects, type Point2 } from './geometry-2d.js';
import { PolygonFillQuery, RingQuery, RING_INDEX_THRESHOLD } from './ring-query.js';

function ring(count: number, radius = 100, offset: Point2 = [0, 0]): Point2[] {
  return Array.from({ length: count }, (_, index) => {
    const angle = (index / count) * Math.PI * 2;
    const distance = index % 2 === 0 ? radius : radius * 0.8;
    return [offset[0] + Math.cos(angle) * distance, offset[1] + Math.sin(angle) * distance];
  });
}

describe(RingQuery.name, () => {
  it.each([0, 3, RING_INDEX_THRESHOLD - 1, RING_INDEX_THRESHOLD, RING_INDEX_THRESHOLD + 1, 257])(
    'matches direct classification and intersection predicates with %i vertices',
    count => {
      const original = ring(count);
      const crossed = [...original];
      if (count > 3) [crossed[1], crossed[Math.floor(count / 2)]] = [crossed[Math.floor(count / 2)]!, crossed[1]!];
      for (const points of [original, [...original].reverse(), crossed]) {
        const query = new RingQuery(points);
        expect(query.selfIntersects()).toBe(ringSelfIntersects(points));
        const samples: Point2[] = [[0, 0], [110, 0], ...points];
        for (let index = 0; index < points.length; index += 1) {
          const start = points[index]!;
          const end = points[(index + 1) % points.length]!;
          samples.push([(start[0] + end[0]) / 2, (start[1] + end[1]) / 2]);
        }
        for (let index = 0; index < 100; index += 1) samples.push([index * 2.17 - 108, index * 1.39 - 72]);
        for (const point of samples) expect(query.classify(point)).toBe(classifyPointInRing(point, points));
        for (const other of [ring(3, 10), ring(129, 25, [90, 0]), ring(129, 25, [200, 0])]) {
          const otherQuery = new RingQuery(other);
          expect(query.intersects(otherQuery)).toBe(ringsIntersect(points, other));
          expect(otherQuery.intersects(query)).toBe(ringsIntersect(other, points));
        }
      }
    }
  );

  it('matches exact predicates for collinear, touching, duplicate, and zero-length edges', () => {
    const points: Point2[] = Array.from({ length: 160 }, (_, index) => [index % 20, Math.floor(index / 20)]);
    points[2] = points[1]!;
    const query = new RingQuery(points);
    expect(query.selfIntersects()).toBe(ringSelfIntersects(points));
    for (const point of [
      [0, 0],
      [1, 0],
      [19, 3],
      [5, Number.EPSILON],
      [10, 1.5]
    ] satisfies Point2[]) {
      expect(query.classify(point)).toBe(classifyPointInRing(point, points));
    }
    const touching = new RingQuery([
      [19, 3],
      [25, 3],
      [25, 8]
    ]);
    expect(query.intersects(touching)).toBe(true);
    expect(touching.intersects(query)).toBe(true);
  });

  it('matches classification with large finite coordinates and near-boundary points', () => {
    const points = ring(129, 1e150);
    const query = new RingQuery(points);
    for (const point of [[0, 0], [1e150, 0], [1e150 * (1 - Number.EPSILON), 0], ...points] satisfies Point2[]) {
      expect(query.classify(point)).toBe(classifyPointInRing(point, points));
    }
  });
});

describe(PolygonFillQuery.name, () => {
  it('shares indexed ring queries while excluding all outer and hole boundaries', () => {
    const outer = ring(257);
    const holes = [ring(129, 10, [-30, 0]), ring(129, 15, [30, 0])];
    const query = new PolygonFillQuery(outer, holes);
    const samples: Point2[] = [[0, 0], [-30, 0], [30, 0], [150, 0], ...outer, ...holes.flat()];
    for (const point of samples) expect(query.contains(point)).toBe(pointInPolygon(point, outer, holes));
  });
});
