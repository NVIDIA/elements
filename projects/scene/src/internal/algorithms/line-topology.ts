// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

export type LineTopology = 'strip' | 'loop' | 'segments';

/** Shared numeric encoding for CPU uniforms and shader indexing. */
export const LINE_TOPOLOGY_CODE = Object.freeze({ strip: 0, loop: 1, segments: 2 });

/** Accepts nonnegative safe integer vertex counts; loops need three vertices and independent segments need pairs. */
export function lineCountIsValid(count: number, topology: LineTopology): boolean {
  if (!Number.isSafeInteger(count) || count < 0) return false;
  if (topology === 'segments') return count % 2 === 0;
  if (topology === 'loop') return count === 0 || count >= 3;
  return true;
}

/** Counts complete segments for a nonnegative safe integer vertex count, including incomplete input prefixes. */
export function lineSegmentCount(count: number, topology: LineTopology): number {
  if (topology === 'segments') return Math.floor(count / 2);
  if (topology === 'loop') return count >= 3 ? count : 0;
  return Math.max(0, count - 1);
}

/** Counts connected interior joins; independent segments and loops with fewer than three vertices have none. */
export function lineJoinCount(count: number, topology: LineTopology): number {
  if (topology === 'segments') return 0;
  if (topology === 'loop') return count >= 3 ? count : 0;
  return Math.max(0, count - 2);
}

/** Maps a valid segment ordinal to its starting vertex without allocating an endpoint pair. */
export function lineSegmentStart(segment: number, topology: LineTopology): number {
  return topology === 'segments' ? segment * 2 : segment;
}

/** Maps a valid segment ordinal to its ending vertex, including the closing edge of a loop. */
export function lineSegmentEnd(segment: number, count: number, topology: LineTopology): number {
  const next = lineSegmentStart(segment, topology) + 1;
  return topology === 'loop' && next === count ? 0 : next;
}

/** Maps a valid join ordinal to its middle vertex. Counts and index mappings take constant time and space. */
export function lineJoinVertex(join: number, topology: LineTopology): number {
  return topology === 'strip' ? join + 1 : join;
}

/** Shader equivalents for checked u32 segment and join ordinals, independent of uniforms and record storage. */
export const LINE_TOPOLOGY_WGSL = /* wgsl */ `
const NVE_LINE_STRIP = ${LINE_TOPOLOGY_CODE.strip}u;
const NVE_LINE_LOOP = ${LINE_TOPOLOGY_CODE.loop}u;
const NVE_LINE_SEGMENTS = ${LINE_TOPOLOGY_CODE.segments}u;

fn nve_line_segment_start(segment: u32, topology: u32) -> u32 {
  return select(segment, segment * 2u, topology == NVE_LINE_SEGMENTS);
}

fn nve_line_segment_end(segment: u32, count: u32, topology: u32) -> u32 {
  let next = nve_line_segment_start(segment, topology) + 1u;
  return select(next, 0u, topology == NVE_LINE_LOOP && next == count);
}

fn nve_line_join_vertex(join: u32, topology: u32) -> u32 {
  return select(join, join + 1u, topology == NVE_LINE_STRIP);
}
`;
