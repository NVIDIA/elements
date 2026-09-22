// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import type { Point2 } from './geometry-2d.js';
import { removeCollinearVertices } from './ring-simplification.js';

describe('collinear ring simplification', () => {
  it.each([
    { ring: [] },
    { ring: [[0, 0]] },
    {
      ring: [
        [0, 0],
        [1, 0]
      ]
    }
  ] satisfies Array<{ ring: Point2[] }>)('copies short rings without mutating them %#', ({ ring }) => {
    const result = removeCollinearVertices(ring);
    expect(result).toEqual(ring);
    expect(result).not.toBe(ring);
  });

  it.each([64, 4_096])('reduces %s collinear boundary vertices to the original corners', count => {
    const ring = squareBoundary(count);
    const size = count / 4;
    const result = removeCollinearVertices(ring);

    expect(result).toEqual([
      [0, 0],
      [size, 0],
      [size, size],
      [0, size]
    ]);
    expect(ring).toHaveLength(count);
    expect(result[0]).toBe(ring[0]);
  });

  it('removes a redundant first vertex across the cyclic seam', () => {
    const ring: Point2[] = [
      [1, 0],
      [2, 0],
      [2, 2],
      [0, 2],
      [0, 0]
    ];
    expect(removeCollinearVertices(ring)).toEqual([
      [2, 0],
      [2, 2],
      [0, 2],
      [0, 0]
    ]);
  });

  it('preserves winding and survivor order through rotated dense boundaries', () => {
    const ring = squareBoundary(64);
    const corners = ring.filter(([x, y]) => (x === 0 || x === 16) && (y === 0 || y === 16));
    for (const rotation of [0, 1, 63]) {
      const rotated = [...ring.slice(rotation), ...ring.slice(0, rotation)];
      const expected = rotated.filter(point => corners.includes(point));
      expect(removeCollinearVertices(rotated)).toEqual(expected);
      expect(removeCollinearVertices(rotated.slice().reverse())).toEqual(expected.slice().reverse());
    }
  });

  it('preserves reversals and small nonzero turns', () => {
    const reversal: Point2[] = [
      [0, 0],
      [3, 0],
      [1, 0],
      [1, 2],
      [-1, 2]
    ];
    const smallTurn: Point2[] = [
      [0, 0],
      [1, 1e-15],
      [2, 0],
      [2, 2],
      [0, 2]
    ];
    expect(removeCollinearVertices(reversal)).toEqual(reversal);
    expect(removeCollinearVertices(smallTurn)).toEqual(smallTurn);
  });

  it('handles a degenerate collinear ring without an endless queue', () => {
    const result = removeCollinearVertices([
      [0, 0],
      [1, 0],
      [2, 0],
      [3, 0]
    ]);
    expect(result).toHaveLength(2);
  });

  it('accepts frozen inputs and shares surviving point objects without changing them', () => {
    const ring = Object.freeze([
      Object.freeze([0, 0] as const),
      Object.freeze([1, 0] as const),
      Object.freeze([2, 0] as const),
      Object.freeze([0, 2] as const)
    ]);
    const result = removeCollinearVertices(ring);
    expect(result).toEqual([
      [0, 0],
      [2, 0],
      [0, 2]
    ]);
    expect(result[0]).toBe(ring[0]);
    expect(ring).toHaveLength(4);
  });
});

function squareBoundary(count: number): Point2[] {
  const size = count / 4;
  return Array.from({ length: count }, (_, index) => {
    const offset = index % size;
    switch (Math.floor(index / size)) {
      case 0:
        return [offset, 0];
      case 1:
        return [size, offset];
      case 2:
        return [size - offset, size];
      default:
        return [0, size - offset];
    }
  });
}
