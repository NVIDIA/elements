// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { RectangleIndex, type RectangleBounds } from '../structures/rectangle-index.js';
import {
  classifyPointInRing,
  type Point2,
  pointOnSegment,
  pointInPolygon,
  ringsIntersect,
  ringSelfIntersects,
  segmentsIntersect
} from './geometry-2d.js';

/** Small rings use direct scans to avoid index construction and query overhead. */
export const RING_INDEX_THRESHOLD = 128;

/** Inclusive bounds for one segment, including zero-length segments. */
export function segmentBounds(start: Point2, end: Point2): RectangleBounds {
  return [
    Math.min(start[0], end[0]),
    Math.min(start[1], end[1]),
    Math.max(start[0], end[0]),
    Math.max(start[1], end[1])
  ];
}

/**
 * Repeated queries against an immutable ring. Bounds select candidates; the geometry
 * predicates keep exact JavaScript arithmetic, boundary rules, and winding behavior.
 * Callers keep ring coordinates unchanged for the query's lifetime.
 */
export class RingQuery {
  readonly #edges: RectangleIndex | undefined;

  constructor(readonly ring: readonly Point2[]) {
    this.#edges =
      ring.length < RING_INDEX_THRESHOLD
        ? undefined
        : new RectangleIndex(ring.map((start, index) => segmentBounds(start, ring[(index + 1) % ring.length]!)));
  }

  classify(point: Point2): 'inside' | 'outside' | 'boundary' {
    if (!this.#edges) return classifyPointInRing(point, this.ring);
    let inside = false;
    // Use a full horizontal strip: rounded ray intersections need not lie within an edge's x bounds.
    const boundary = this.#edges.some(-Infinity, point[1], Infinity, point[1], index => {
      const start = this.ring[index]!;
      const end = this.ring[(index + 1) % this.ring.length]!;
      if (pointOnSegment(point, start, end)) return true;
      if (start[1] > point[1] !== end[1] > point[1]) {
        const x = start[0] + ((point[1] - start[1]) * (end[0] - start[0])) / (end[1] - start[1]);
        if (x > point[0]) inside = !inside;
      }
      return false;
    });
    return boundary ? 'boundary' : inside ? 'inside' : 'outside';
  }

  selfIntersects(): boolean {
    if (!this.#edges) return ringSelfIntersects(this.ring);
    for (let first = 0; first < this.ring.length - 2; first += 1) {
      const start = this.ring[first]!;
      const end = this.ring[first + 1]!;
      if (
        this.#edges.some(
          ...segmentBounds(start, end),
          second =>
            second >= first + 2 &&
            (first !== 0 || second !== this.ring.length - 1) &&
            segmentsIntersect(start, end, this.ring[second]!, this.ring[(second + 1) % this.ring.length]!)
        )
      )
        return true;
    }
    return false;
  }

  intersects(other: RingQuery): boolean {
    if (!this.#edges && !other.#edges) return ringsIntersect(this.ring, other.ring);
    const indexed = this.#edges ? this : other;
    const scanned = indexed === this ? other : this;
    for (let index = 0; index < scanned.ring.length; index += 1) {
      const start = scanned.ring[index]!;
      const end = scanned.ring[(index + 1) % scanned.ring.length]!;
      if (
        indexed.#edges!.some(...segmentBounds(start, end), candidate => {
          const indexedStart = indexed.ring[candidate]!;
          const indexedEnd = indexed.ring[(candidate + 1) % indexed.ring.length]!;
          return indexed === this
            ? segmentsIntersect(indexedStart, indexedEnd, start, end)
            : segmentsIntersect(start, end, indexedStart, indexedEnd);
        })
      )
        return true;
    }
    return false;
  }
}

/** Shares ring indices across diagonal membership and final triangle verification. */
export class PolygonFillQuery {
  readonly #outerQuery: RingQuery | undefined;
  readonly #holeQueries: readonly RingQuery[];

  constructor(
    readonly outer: readonly Point2[],
    readonly holes: readonly (readonly Point2[])[]
  ) {
    const indexed = outer.length >= RING_INDEX_THRESHOLD || holes.some(hole => hole.length >= RING_INDEX_THRESHOLD);
    this.#outerQuery = indexed ? new RingQuery(outer) : undefined;
    this.#holeQueries = indexed ? holes.map(hole => new RingQuery(hole)) : [];
  }

  contains(point: Point2): boolean {
    if (!this.#outerQuery) return pointInPolygon(point, this.outer, this.holes);
    return (
      this.#outerQuery.classify(point) === 'inside' &&
      this.#holeQueries.every(hole => hole.classify(point) === 'outside')
    );
  }
}
