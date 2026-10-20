// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import {
  LINE_TOPOLOGY_CODE,
  lineCountIsValid,
  lineJoinCount,
  lineJoinVertex,
  lineSegmentCount,
  lineSegmentEnd,
  lineSegmentStart,
  type LineTopology
} from './line-topology.js';

describe('line topology', () => {
  it.each([
    { topology: 'strip', counts: [0, 1, 2, 3], segments: [0, 0, 1, 2], joins: [0, 0, 0, 1] },
    { topology: 'loop', counts: [0, 3, 4, 5], segments: [0, 3, 4, 5], joins: [0, 3, 4, 5] },
    { topology: 'segments', counts: [0, 2, 4, 6], segments: [0, 1, 2, 3], joins: [0, 0, 0, 0] }
  ] satisfies { topology: LineTopology; counts: number[]; segments: number[]; joins: number[] }[])(
    'counts $topology segments and joins at empty and minimum sizes',
    ({ topology, counts, segments, joins }) => {
      expect(counts.map(count => lineCountIsValid(count, topology))).toEqual([true, true, true, true]);
      expect(counts.map(count => lineSegmentCount(count, topology))).toEqual(segments);
      expect(counts.map(count => lineJoinCount(count, topology))).toEqual(joins);
    }
  );

  it('rejects incomplete loops and pairs while describing complete segments in an input prefix', () => {
    for (const count of [1, 2]) {
      expect(lineCountIsValid(count, 'loop')).toBe(false);
      expect(lineSegmentCount(count, 'loop')).toBe(0);
      expect(lineJoinCount(count, 'loop')).toBe(0);
    }
    for (const count of [1, 3, 5]) {
      expect(lineCountIsValid(count, 'segments')).toBe(false);
      expect(lineSegmentCount(count, 'segments')).toBe(Math.floor(count / 2));
      expect(lineJoinCount(count, 'segments')).toBe(0);
    }
  });

  it.each([-1, 0.5, NaN, Infinity, -Infinity, Number.MAX_SAFE_INTEGER + 1])(
    'rejects invalid vertex count %s for every topology',
    count => {
      for (const topology of ['strip', 'loop', 'segments'] as const) {
        expect(lineCountIsValid(count, topology)).toBe(false);
      }
    }
  );

  it.each(['strip', 'loop', 'segments'] as const)('matches an explicit %s edge and adjacency model', topology => {
    for (let count = 0; count <= 64; count += 1) {
      const vertices = Array.from({ length: count }, (_, index) => index);
      const edges: [number, number][] = [];
      for (const vertex of vertices) {
        if (topology === 'segments' && vertex % 2 !== 0) continue;
        if (vertex + 1 < count) edges.push([vertex, vertex + 1]);
        else if (topology === 'loop' && count >= 3) edges.push([vertex, 0]);
      }
      if (topology === 'loop' && count < 3) edges.length = 0;
      const joins = vertices.filter(
        vertex => edges.some(edge => edge[1] === vertex) && edges.some(edge => edge[0] === vertex)
      );
      expect(lineSegmentCount(count, topology)).toBe(edges.length);
      expect(lineJoinCount(count, topology)).toBe(joins.length);
      expect(
        edges.map((_, segment) => [lineSegmentStart(segment, topology), lineSegmentEnd(segment, count, topology)])
      ).toEqual(edges);
      expect(joins.map((_, join) => lineJoinVertex(join, topology))).toEqual(joins);
    }
  });

  it('keeps million-segment and safe integer boundaries exact without geometry expansion or bitwise truncation', () => {
    const count = Number.MAX_SAFE_INTEGER;
    expect(lineSegmentCount(1_000_001, 'strip')).toBe(1_000_000);
    expect(lineSegmentCount(1_000_000, 'loop')).toBe(1_000_000);
    expect(lineSegmentCount(2_000_000, 'segments')).toBe(1_000_000);
    expect(lineSegmentStart(count - 2, 'strip')).toBe(count - 2);
    expect(lineSegmentEnd(count - 2, count, 'strip')).toBe(count - 1);
    expect(lineSegmentEnd(count - 1, count, 'loop')).toBe(0);
    const pairs = lineSegmentCount(count - 1, 'segments');
    expect(lineCountIsValid(count - 1, 'segments')).toBe(true);
    expect(lineSegmentStart(pairs - 1, 'segments')).toBe(count - 3);
    expect(lineSegmentEnd(pairs - 1, count - 1, 'segments')).toBe(count - 2);
    expect(lineJoinVertex(lineJoinCount(count, 'strip') - 1, 'strip')).toBe(count - 2);
  });

  it('retains the topology uniform encoding', () => {
    expect(LINE_TOPOLOGY_CODE).toEqual({ strip: 0, loop: 1, segments: 2 });
    expect(Object.isFrozen(LINE_TOPOLOGY_CODE)).toBe(true);
  });
});
