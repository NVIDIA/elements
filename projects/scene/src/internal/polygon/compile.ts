// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { PolygonRing } from './types.js';

export const POLYGON_VERTEX_LIMIT = 4096;

type Point = [number, number];
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
  const boundary = bridgeHoles(outer, holes);
  const triangles = clipEars(boundary, outer, holes);
  verifyTriangulation(boundary, triangles, outer, holes);
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

// eslint-disable-next-line complexity -- Runtime tuple validation intentionally keeps malformed data out of geometry code.
function normalizeRing(value: unknown): Ring {
  if (!Array.isArray(value)) throw new RangeError('Polygon rings must be arrays.');
  const points: Ring = [];
  for (const valuePoint of value) {
    if (
      !Array.isArray(valuePoint) ||
      valuePoint.length !== 2 ||
      typeof valuePoint[0] !== 'number' ||
      typeof valuePoint[1] !== 'number' ||
      !Number.isFinite(valuePoint[0]) ||
      !Number.isFinite(valuePoint[1])
    ) {
      throw new RangeError('Polygon points must be finite xy pairs.');
    }
    const point: Point = [valuePoint[0], valuePoint[1]];
    if (!samePoint(points.at(-1), point)) points.push(point);
  }
  if (samePoint(points[0], points.at(-1))) points.pop();
  removeRedundantCollinearPoints(points);
  if (points.length < 3) throw new RangeError('Polygon rings must contain at least three distinct vertices.');
  if (signedDoubleArea(points) === 0) throw new RangeError('Polygon rings must have nonzero area.');
  return points;
}

function removeRedundantCollinearPoints(points: Ring): void {
  let changed = true;
  while (changed && points.length >= 3) {
    changed = false;
    for (let index = 0; index < points.length; index += 1) {
      const previous = points[(index - 1 + points.length) % points.length]!;
      const point = points[index]!;
      const next = points[(index + 1) % points.length]!;
      if (cross(previous, point, next) === 0 && dotFrom(point, previous, next) >= 0) {
        points.splice(index, 1);
        changed = true;
        break;
      }
    }
  }
}

function validatePolygon(data: { outer: Ring; holes: Ring[] }): void {
  assertSimpleRing(data.outer);
  data.holes.forEach(assertSimpleRing);
  for (const hole of data.holes) {
    if (classifyPoint(hole[0]!, data.outer) !== 'inside' || ringsIntersect(hole, data.outer)) {
      throw new RangeError('Polygon holes must be strictly inside the outer ring.');
    }
  }
  for (let left = 0; left < data.holes.length; left += 1) {
    for (let right = left + 1; right < data.holes.length; right += 1) {
      const first = data.holes[left]!;
      const second = data.holes[right]!;
      if (
        ringsIntersect(first, second) ||
        classifyPoint(first[0]!, second) !== 'outside' ||
        classifyPoint(second[0]!, first) !== 'outside'
      ) {
        throw new RangeError('Polygon holes must be disjoint and unnested.');
      }
    }
  }
}

function assertSimpleRing(ring: Ring): void {
  for (let first = 0; first < ring.length; first += 1) {
    const firstNext = (first + 1) % ring.length;
    for (let second = first + 1; second < ring.length; second += 1) {
      const secondNext = (second + 1) % ring.length;
      if (first === second || firstNext === second || secondNext === first) continue;
      if (segmentsIntersect(ring[first]!, ring[firstNext]!, ring[second]!, ring[secondNext]!)) {
        throw new RangeError('Polygon rings must be simple.');
      }
    }
  }
}

function ringsIntersect(left: Ring, right: Ring): boolean {
  for (let leftIndex = 0; leftIndex < left.length; leftIndex += 1) {
    for (let rightIndex = 0; rightIndex < right.length; rightIndex += 1) {
      if (
        segmentsIntersect(
          left[leftIndex]!,
          left[(leftIndex + 1) % left.length]!,
          right[rightIndex]!,
          right[(rightIndex + 1) % right.length]!
        )
      ) {
        return true;
      }
    }
  }
  return false;
}

function orient(ring: Ring, winding: 'clockwise' | 'counterclockwise'): Ring {
  const counterclockwise = signedDoubleArea(ring) > 0;
  const expected = winding === 'counterclockwise';
  return (counterclockwise === expected ? ring : [...ring].reverse()).map(point => [...point]);
}

function bridgeHoles(outer: Ring, holes: Ring[]): Ring {
  let boundary = outer.map(point => [...point] as Point);
  const sorted = holes
    .map((hole, sourceIndex) => ({ hole, sourceIndex, vertexIndex: rightmostVertex(hole) }))
    .sort((left, right) => {
      const leftPoint = left.hole[left.vertexIndex]!;
      const rightPoint = right.hole[right.vertexIndex]!;
      return rightPoint[0] - leftPoint[0] || leftPoint[1] - rightPoint[1] || left.sourceIndex - right.sourceIndex;
    });
  for (const entry of sorted) boundary = bridgeHole(boundary, entry.hole, entry.vertexIndex);
  return boundary;
}

function rightmostVertex(ring: Ring): number {
  let selected = 0;
  for (let index = 1; index < ring.length; index += 1) {
    const point = ring[index]!;
    const current = ring[selected]!;
    if (point[0] > current[0] || (point[0] === current[0] && point[1] < current[1])) selected = index;
  }
  return selected;
}

function bridgeHole(boundary: Ring, hole: Ring, holeIndex: number): Ring {
  const holePoint = hole[holeIndex]!;
  const hit = findRayHit(boundary, holePoint);
  if (!hit) throw new RangeError('Polygon hole could not be bridged.');
  const nextBoundary = boundary.map(point => [...point] as Point);
  let boundaryIndex: number;
  const edgeStart = nextBoundary[hit.edge]!;
  const edgeEnd = nextBoundary[(hit.edge + 1) % nextBoundary.length]!;
  if (samePoint(hit.point, edgeStart)) boundaryIndex = hit.edge;
  else if (samePoint(hit.point, edgeEnd)) boundaryIndex = (hit.edge + 1) % nextBoundary.length;
  else {
    boundaryIndex = hit.edge + 1;
    nextBoundary.splice(boundaryIndex, 0, hit.point);
  }
  const target = nextBoundary[boundaryIndex]!;
  const holeLoop = Array.from(
    { length: hole.length },
    (_, offset) => [...hole[(holeIndex + offset) % hole.length]!] as Point
  );
  return [
    ...nextBoundary.slice(0, boundaryIndex + 1),
    ...holeLoop,
    [...holePoint],
    [...target],
    ...nextBoundary.slice(boundaryIndex + 1)
  ];
}

function findRayHit(boundary: Ring, origin: Point): { edge: number; point: Point } | undefined {
  let nearest: { edge: number; point: Point } | undefined;
  for (let edge = 0; edge < boundary.length; edge += 1) {
    const start = boundary[edge]!;
    const end = boundary[(edge + 1) % boundary.length]!;
    if (start[1] > origin[1] === end[1] > origin[1]) continue;
    const x = start[0] + ((origin[1] - start[1]) * (end[0] - start[0])) / (end[1] - start[1]);
    if (x <= origin[0]) continue;
    if (!nearest || x < nearest.point[0] || (x === nearest.point[0] && edge < nearest.edge)) {
      nearest = { edge, point: [x, origin[1]] };
    }
  }
  return nearest;
}

// eslint-disable-next-line complexity, max-lines-per-function, max-statements -- Ear clipping is one bounded state machine.
function clipEars(boundary: Ring, outer: Ring, holes: Ring[]): Array<[number, number, number]> {
  const remaining = boundary.map((_, index) => index);
  const triangles: Array<[number, number, number]> = [];
  let cursor = 0;
  let stalled = 0;
  const safetyLimit = boundary.length * boundary.length * 2;
  while (remaining.length > 3 && stalled <= safetyLimit) {
    const currentIndex = cursor % remaining.length;
    const previousIndex = (currentIndex - 1 + remaining.length) % remaining.length;
    const nextIndex = (currentIndex + 1) % remaining.length;
    const previous = remaining[previousIndex]!;
    const current = remaining[currentIndex]!;
    const next = remaining[nextIndex]!;
    const a = boundary[previous]!;
    const b = boundary[current]!;
    const c = boundary[next]!;
    if (isRemovableDegenerate(a, b, c)) {
      remaining.splice(currentIndex, 1);
      cursor = previousIndex;
      stalled = 0;
      continue;
    }
    if (
      cross(a, b, c) > 0 &&
      diagonalIsValid(previous, next, remaining, boundary, outer, holes) &&
      !remaining.some(
        index => index !== previous && index !== current && index !== next && pointInTriangle(boundary[index]!, a, b, c)
      )
    ) {
      triangles.push([previous, current, next]);
      remaining.splice(currentIndex, 1);
      cursor = previousIndex;
      stalled = 0;
      continue;
    }
    cursor = nextIndex;
    stalled += 1;
  }
  if (remaining.length !== 3) throw new RangeError('Polygon triangulation stalled.');
  const [first, second, third] = remaining;
  if (
    first === undefined ||
    second === undefined ||
    third === undefined ||
    cross(boundary[first]!, boundary[second]!, boundary[third]!) <= 0
  ) {
    throw new RangeError('Polygon triangulation produced a degenerate final triangle.');
  }
  triangles.push([first, second, third]);
  return triangles;
}

function isRemovableDegenerate(previous: Point, point: Point, next: Point): boolean {
  return (
    samePoint(previous, point) ||
    samePoint(point, next) ||
    (cross(previous, point, next) === 0 && dotFrom(point, previous, next) >= 0)
  );
}

// eslint-disable-next-line max-params -- The diagonal check keeps geometry inputs explicit.
function diagonalIsValid(
  startIndex: number,
  endIndex: number,
  remaining: number[],
  boundary: Ring,
  outer: Ring,
  holes: Ring[]
): boolean {
  const start = boundary[startIndex]!;
  const end = boundary[endIndex]!;
  if (samePoint(start, end) || !pointInFill(midpoint(start, end), outer, holes)) return false;
  for (let edge = 0; edge < remaining.length; edge += 1) {
    const firstIndex = remaining[edge]!;
    const secondIndex = remaining[(edge + 1) % remaining.length]!;
    if (
      firstIndex === startIndex ||
      secondIndex === startIndex ||
      firstIndex === endIndex ||
      secondIndex === endIndex
    ) {
      continue;
    }
    if (segmentsConflict(start, end, boundary[firstIndex]!, boundary[secondIndex]!)) return false;
  }
  return true;
}

// eslint-disable-next-line max-params -- Verification compares compiled and source geometry explicitly.
function verifyTriangulation(
  boundary: Ring,
  triangles: Array<[number, number, number]>,
  outer: Ring,
  holes: Ring[]
): void {
  const expectedArea =
    Math.abs(signedDoubleArea(outer)) / 2 -
    holes.reduce((area, hole) => area + Math.abs(signedDoubleArea(hole)) / 2, 0);
  let triangleArea = 0;
  for (const [first, second, third] of triangles) {
    const a = boundary[first]!;
    const b = boundary[second]!;
    const c = boundary[third]!;
    const area = cross(a, b, c) / 2;
    if (!(area > 0) || !pointInFill(centroid(a, b, c), outer, holes)) {
      throw new RangeError('Polygon triangulation produced an invalid triangle.');
    }
    triangleArea += area;
  }
  const tolerance = Math.max(1, expectedArea) * 1e-9;
  if (Math.abs(triangleArea - expectedArea) > tolerance) {
    throw new RangeError('Polygon triangulation area does not match the polygon fill.');
  }
}

function pointInFill(point: Point, outer: Ring, holes: Ring[]): boolean {
  return classifyPoint(point, outer) === 'inside' && holes.every(hole => classifyPoint(point, hole) === 'outside');
}

function classifyPoint(point: Point, ring: Ring): 'boundary' | 'inside' | 'outside' {
  let inside = false;
  for (let index = 0; index < ring.length; index += 1) {
    const start = ring[index]!;
    const end = ring[(index + 1) % ring.length]!;
    if (pointOnSegment(point, start, end)) return 'boundary';
    if (start[1] > point[1] !== end[1] > point[1]) {
      const x = start[0] + ((point[1] - start[1]) * (end[0] - start[0])) / (end[1] - start[1]);
      if (x > point[0]) inside = !inside;
    }
  }
  return inside ? 'inside' : 'outside';
}

// eslint-disable-next-line complexity, max-params -- Segment predicates require four endpoints.
function segmentsIntersect(first: Point, second: Point, third: Point, fourth: Point): boolean {
  const abC = cross(first, second, third);
  const abD = cross(first, second, fourth);
  const cdA = cross(third, fourth, first);
  const cdB = cross(third, fourth, second);
  if (((abC > 0 && abD < 0) || (abC < 0 && abD > 0)) && ((cdA > 0 && cdB < 0) || (cdA < 0 && cdB > 0))) {
    return true;
  }
  return (
    (abC === 0 && pointOnSegment(third, first, second)) ||
    (abD === 0 && pointOnSegment(fourth, first, second)) ||
    (cdA === 0 && pointOnSegment(first, third, fourth)) ||
    (cdB === 0 && pointOnSegment(second, third, fourth))
  );
}

// eslint-disable-next-line complexity, max-params -- Segment predicates require four endpoints.
function segmentsConflict(first: Point, second: Point, third: Point, fourth: Point): boolean {
  if (!segmentsIntersect(first, second, third, fourth)) return false;
  if (samePoint(first, third) || samePoint(first, fourth) || samePoint(second, third) || samePoint(second, fourth)) {
    const collinear = cross(first, second, third) === 0 && cross(first, second, fourth) === 0;
    if (!collinear) return false;
    return (
      pointStrictlyOnSegment(third, first, second) ||
      pointStrictlyOnSegment(fourth, first, second) ||
      pointStrictlyOnSegment(first, third, fourth) ||
      pointStrictlyOnSegment(second, third, fourth)
    );
  }
  return true;
}

// eslint-disable-next-line max-params -- Triangle containment requires one point and three vertices.
function pointInTriangle(point: Point, first: Point, second: Point, third: Point): boolean {
  return cross(first, second, point) > 0 && cross(second, third, point) > 0 && cross(third, first, point) > 0;
}

function pointOnSegment(point: Point, start: Point, end: Point): boolean {
  return (
    cross(start, end, point) === 0 &&
    point[0] >= Math.min(start[0], end[0]) &&
    point[0] <= Math.max(start[0], end[0]) &&
    point[1] >= Math.min(start[1], end[1]) &&
    point[1] <= Math.max(start[1], end[1])
  );
}

function pointStrictlyOnSegment(point: Point, start: Point, end: Point): boolean {
  return pointOnSegment(point, start, end) && !samePoint(point, start) && !samePoint(point, end);
}

function signedDoubleArea(ring: Ring): number {
  let area = 0;
  for (let index = 0; index < ring.length; index += 1) {
    const point = ring[index]!;
    const next = ring[(index + 1) % ring.length]!;
    area += point[0] * next[1] - next[0] * point[1];
  }
  return area;
}

function cross(first: Point, second: Point, third: Point): number {
  return (second[0] - first[0]) * (third[1] - first[1]) - (second[1] - first[1]) * (third[0] - first[0]);
}

function dotFrom(origin: Point, first: Point, second: Point): number {
  return (origin[0] - first[0]) * (second[0] - origin[0]) + (origin[1] - first[1]) * (second[1] - origin[1]);
}

function samePoint(left: Point | undefined, right: Point | undefined): boolean {
  return left !== undefined && right !== undefined && left[0] === right[0] && left[1] === right[1];
}

function midpoint(first: Point, second: Point): Point {
  return [(first[0] + second[0]) / 2, (first[1] + second[1]) / 2];
}

function centroid(first: Point, second: Point, third: Point): Point {
  return [(first[0] + second[0] + third[0]) / 3, (first[1] + second[1] + third[1]) / 3];
}
