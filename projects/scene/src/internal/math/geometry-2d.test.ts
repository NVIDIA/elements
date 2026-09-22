// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import {
  classifyPointInRing,
  isCollinearBetween,
  orient2D,
  pointInCounterclockwiseTriangle,
  pointInPolygon,
  pointOnSegment,
  pointStrictlyOnSegment,
  samePoint,
  ringSelfIntersects,
  ringsIntersect,
  segmentsConflict,
  segmentsIntersect,
  signedDoubleArea,
  type Point2
} from './geometry-2d.js';

describe('2D geometric predicates', () => {
  it('distinguishes clockwise, counterclockwise, collinear, and small nonzero turns', () => {
    expect(orient2D([0, 0], [4, 0], [0, 3])).toBe(12);
    expect(orient2D([0, 0], [0, 3], [4, 0])).toBe(-12);
    expect(orient2D([0, 0], [1, 1], [2, 2])).toBe(0);
    expect(orient2D([0, 0], [1, 0], [1, Number.EPSILON])).toBe(Number.EPSILON);
  });

  it('computes signed ring areas and handles empty or degenerate rings', () => {
    const ring: Point2[] = [
      [10, 20],
      [14, 20],
      [14, 23],
      [10, 23]
    ];
    expect(signedDoubleArea(ring)).toBe(24);
    expect(signedDoubleArea(ring.slice().reverse())).toBe(-24);
    expect(signedDoubleArea([])).toBe(0);
    expect(signedDoubleArea([[1, 2]])).toBe(0);
    expect(
      signedDoubleArea([
        [1, 2],
        [3, 4]
      ])
    ).toBe(0);
  });

  it('compares coordinate values and treats missing points as unequal', () => {
    expect(samePoint([1, 2], [1, 2])).toBe(true);
    expect(samePoint([1, 2], [1, 3])).toBe(false);
    expect(samePoint([1, 2], [3, 2])).toBe(false);
    expect(samePoint(undefined, [1, 2])).toBe(false);
    expect(samePoint([1, 2], undefined)).toBe(false);
    expect(samePoint(undefined, undefined)).toBe(false);
  });

  it.each([
    { point: [1, 0], between: true },
    { point: [0, 0], between: true },
    { point: [2, 0], between: true },
    { point: [3, 0], between: false },
    { point: [-1, 0], between: false },
    { point: [1, 1], between: false }
  ] satisfies Array<{ point: Point2; between: boolean }>)(
    'tests collinear membership for $point',
    ({ point, between }) => {
      expect(isCollinearBetween([0, 0], point, [2, 0])).toBe(between);
      expect(isCollinearBetween([2, 0], point, [0, 0])).toBe(between);
      expect(pointOnSegment(point, [0, 0], [2, 0])).toBe(between);
      expect(pointStrictlyOnSegment(point, [0, 0], [2, 0])).toBe(between && point[0] === 1);
    }
  );

  it('handles diagonal and zero-length segments', () => {
    expect(pointOnSegment([2, 2], [1, 1], [3, 3])).toBe(true);
    expect(pointOnSegment([4, 4], [1, 1], [3, 3])).toBe(false);
    expect(pointOnSegment([1, 1], [1, 1], [1, 1])).toBe(true);
    expect(pointOnSegment([1, 2], [1, 1], [1, 1])).toBe(false);
    expect(pointStrictlyOnSegment([1, 1], [1, 1], [1, 1])).toBe(false);
  });

  it.each([
    {
      points: [
        [0, 0],
        [4, 4],
        [0, 4],
        [4, 0]
      ],
      intersects: true
    },
    {
      points: [
        [0, 0],
        [4, 0],
        [4, 0],
        [4, 4]
      ],
      intersects: true
    },
    {
      points: [
        [0, 0],
        [4, 0],
        [2, 0],
        [2, 4]
      ],
      intersects: true
    },
    {
      points: [
        [0, 0],
        [4, 0],
        [2, 0],
        [6, 0]
      ],
      intersects: true
    },
    {
      points: [
        [0, 0],
        [4, 0],
        [0, 1],
        [4, 1]
      ],
      intersects: false
    },
    {
      points: [
        [0, 0],
        [4, 0],
        [5, 0],
        [6, 0]
      ],
      intersects: false
    },
    {
      points: [
        [2, 0],
        [2, 0],
        [0, 0],
        [4, 0]
      ],
      intersects: true
    },
    {
      points: [
        [2, 1],
        [2, 1],
        [0, 0],
        [4, 0]
      ],
      intersects: false
    },
    {
      points: [
        [1, 1],
        [1, 1],
        [1, 1],
        [1, 1]
      ],
      intersects: true
    },
    {
      points: [
        [1, 1],
        [1, 1],
        [2, 2],
        [2, 2]
      ],
      intersects: false
    }
  ] satisfies Array<{ points: [Point2, Point2, Point2, Point2]; intersects: boolean }>)(
    'tests closed-segment intersection %#',
    ({ points: [a, b, c, d], intersects }) => {
      expect(segmentsIntersect(a, b, c, d)).toBe(intersects);
      expect(segmentsIntersect(b, a, c, d)).toBe(intersects);
      expect(segmentsIntersect(a, b, d, c)).toBe(intersects);
      expect(segmentsIntersect(c, d, a, b)).toBe(intersects);
    }
  );

  it.each([
    { point: [0.5, 3], classification: 'inside' },
    { point: [0.5, 1], classification: 'inside' },
    { point: [3, 3], classification: 'outside' },
    { point: [-1, 1], classification: 'outside' },
    { point: [3, 1], classification: 'boundary' },
    { point: [1, 1], classification: 'boundary' },
    { point: [0, 0], classification: 'boundary' },
    { point: [0, 2], classification: 'boundary' }
  ] satisfies Array<{ point: Point2; classification: string }>)(
    'classifies points against either winding %#',
    ({ point, classification }) => {
      const ring: Point2[] = [
        [0, 0],
        [4, 0],
        [4, 1],
        [1, 1],
        [1, 4],
        [0, 4]
      ];
      expect(classifyPointInRing(point, ring)).toBe(classification);
      expect(classifyPointInRing(point, ring.slice().reverse())).toBe(classification);
    }
  );

  it('excludes triangle edges, vertices, reversed winding, and degenerate triangles', () => {
    expect(pointInCounterclockwiseTriangle([1, 1], [0, 0], [4, 0], [0, 4])).toBe(true);
    expect(pointInCounterclockwiseTriangle([2, 2], [0, 0], [4, 0], [0, 4])).toBe(false);
    expect(pointInCounterclockwiseTriangle([0, 0], [0, 0], [4, 0], [0, 4])).toBe(false);
    expect(pointInCounterclockwiseTriangle([4, 4], [0, 0], [4, 0], [0, 4])).toBe(false);
    expect(pointInCounterclockwiseTriangle([1, 1], [0, 0], [0, 4], [4, 0])).toBe(false);
    expect(pointInCounterclockwiseTriangle([1, 0], [0, 0], [2, 0], [4, 0])).toBe(false);
  });

  it.each([
    {
      points: [
        [0, 0],
        [4, 4],
        [0, 4],
        [4, 0]
      ],
      conflicts: true
    },
    {
      points: [
        [0, 0],
        [4, 0],
        [4, 0],
        [4, 4]
      ],
      conflicts: false
    },
    {
      points: [
        [0, 0],
        [4, 0],
        [2, 0],
        [2, 4]
      ],
      conflicts: true
    },
    {
      points: [
        [0, 0],
        [4, 0],
        [2, 0],
        [6, 0]
      ],
      conflicts: true
    },
    {
      points: [
        [0, 0],
        [4, 0],
        [4, 0],
        [6, 0]
      ],
      conflicts: false
    },
    {
      points: [
        [0, 0],
        [4, 0],
        [0, 0],
        [4, 0]
      ],
      conflicts: false
    },
    {
      points: [
        [0, 0],
        [4, 0],
        [4, 0],
        [0, 0]
      ],
      conflicts: false
    },
    {
      points: [
        [0, 0],
        [4, 0],
        [0, 1],
        [4, 1]
      ],
      conflicts: false
    }
  ] satisfies Array<{ points: [Point2, Point2, Point2, Point2]; conflicts: boolean }>)(
    'distinguishes diagonal conflicts from permitted bridge contacts %#',
    ({ points: [a, b, c, d], conflicts }) => {
      expect(segmentsConflict(a, b, c, d)).toBe(conflicts);
      expect(segmentsConflict(c, d, a, b)).toBe(conflicts);
    }
  );

  it('detects self-intersections including the closing edge while ignoring adjacent contacts', () => {
    expect(
      ringSelfIntersects([
        [0, 0],
        [4, 0],
        [4, 4],
        [0, 4]
      ])
    ).toBe(false);
    expect(
      ringSelfIntersects([
        [0, 0],
        [4, 4],
        [0, 4],
        [4, 0]
      ])
    ).toBe(true);
    expect(
      ringSelfIntersects([
        [0, 0],
        [4, 0],
        [0, 4],
        [4, 4]
      ])
    ).toBe(true);
    expect(
      ringSelfIntersects([
        [0, 0],
        [4, 0],
        [0, 4]
      ])
    ).toBe(false);
    expect(ringSelfIntersects([])).toBe(false);
  });

  it('matches explicit edge-pair enumeration over varied rings', () => {
    let seed = 91;
    for (let fixture = 0; fixture < 100; fixture += 1) {
      const ring: Point2[] = Array.from({ length: fixture % 9 }, () => {
        seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
        return [seed % 11, (seed >>> 8) % 11];
      });
      expect(ringSelfIntersects(ring)).toBe(referenceSelfIntersection(ring));
    }
  });

  it('distinguishes ring edge intersection from containment', () => {
    const outer: Point2[] = [
      [0, 0],
      [4, 0],
      [4, 4],
      [0, 4]
    ];
    expect(
      ringsIntersect(outer, [
        [1, 1],
        [2, 1],
        [1, 2]
      ])
    ).toBe(false);
    expect(
      ringsIntersect(outer, [
        [4, 1],
        [5, 1],
        [4, 2]
      ])
    ).toBe(true);
    expect(
      ringsIntersect(outer, [
        [3, 1],
        [5, 1],
        [3, 2]
      ])
    ).toBe(true);
    expect(
      ringsIntersect(outer, [
        [5, 1],
        [6, 1],
        [5, 2]
      ])
    ).toBe(false);
    expect(ringsIntersect(outer, [])).toBe(false);
    expect(ringsIntersect([], outer)).toBe(false);
  });

  it.each([
    { point: [1, 1], inside: true },
    { point: [3, 3], inside: false },
    { point: [2, 3], inside: false },
    { point: [2, 2], inside: false },
    { point: [0, 3], inside: false },
    { point: [0, 0], inside: false },
    { point: [7, 3], inside: false }
  ] satisfies Array<{ point: Point2; inside: boolean }>)(
    'excludes holes and all boundaries from strict polygon fill %#',
    ({ point, inside }) => {
      const outer: Point2[] = [
        [0, 0],
        [6, 0],
        [6, 6],
        [0, 6]
      ];
      const hole: Point2[] = [
        [2, 2],
        [4, 2],
        [4, 4],
        [2, 4]
      ];
      expect(pointInPolygon(point, outer, [hole])).toBe(inside);
      expect(pointInPolygon(point, outer.slice().reverse(), [hole.slice().reverse()])).toBe(inside);
    }
  );

  it('supports strict polygon membership without holes', () => {
    expect(
      pointInPolygon(
        [1, 1],
        [
          [0, 0],
          [4, 0],
          [0, 4]
        ]
      )
    ).toBe(true);
  });
});

function referenceSelfIntersection(ring: readonly Point2[]): boolean {
  for (let first = 0; first < ring.length; first += 1) {
    const nextFirst = (first + 1) % ring.length;
    for (let second = first + 1; second < ring.length; second += 1) {
      const nextSecond = (second + 1) % ring.length;
      if (nextFirst === second || nextSecond === first) continue;
      if (segmentsIntersect(ring[first]!, ring[nextFirst]!, ring[second]!, ring[nextSecond]!)) return true;
    }
  }
  return false;
}
