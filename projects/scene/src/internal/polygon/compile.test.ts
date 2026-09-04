// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { compilePolygon, POLYGON_VERTEX_LIMIT } from './compile.js';
import type { PolygonGeometry, PolygonRing } from './types.js';

describe(compilePolygon.name, () => {
  it.each([
    {
      name: 'convex outer ring',
      data: {
        outer: [
          [0, 0],
          [4, 0],
          [4, 3],
          [0, 3]
        ]
      },
      area: 12
    },
    {
      name: 'concave outer ring',
      data: {
        outer: [
          [0, 0],
          [4, 0],
          [4, 4],
          [2, 2],
          [0, 4]
        ]
      },
      area: 12
    },
    {
      name: 'one hole',
      data: {
        outer: [
          [0, 0],
          [6, 0],
          [6, 6],
          [0, 6]
        ],
        holes: [
          [
            [2, 2],
            [2, 4],
            [4, 4],
            [4, 2]
          ]
        ]
      },
      area: 32
    },
    {
      name: 'multiple holes',
      data: {
        outer: [
          [0, 0],
          [10, 0],
          [10, 8],
          [0, 8]
        ],
        holes: [
          [
            [1, 1],
            [1, 3],
            [3, 3],
            [3, 1]
          ],
          [
            [6, 4],
            [6, 7],
            [9, 7],
            [9, 4]
          ]
        ]
      },
      area: 67
    },
    {
      name: 'reversed winding and closing vertices',
      data: {
        outer: [
          [0, 0],
          [0, 6],
          [6, 6],
          [6, 0],
          [0, 0]
        ],
        holes: [
          [
            [2, 2],
            [4, 2],
            [4, 4],
            [2, 4],
            [2, 2]
          ]
        ]
      },
      area: 32
    },
    {
      name: 'redundant collinear vertices',
      data: {
        outer: [
          [0, 0],
          [2, 0],
          [4, 0],
          [4, 4],
          [0, 4]
        ]
      },
      area: 16
    },
    {
      name: 'narrow corridor',
      data: {
        outer: [
          [0, 0],
          [8, 0],
          [8, 8],
          [4.01, 8],
          [4.01, 1],
          [3.99, 1],
          [3.99, 8],
          [0, 8]
        ]
      },
      area: 63.86
    }
  ] satisfies Array<{ name: string; data: PolygonGeometry; area: number }>)(
    'should triangulate $name with independent fill invariants',
    ({ data, area }) => {
      const first = compilePolygon(data);
      const second = compilePolygon(data);

      expect([...first.indices]).toEqual([...second.indices]);
      expect(triangleArea(first.positions, first.indices)).toBeCloseTo(area, 5);
      expect(first.indices.every(index => index < first.positions.length / 3)).toBe(true);
      for (let index = 0; index < first.indices.length; index += 3) {
        const triangle = trianglePoints(first.positions, first.indices, index);
        expect(cross(...triangle)).toBeGreaterThan(0);
        expect(pointInPolygon(centroid(...triangle), data)).toBe(true);
        expect(triangleCrossesBoundary(triangle, data)).toBe(false);
      }
    }
  );

  it('should triangulate seeded concave and disjoint-hole fixtures', () => {
    for (let seed = 1; seed <= 8; seed += 1) {
      const data = seededPolygon(seed);
      const compiled = compilePolygon(data);
      const expected =
        Math.abs(ringArea(data.outer)) - (data.holes ?? []).reduce((area, hole) => area + Math.abs(ringArea(hole)), 0);
      expect(triangleArea(compiled.positions, compiled.indices)).toBeCloseTo(expected, 4);
      for (let index = 0; index < compiled.indices.length; index += 3) {
        const triangle = trianglePoints(compiled.positions, compiled.indices, index);
        expect(pointInPolygon(centroid(...triangle), data)).toBe(true);
        expect(triangleCrossesBoundary(triangle, data), JSON.stringify({ seed, triangle })).toBe(false);
      }
    }
  });

  it.each([
    [
      'self-intersection',
      {
        outer: [
          [0, 0],
          [4, 4],
          [0, 4],
          [4, 0]
        ]
      }
    ],
    [
      'zero-area ring',
      {
        outer: [
          [0, 0],
          [1, 0],
          [2, 0]
        ]
      }
    ],
    [
      'outside hole',
      {
        outer: [
          [0, 0],
          [4, 0],
          [4, 4],
          [0, 4]
        ],
        holes: [
          [
            [5, 1],
            [6, 1],
            [6, 2],
            [5, 2]
          ]
        ]
      }
    ],
    [
      'touching hole',
      {
        outer: [
          [0, 0],
          [4, 0],
          [4, 4],
          [0, 4]
        ],
        holes: [
          [
            [0, 1],
            [1, 1],
            [1, 2],
            [0, 2]
          ]
        ]
      }
    ],
    [
      'intersecting holes',
      {
        outer: [
          [0, 0],
          [8, 0],
          [8, 8],
          [0, 8]
        ],
        holes: [
          [
            [1, 1],
            [5, 1],
            [5, 5],
            [1, 5]
          ],
          [
            [4, 4],
            [7, 4],
            [7, 7],
            [4, 7]
          ]
        ]
      }
    ],
    [
      'nested holes',
      {
        outer: [
          [0, 0],
          [8, 0],
          [8, 8],
          [0, 8]
        ],
        holes: [
          [
            [1, 1],
            [1, 7],
            [7, 7],
            [7, 1]
          ],
          [
            [2, 2],
            [2, 3],
            [3, 3],
            [3, 2]
          ]
        ]
      }
    ],
    [
      'malformed point',
      {
        outer: [
          [0, 0],
          [4, 0],
          [4, Number.NaN],
          [0, 4]
        ]
      }
    ]
  ])('should reject %s', (_name, data) => {
    expect(() => compilePolygon(data)).toThrow(RangeError);
  });

  it('should enforce the normalized vertex limit', () => {
    const outer = Array.from({ length: POLYGON_VERTEX_LIMIT + 1 }, (_, index) => {
      const angle = (index / (POLYGON_VERTEX_LIMIT + 1)) * Math.PI * 2;
      return [Math.cos(angle), Math.sin(angle)] as const;
    });
    expect(() => compilePolygon({ outer })).toThrow('normalized vertex limit');
  });
});

type Point = readonly [number, number];

function trianglePoints(positions: Float32Array, indices: Uint32Array, offset: number): [Point, Point, Point] {
  return [0, 1, 2].map(delta => {
    const vertex = indices[offset + delta]! * 3;
    return [positions[vertex]!, positions[vertex + 1]!] as const;
  }) as [Point, Point, Point];
}

function triangleArea(positions: Float32Array, indices: Uint32Array): number {
  let area = 0;
  for (let index = 0; index < indices.length; index += 3)
    area += cross(...trianglePoints(positions, indices, index)) / 2;
  return area;
}

function cross(first: Point, second: Point, third: Point): number {
  return (second[0] - first[0]) * (third[1] - first[1]) - (second[1] - first[1]) * (third[0] - first[0]);
}

function centroid(first: Point, second: Point, third: Point): Point {
  return [(first[0] + second[0] + third[0]) / 3, (first[1] + second[1] + third[1]) / 3];
}

function pointInPolygon(point: Point, data: PolygonGeometry): boolean {
  return pointInRing(point, data.outer) && !(data.holes ?? []).some(hole => pointInRing(point, hole));
}

function pointInRing(point: Point, ring: PolygonRing): boolean {
  let inside = false;
  for (let index = 0; index < ring.length; index += 1) {
    const start = ring[index]!;
    const end = ring[(index + 1) % ring.length]!;
    if (start[1] > point[1] !== end[1] > point[1]) {
      const crossing = start[0] + ((point[1] - start[1]) * (end[0] - start[0])) / (end[1] - start[1]);
      if (crossing > point[0]) inside = !inside;
    }
  }
  return inside;
}

function seededPolygon(seed: number): PolygonGeometry {
  let state = seed;
  const random = () => (state = (Math.imul(state, 1664525) + 1013904223) >>> 0) / 4294967296;
  const outer = Array.from({ length: 12 }, (_, index) => {
    const angle = (index / 12) * Math.PI * 2;
    const radius = index % 2 === 0 ? 18 : 13 + random();
    return [Math.cos(angle) * radius, Math.sin(angle) * radius] as const;
  });
  const centers = [
    [-7, -5],
    [6, -5],
    [-1, 7]
  ] as const;
  const holes = centers.map(([x, y]) => {
    const half = 0.8 + random() * 0.5;
    return [
      [x - half, y - half],
      [x - half, y + half],
      [x + half, y + half],
      [x + half, y - half]
    ] as const;
  });
  return { holes, outer };
}

function ringArea(ring: PolygonRing): number {
  let area = 0;
  for (let index = 0; index < ring.length; index += 1) {
    const point = ring[index]!;
    const next = ring[(index + 1) % ring.length]!;
    area += point[0] * next[1] - next[0] * point[1];
  }
  return area / 2;
}

function triangleCrossesBoundary(triangle: [Point, Point, Point], data: PolygonGeometry): boolean {
  const rings = [data.outer, ...(data.holes ?? [])];
  return triangle.some((start, index) => {
    const end = triangle[(index + 1) % triangle.length]!;
    return rings.some(ring =>
      ring.some((boundaryStart, boundaryIndex) => {
        const boundaryEnd = ring[(boundaryIndex + 1) % ring.length]!;
        return properIntersection(start, end, boundaryStart, boundaryEnd);
      })
    );
  });
}

// eslint-disable-next-line max-params -- Segment intersection requires four endpoints.
function properIntersection(first: Point, second: Point, third: Point, fourth: Point): boolean {
  if ([first, second].some(point => [third, fourth].some(candidate => pointsNear(point, candidate)))) return false;
  if (
    pointNearSegment(first, third, fourth) ||
    pointNearSegment(second, third, fourth) ||
    pointNearSegment(third, first, second) ||
    pointNearSegment(fourth, first, second)
  )
    return false;
  const firstSide = cross(first, second, third);
  const secondSide = cross(first, second, fourth);
  const thirdSide = cross(third, fourth, first);
  const fourthSide = cross(third, fourth, second);
  return firstSide * secondSide < 0 && thirdSide * fourthSide < 0;
}

function pointsNear(left: Point, right: Point): boolean {
  return Math.abs(left[0] - right[0]) < 0.00001 && Math.abs(left[1] - right[1]) < 0.00001;
}

function pointNearSegment(point: Point, start: Point, end: Point): boolean {
  const length = Math.hypot(end[0] - start[0], end[1] - start[1]);
  if (length === 0 || Math.abs(cross(start, end, point)) / length >= 0.00001) return false;
  return (
    point[0] >= Math.min(start[0], end[0]) - 0.00001 &&
    point[0] <= Math.max(start[0], end[0]) + 0.00001 &&
    point[1] >= Math.min(start[1], end[1]) - 0.00001 &&
    point[1] <= Math.max(start[1], end[1]) + 0.00001
  );
}
