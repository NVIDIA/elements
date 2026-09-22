// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import type { Point2 } from './geometry-2d.js';
import { triangulatePolygon } from './polygon-triangulation.js';

describe('polygon hole bridging and ear clipping', () => {
  it('keeps deterministic triangle order for a convex boundary', () => {
    const outer: Point2[] = [
      [0, 0],
      [4, 0],
      [4, 3],
      [0, 3]
    ];
    const result = triangulatePolygon(outer);

    expect(result.boundary).toEqual(outer);
    expect(result.triangles).toEqual([
      [3, 0, 1],
      [1, 2, 3]
    ]);
    expect(result.boundary).not.toBe(outer);
    expect(result.boundary[0]).not.toBe(outer[0]);
  });

  it.each([
    {
      outer: [
        [0, 0],
        [4, 0],
        [4, 4],
        [2, 2],
        [0, 4]
      ],
      holes: [],
      area: 12
    },
    {
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
      ],
      area: 32
    },
    {
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
      ],
      area: 67
    }
  ] satisfies Array<{ outer: Point2[]; holes: Point2[][]; area: number }>)(
    'triangulates concave and holed fills %#',
    ({ outer, holes, area }) => {
      const source = structuredClone({ outer, holes });
      const result = triangulatePolygon(outer, holes);
      let actualArea = 0;
      for (const [first, second, third] of result.triangles) {
        expect([first, second, third].every(index => index >= 0 && index < result.boundary.length)).toBe(true);
        const a = result.boundary[first]!;
        const b = result.boundary[second]!;
        const c = result.boundary[third]!;
        const twiceArea = a[0] * (b[1] - c[1]) + b[0] * (c[1] - a[1]) + c[0] * (a[1] - b[1]);
        expect(twiceArea).toBeGreaterThan(0);
        actualArea += twiceArea / 2;
      }

      expect(actualArea).toBe(area);
      expect({ outer, holes }).toEqual(source);
      expect(triangulatePolygon(outer, holes)).toEqual(result);
      if (holes.length > 0) expect(result.boundary.length).toBeGreaterThan(outer.length);
    }
  );

  it('does not mutate frozen outer or hole coordinates while inserting a bridge', () => {
    const outer = Object.freeze([
      Object.freeze([0, 0] as const),
      Object.freeze([6, 0] as const),
      Object.freeze([6, 6] as const),
      Object.freeze([0, 6] as const)
    ]);
    const hole = Object.freeze([
      Object.freeze([2, 2] as const),
      Object.freeze([2, 4] as const),
      Object.freeze([4, 4] as const),
      Object.freeze([4, 2] as const)
    ]);
    const result = triangulatePolygon(outer, Object.freeze([hole]));

    expect(outer).toHaveLength(4);
    expect(hole).toHaveLength(4);
    expect(result.boundary).toContainEqual([6, 2]);
    expect(result.boundary).toHaveLength(11);
  });

  it('reports stalled or degenerate triangulation when callers violate the ring preconditions', () => {
    expect(() => triangulatePolygon([])).toThrow('stalled');
    expect(() =>
      triangulatePolygon([
        [0, 0],
        [1, 0],
        [2, 0]
      ])
    ).toThrow('degenerate final triangle');
    expect(() =>
      triangulatePolygon([
        [0, 0],
        [0, 1],
        [1, 0]
      ])
    ).toThrow('degenerate final triangle');
  });
});
