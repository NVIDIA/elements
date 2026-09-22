// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { PolygonRing } from './types.js';
import {
  classifyPointInRing,
  type Point2 as Point,
  samePoint,
  ringsIntersect,
  ringSelfIntersects,
  signedDoubleArea
} from '../../math/geometry-2d.js';
import { removeCollinearVertices } from '../../math/ring-simplification.js';
import { triangulatePolygon } from '../../math/polygon-triangulation.js';

export const POLYGON_VERTEX_LIMIT = 4096;

type Ring = Point[];

export interface CompiledPolygon {
  readonly holes: readonly PolygonRing[];
  readonly indices: Uint32Array;
  readonly normals: Float32Array;
  readonly outer: PolygonRing;
  readonly positions: Float32Array;
}

/** Snapshot, validate, bridge, and triangulate one polygon geometry value. */
export function compilePolygon(value: unknown): CompiledPolygon {
  const snapshot = snapshotPolygon(value);
  validatePolygon(snapshot);
  const outer = orient(snapshot.outer, 'counterclockwise');
  const holes = snapshot.holes.map(hole => orient(hole, 'clockwise'));
  const { boundary, triangles } = triangulatePolygon(outer, holes);
  const positions = new Float32Array(boundary.length * 3);
  const normals = new Float32Array(boundary.length * 3);
  boundary.forEach((point, index) => {
    positions[index * 3] = point[0];
    positions[index * 3 + 1] = point[1];
    normals[index * 3 + 2] = 1;
  });
  return { holes, indices: new Uint32Array(triangles.flat()), normals, outer, positions };
}

function snapshotPolygon(value: unknown): { outer: Ring; holes: Ring[] } {
  if (value === null || typeof value !== 'object') throw new RangeError('Polygon geometry must be an object.');
  const outer = normalizeRing(Reflect.get(value, 'outer'));
  const holesValue: unknown = Reflect.get(value, 'holes');
  if (holesValue !== undefined && !Array.isArray(holesValue)) throw new RangeError('Polygon holes must be an array.');
  const holes: Ring[] = holesValue === undefined ? [] : holesValue.map((hole: unknown) => normalizeRing(hole));
  const vertexCount = outer.length + holes.reduce((count, hole) => count + hole.length, 0);
  if (vertexCount > POLYGON_VERTEX_LIMIT) throw new RangeError('Polygon exceeds the normalized vertex limit.');
  return { holes, outer };
}

function normalizeRing(value: unknown): Ring {
  if (!Array.isArray(value)) throw new RangeError('Polygon rings must be arrays.');
  const points: Ring = [];
  for (const valuePoint of value) {
    assertPolygonPoint(valuePoint);
    const point: Point = [valuePoint[0], valuePoint[1]];
    if (!samePoint(points.at(-1), point)) points.push(point);
  }
  if (samePoint(points[0], points.at(-1))) points.pop();
  const simplified = removeCollinearVertices(points);
  if (simplified.length < 3) throw new RangeError('Polygon rings must contain at least three distinct vertices.');
  if (signedDoubleArea(simplified) === 0) throw new RangeError('Polygon rings must have nonzero area.');
  return simplified;
}

function assertPolygonPoint(value: unknown): asserts value is Point {
  if (!Array.isArray(value) || value.length !== 2) throw new RangeError('Polygon points must be finite xy pairs.');
  if (typeof value[0] !== 'number' || typeof value[1] !== 'number') {
    throw new RangeError('Polygon points must be finite xy pairs.');
  }
  if (!Number.isFinite(value[0]) || !Number.isFinite(value[1])) {
    throw new RangeError('Polygon points must be finite xy pairs.');
  }
}

function validatePolygon(data: { outer: Ring; holes: Ring[] }): void {
  assertSimpleRing(data.outer);
  data.holes.forEach(assertSimpleRing);
  for (const hole of data.holes) {
    if (classifyPointInRing(hole[0]!, data.outer) !== 'inside' || ringsIntersect(hole, data.outer)) {
      throw new RangeError('Polygon holes must be strictly inside the outer ring.');
    }
  }
  for (let left = 0; left < data.holes.length; left += 1) {
    for (let right = left + 1; right < data.holes.length; right += 1) {
      const first = data.holes[left]!;
      const second = data.holes[right]!;
      if (
        ringsIntersect(first, second) ||
        classifyPointInRing(first[0]!, second) !== 'outside' ||
        classifyPointInRing(second[0]!, first) !== 'outside'
      ) {
        throw new RangeError('Polygon holes must be disjoint and unnested.');
      }
    }
  }
}

function assertSimpleRing(ring: Ring): void {
  if (ringSelfIntersects(ring)) throw new RangeError('Polygon rings must be simple.');
}

function orient(ring: Ring, winding: 'clockwise' | 'counterclockwise'): Ring {
  const counterclockwise = signedDoubleArea(ring) > 0;
  const expected = winding === 'counterclockwise';
  return (counterclockwise === expected ? ring : [...ring].reverse()).map(point => [...point]);
}
