// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { ArrayBackedLinkedList } from '../structures/array-backed-linked-list.js';
import { RectangleIndex } from '../structures/rectangle-index.js';
import {
  pointInPolygon as pointInFill,
  isCollinearBetween,
  orient2D,
  pointInCounterclockwiseTriangle,
  type Point2 as Point,
  samePoint,
  segmentsConflict,
  signedDoubleArea
} from './geometry-2d.js';
import { PolygonFillQuery, RING_INDEX_THRESHOLD, segmentBounds } from './ring-query.js';

type Ring = readonly Point[];

interface TriangulatedPolygon {
  readonly boundary: Ring;
  readonly triangles: Array<[number, number, number]>;
}

/**
 * Bridges holes and clips ears in a normalized, validated polygon without GPU allocations.
 * Callers supply a simple counterclockwise outer ring and disjoint, unnested clockwise holes
 * strictly inside it. Keeps input coordinates unchanged and returns an independent bridged boundary.
 * Triangle indices refer to that boundary, which can include additional bridge vertices.
 * Verifies positive triangle areas, fill membership, and total fill area before returning.
 */
export function triangulatePolygon(outer: Ring, holes: readonly Ring[] = []): TriangulatedPolygon {
  const boundary = bridgeHoles(outer, holes);
  const fill =
    outer.length >= RING_INDEX_THRESHOLD || holes.some(hole => hole.length >= RING_INDEX_THRESHOLD)
      ? new PolygonFillQuery(outer, holes)
      : undefined;
  const triangles = clipEars(boundary, outer, holes, fill);
  verifyTriangulation({ boundary, fill, holes, outer, triangles });
  return { boundary, triangles };
}

function bridgeHoles(outer: Ring, holes: readonly Ring[]): Ring {
  let boundary: Ring = outer.map(point => [...point] as Point);
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

// eslint-disable-next-line complexity, max-statements, max-params -- @hotpath Ear clipping keeps stable indices and allocates no candidate wrappers.
function clipEars(
  boundary: Ring,
  outer: Ring,
  holes: readonly Ring[],
  fill: PolygonFillQuery | undefined
): Array<[number, number, number]> {
  const remaining = new ArrayBackedLinkedList(boundary.length);
  const points = createBoundaryIndex(boundary, 'points');
  const edges = createBoundaryIndex(boundary, 'edges');
  const triangles: Array<[number, number, number]> = [];
  let current = remaining.first;
  let stalled = 0;
  const safetyLimit = boundary.length * boundary.length * 2;
  while (remaining.size > 3 && stalled <= safetyLimit) {
    const previous = remaining.previous(current);
    const next = remaining.next(current);
    const a = boundary[previous]!;
    const b = boundary[current]!;
    const c = boundary[next]!;
    const degenerate = isRemovableDegenerate(a, b, c);
    const ear =
      !degenerate &&
      orient2D(a, b, c) > 0 &&
      diagonalIsValid(previous, next, remaining, boundary, outer, holes, fill, edges) &&
      !triangleContainsActiveVertex(remaining, boundary, previous, current, next, points);
    if (degenerate || ear) {
      if (ear) triangles.push([previous, current, next]);
      const wasFirst = current === remaining.first;
      remaining.remove(current);
      points?.remove(current);
      edges?.remove(current);
      edges?.set(previous, ...segmentBounds(a, c));
      // Removing the first active vertex continues at the new first vertex.
      current = wasFirst ? remaining.first : previous;
      stalled = 0;
      continue;
    }
    current = next;
    stalled += 1;
  }
  if (remaining.size !== 3) throw new RangeError('Polygon triangulation stalled.');
  const first = remaining.first;
  const second = remaining.next(first);
  const third = remaining.next(second);
  if (first < 0 || second < 0 || third < 0 || orient2D(boundary[first]!, boundary[second]!, boundary[third]!) <= 0) {
    throw new RangeError('Polygon triangulation produced a degenerate final triangle.');
  }
  triangles.push([first, second, third]);
  return triangles;
}

function createBoundaryIndex(boundary: Ring, kind: 'points' | 'edges'): RectangleIndex | undefined {
  if (boundary.length < RING_INDEX_THRESHOLD) return undefined;
  return new RectangleIndex(
    boundary.map((start, index) =>
      segmentBounds(start, kind === 'points' ? start : boundary[(index + 1) % boundary.length]!)
    )
  );
}

// eslint-disable-next-line max-params -- @hotpath Stable scalar indices avoid allocating one triangle wrapper per candidate.
function triangleContainsActiveVertex(
  remaining: ArrayBackedLinkedList,
  boundary: Ring,
  first: number,
  second: number,
  third: number,
  points: RectangleIndex | undefined
): boolean {
  const a = boundary[first]!;
  const b = boundary[second]!;
  const c = boundary[third]!;
  if (points)
    return points.some(
      Math.min(a[0], b[0], c[0]),
      Math.min(a[1], b[1], c[1]),
      Math.max(a[0], b[0], c[0]),
      Math.max(a[1], b[1], c[1]),
      index =>
        index !== first &&
        index !== second &&
        index !== third &&
        pointInCounterclockwiseTriangle(boundary[index]!, a, b, c)
    );
  for (
    let index = remaining.first, visited = 0;
    visited < remaining.size;
    index = remaining.next(index), visited += 1
  ) {
    if (
      index !== first &&
      index !== second &&
      index !== third &&
      pointInCounterclockwiseTriangle(boundary[index]!, a, b, c)
    )
      return true;
  }
  return false;
}

function isRemovableDegenerate(previous: Point, point: Point, next: Point): boolean {
  return samePoint(previous, point) || samePoint(point, next) || isCollinearBetween(previous, point, next);
}

// eslint-disable-next-line complexity, max-params -- @hotpath Direct small-ring checks avoid allocating an index or an options object per diagonal candidate.
function diagonalIsValid(
  startIndex: number,
  endIndex: number,
  remaining: ArrayBackedLinkedList,
  boundary: Ring,
  outer: Ring,
  holes: readonly Ring[],
  fill: PolygonFillQuery | undefined,
  edges: RectangleIndex | undefined
): boolean {
  const start = boundary[startIndex]!;
  const end = boundary[endIndex]!;
  if (
    samePoint(start, end) ||
    !(fill ? fill.contains(midpoint(start, end)) : pointInFill(midpoint(start, end), outer, holes))
  )
    return false;
  if (edges)
    return !edges.some(...segmentBounds(start, end), firstIndex => {
      const secondIndex = remaining.next(firstIndex);
      return (
        firstIndex !== startIndex &&
        secondIndex !== startIndex &&
        firstIndex !== endIndex &&
        secondIndex !== endIndex &&
        segmentsConflict(start, end, boundary[firstIndex]!, boundary[secondIndex]!)
      );
    });
  for (
    let firstIndex = remaining.first, visited = 0;
    visited < remaining.size;
    firstIndex = remaining.next(firstIndex), visited += 1
  ) {
    const secondIndex = remaining.next(firstIndex);
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

function verifyTriangulation(options: {
  readonly boundary: Ring;
  readonly fill: PolygonFillQuery | undefined;
  readonly holes: readonly Ring[];
  readonly outer: Ring;
  readonly triangles: Array<[number, number, number]>;
}): void {
  const { boundary, fill, holes, outer, triangles } = options;
  const expectedArea =
    Math.abs(signedDoubleArea(outer)) / 2 -
    holes.reduce((area, hole) => area + Math.abs(signedDoubleArea(hole)) / 2, 0);
  let triangleArea = 0;
  for (const [first, second, third] of triangles) {
    const a = boundary[first]!;
    const b = boundary[second]!;
    const c = boundary[third]!;
    const area = orient2D(a, b, c) / 2;
    if (!(area > 0) || !(fill ? fill.contains(centroid(a, b, c)) : pointInFill(centroid(a, b, c), outer, holes))) {
      throw new RangeError('Polygon triangulation produced an invalid triangle.');
    }
    triangleArea += area;
  }
  const tolerance = Math.max(1, expectedArea) * 1e-9;
  if (Math.abs(triangleArea - expectedArea) > tolerance) {
    throw new RangeError('Polygon triangulation area does not match the polygon fill.');
  }
}

function midpoint(first: Point, second: Point): Point {
  return [(first[0] + second[0]) / 2, (first[1] + second[1]) / 2];
}

function centroid(first: Point, second: Point, third: Point): Point {
  return [(first[0] + second[0] + third[0]) / 3, (first[1] + second[1] + third[1]) / 3];
}
