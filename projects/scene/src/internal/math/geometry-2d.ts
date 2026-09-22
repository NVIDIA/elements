// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/** An xy pair. Callers validate finite coordinates before using the geometric predicates. */
export type Point2 = readonly [number, number];

// These predicates use JavaScript arithmetic and exact zero comparisons.
// They do not apply a tolerance or use adaptive-precision arithmetic.

/** Returns the signed orientation determinant: positive for a counterclockwise turn. */
function orient2D(first: Point2, second: Point2, third: Point2): number {
  return (second[0] - first[0]) * (third[1] - first[1]) - (second[1] - first[1]) * (third[0] - first[0]);
}

/** Returns twice the signed area of an open ring, positive for counterclockwise winding. */
function signedDoubleArea(ring: readonly Point2[]): number {
  let area = 0;
  for (let index = 0; index < ring.length; index += 1) {
    const point = ring[index]!;
    const next = ring[index + 1 === ring.length ? 0 : index + 1]!;
    area += point[0] * next[1] - next[0] * point[1];
  }
  return area;
}

/** Compares coordinates exactly; missing points never compare equal. */
function samePoint(left: Point2 | undefined, right: Point2 | undefined): boolean {
  return left !== undefined && right !== undefined && left[0] === right[0] && left[1] === right[1];
}

/** Tests collinearity and forward motion through point, including coincident coordinates. */
function isCollinearBetween(previous: Point2, point: Point2, next: Point2): boolean {
  if (orient2D(previous, point, next) !== 0) return false;
  const dot = (point[0] - previous[0]) * (next[0] - point[0]) + (point[1] - previous[1]) * (next[1] - point[1]);
  return dot >= 0;
}

/** Tests membership in a closed segment, including either endpoint and zero-length segments. */
function pointOnSegment(point: Point2, start: Point2, end: Point2): boolean {
  return (
    orient2D(start, end, point) === 0 &&
    point[0] >= Math.min(start[0], end[0]) &&
    point[0] <= Math.max(start[0], end[0]) &&
    point[1] >= Math.min(start[1], end[1]) &&
    point[1] <= Math.max(start[1], end[1])
  );
}

/** Tests membership in a segment interior, excluding either endpoint. */
function pointStrictlyOnSegment(point: Point2, start: Point2, end: Point2): boolean {
  return pointOnSegment(point, start, end) && !samePoint(point, start) && !samePoint(point, end);
}

/** Tests closed-segment intersection, including touching endpoints and collinear overlap. */
// eslint-disable-next-line complexity, max-params -- @hotpath Scalar endpoints avoid allocating segment wrappers.
function segmentsIntersect(first: Point2, second: Point2, third: Point2, fourth: Point2): boolean {
  const abC = orient2D(first, second, third);
  const abD = orient2D(first, second, fourth);
  const cdA = orient2D(third, fourth, first);
  const cdB = orient2D(third, fourth, second);
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

/** Classifies a point against a simple ring, independently of winding, with an explicit boundary result. */
function classifyPointInRing(point: Point2, ring: readonly Point2[]): 'boundary' | 'inside' | 'outside' {
  let inside = false;
  for (let index = 0; index < ring.length; index += 1) {
    const start = ring[index]!;
    const end = ring[index + 1 === ring.length ? 0 : index + 1]!;
    if (pointOnSegment(point, start, end)) return 'boundary';
    if (start[1] > point[1] !== end[1] > point[1]) {
      const x = start[0] + ((point[1] - start[1]) * (end[0] - start[0])) / (end[1] - start[1]);
      if (x > point[0]) inside = !inside;
    }
  }
  return inside ? 'inside' : 'outside';
}

/** Tests the strict interior of a counterclockwise triangle; excludes its edges and vertices. */
// eslint-disable-next-line max-params -- @hotpath Scalar vertices avoid allocating triangle wrappers.
function pointInCounterclockwiseTriangle(point: Point2, first: Point2, second: Point2, third: Point2): boolean {
  return orient2D(first, second, point) > 0 && orient2D(second, third, point) > 0 && orient2D(third, first, point) > 0;
}

/**
 * Tests crossings, T junctions, and partial collinear overlap for polygon diagonals.
 * Shared endpoint contacts and identical segments do not conflict, allowing doubled hole bridges.
 */
// eslint-disable-next-line complexity, max-params -- @hotpath This triangulation inner loop avoids allocating endpoint-pair wrappers.
function segmentsConflict(first: Point2, second: Point2, third: Point2, fourth: Point2): boolean {
  if (!segmentsIntersect(first, second, third, fourth)) return false;
  if (samePoint(first, third) || samePoint(first, fourth) || samePoint(second, third) || samePoint(second, fourth)) {
    const collinear = orient2D(first, second, third) === 0 && orient2D(first, second, fourth) === 0;
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

/** Tests intersections of nonadjacent ring edges; callers handle ring size and consecutive duplicates. */
function ringSelfIntersects(ring: readonly Point2[]): boolean {
  for (let first = 0; first < ring.length - 2; first += 1) {
    // The first edge also shares a vertex with the closing edge.
    const end = first === 0 ? ring.length - 1 : ring.length;
    for (let second = first + 2; second < end; second += 1) {
      const secondNext = second + 1 === ring.length ? 0 : second + 1;
      if (segmentsIntersect(ring[first]!, ring[first + 1]!, ring[second]!, ring[secondNext]!)) {
        return true;
      }
    }
  }
  return false;
}

/** Tests closed-edge intersection between two rings, including touching or overlapping boundaries. */
function ringsIntersect(left: readonly Point2[], right: readonly Point2[]): boolean {
  for (let leftIndex = 0; leftIndex < left.length; leftIndex += 1) {
    for (let rightIndex = 0; rightIndex < right.length; rightIndex += 1) {
      if (
        segmentsIntersect(
          left[leftIndex]!,
          left[leftIndex + 1 === left.length ? 0 : leftIndex + 1]!,
          right[rightIndex]!,
          right[rightIndex + 1 === right.length ? 0 : rightIndex + 1]!
        )
      ) {
        return true;
      }
    }
  }
  return false;
}

/** Tests strict polygon fill membership, excluding outer boundaries, holes, and hole boundaries. */
function pointInPolygon(point: Point2, outer: readonly Point2[], holes: readonly (readonly Point2[])[] = []): boolean {
  return (
    classifyPointInRing(point, outer) === 'inside' &&
    holes.every(hole => classifyPointInRing(point, hole) === 'outside')
  );
}

// @hotpath Direct exports regressed the polygon benchmarks; stable aliases preserve their performance.
const exportedOrient2D = orient2D;
const exportedSignedDoubleArea = signedDoubleArea;
const exportedSamePoint = samePoint;
const exportedIsCollinearBetween = isCollinearBetween;
const exportedPointOnSegment = pointOnSegment;
const exportedPointStrictlyOnSegment = pointStrictlyOnSegment;
const exportedSegmentsIntersect = segmentsIntersect;
const exportedClassifyPointInRing = classifyPointInRing;
const exportedPointInCounterclockwiseTriangle = pointInCounterclockwiseTriangle;
const exportedSegmentsConflict = segmentsConflict;
const exportedRingSelfIntersects = ringSelfIntersects;
const exportedRingsIntersect = ringsIntersect;
const exportedPointInPolygon = pointInPolygon;

export {
  exportedOrient2D as orient2D,
  exportedSignedDoubleArea as signedDoubleArea,
  exportedSamePoint as samePoint,
  exportedIsCollinearBetween as isCollinearBetween,
  exportedPointOnSegment as pointOnSegment,
  exportedPointStrictlyOnSegment as pointStrictlyOnSegment,
  exportedSegmentsIntersect as segmentsIntersect,
  exportedClassifyPointInRing as classifyPointInRing,
  exportedPointInCounterclockwiseTriangle as pointInCounterclockwiseTriangle,
  exportedSegmentsConflict as segmentsConflict,
  exportedRingSelfIntersects as ringSelfIntersects,
  exportedRingsIntersect as ringsIntersect,
  exportedPointInPolygon as pointInPolygon
};
