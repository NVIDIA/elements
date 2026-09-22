// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { ArrayBackedLinkedList } from '../structures/array-backed-linked-list.js';
import { isCollinearBetween, type Point2 } from './geometry-2d.js';

/**
 * Removes redundant collinear vertices from an open ring with finite coordinates.
 * Keeps reversals and survivor order, including the cyclic seam. Degenerate rings can shrink to two vertices.
 * Returns a new array retaining the original point objects; does not mutate the input.
 * Takes linear time and space: each removal queues at most its two remaining neighbors.
 */
export function removeCollinearVertices<T extends Point2>(points: readonly T[]): T[] {
  if (points.length < 3 || !hasCollinearVertex(points)) return points.slice();
  const remaining = new ArrayBackedLinkedList(points.length);
  const pending = Array.from({ length: points.length }, (_, index) => index);
  const queued = new Uint8Array(points.length).fill(1);
  for (let head = 0; head < pending.length && remaining.size >= 3; head += 1) {
    const index = pending[head]!;
    queued[index] = 0;
    const previous = remaining.previous(index);
    const next = remaining.next(index);
    if (!isCollinearBetween(points[previous]!, points[index]!, points[next]!)) continue;
    remaining.remove(index);
    enqueue(previous, pending, queued);
    enqueue(next, pending, queued);
  }
  return points.filter((_, index) => remaining.next(index) !== -1);
}

function hasCollinearVertex(points: readonly Point2[]): boolean {
  for (let index = 0; index < points.length; index += 1) {
    const previous = points[(index - 1 + points.length) % points.length]!;
    const next = points[(index + 1) % points.length]!;
    if (isCollinearBetween(previous, points[index]!, next)) return true;
  }
  return false;
}

function enqueue(index: number, pending: number[], queued: Uint8Array): void {
  if (queued[index] !== 0) return;
  queued[index] = 1;
  pending.push(index);
}
