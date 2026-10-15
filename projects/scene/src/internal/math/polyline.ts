// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/** Largest join extension relative to the larger adjacent half-width. Also bounds world-space joins. */
export const POLYLINE_MITER_LIMIT = 4;

/** Two triangles complete a miter. Bevels suppress the second triangle. */
export const POLYLINE_JOIN_VERTEX_COUNT = 6;

/**
 * Geometry for finite projected or frame-local coordinates and positive adjacent half-widths.
 * Callers keep differences, products, and offsets within the f32 range.
 * Direction helpers return zero when squared segment length is at most 1e-6.
 * Join helpers accept those directions and suppress degenerate or nearly straight turns.
 * Shapes 0, 1, and 2 select the miter tip, first outer edge, and second outer edge.
 * Shapes 3, 4, and 5 complete the miter with the origin, second edge, and first edge.
 * An over-limit or undefined miter uses the origin as its tip, forming one bevel triangle.
 * Bevels suppress shapes 3 through 5 to avoid overlapping triangles.
 * Callers own projection, units, topology, width validation, and dash suppression.
 */
export const POLYLINE_WGSL = /* wgsl */ `
const NVE_POLYLINE_EPSILON = 0.000001;
const NVE_POLYLINE_MITER_LIMIT = ${POLYLINE_MITER_LIMIT}.0;

struct NvePolylineJoin2 { offset: vec2f, valid: bool }
struct NvePolylineJoin3 { offset: vec3f, valid: bool }

fn nve_polyline_direction2(start: vec2f, end: vec2f) -> vec2f {
  let delta = end - start;
  if (dot(delta, delta) > NVE_POLYLINE_EPSILON) { return normalize(delta); }
  return vec2f(0.0);
}

fn nve_polyline_direction3(start: vec3f, end: vec3f) -> vec3f {
  let delta = end - start;
  if (dot(delta, delta) > NVE_POLYLINE_EPSILON) { return normalize(delta); }
  return vec3f(0.0);
}

fn nve_polyline_miter_length(halfWidths: vec2f, alignment: f32) -> f32 {
  let averageHalf = 0.5 * (halfWidths.x + halfWidths.y);
  return averageHalf / max(abs(alignment), NVE_POLYLINE_EPSILON);
}

fn nve_polyline_offset2(first: vec2f, second: vec2f, halfWidths: vec2f, side: f32, shape: u32) -> vec2f {
  if (shape == 1u) { return first * side * halfWidths.x; }
  if (shape == 2u) { return second * side * halfWidths.y; }
  let sum = first + second;
  if (dot(sum, sum) == 0.0) { return vec2f(0.0); }
  let miter = normalize(sum) * side;
  let miterLength = nve_polyline_miter_length(halfWidths, dot(miter, first));
  return select(vec2f(0.0), miter * miterLength, miterLength <= max(halfWidths.x, halfWidths.y) * NVE_POLYLINE_MITER_LIMIT);
}

fn nve_polyline_offset3(first: vec3f, second: vec3f, halfWidths: vec2f, side: f32, shape: u32) -> vec3f {
  if (shape == 1u) { return first * side * halfWidths.x; }
  if (shape == 2u) { return second * side * halfWidths.y; }
  let sum = first + second;
  if (dot(sum, sum) == 0.0) { return vec3f(0.0); }
  let miter = normalize(sum) * side;
  let miterLength = nve_polyline_miter_length(halfWidths, dot(miter, first));
  return select(vec3f(0.0), miter * miterLength, miterLength <= max(halfWidths.x, halfWidths.y) * NVE_POLYLINE_MITER_LIMIT);
}

fn nve_polyline_join2(incoming: vec2f, outgoing: vec2f, halfWidths: vec2f, shape: u32) -> NvePolylineJoin2 {
  let turn = incoming.x * outgoing.y - incoming.y * outgoing.x;
  if (dot(incoming, incoming) < NVE_POLYLINE_EPSILON || dot(outgoing, outgoing) < NVE_POLYLINE_EPSILON || abs(turn) < NVE_POLYLINE_EPSILON) {
    return NvePolylineJoin2(vec2f(0.0), false);
  }
  let first = vec2f(-incoming.y, incoming.x);
  let second = vec2f(-outgoing.y, outgoing.x);
  let side = select(1.0, -1.0, turn > 0.0);
  var selectedShape = shape;
  if (shape >= 3u) {
    let tip = nve_polyline_offset2(first, second, halfWidths, side, 0u);
    if (all(tip == vec2f(0.0))) { return NvePolylineJoin2(vec2f(0.0), false); }
    if (shape == 3u) { return NvePolylineJoin2(vec2f(0.0), true); }
    selectedShape = select(1u, 2u, shape == 4u);
  }
  return NvePolylineJoin2(nve_polyline_offset2(first, second, halfWidths, side, selectedShape), true);
}

fn nve_polyline_join3(incoming: vec3f, outgoing: vec3f, firstNormal: vec3f, secondNormal: vec3f, halfWidths: vec2f, shape: u32) -> NvePolylineJoin3 {
  let firstValue = cross(incoming, firstNormal);
  let secondValue = cross(outgoing, secondNormal);
  if (dot(firstValue, firstValue) < NVE_POLYLINE_EPSILON || dot(secondValue, secondValue) < NVE_POLYLINE_EPSILON) {
    return NvePolylineJoin3(vec3f(0.0), false);
  }
  let first = normalize(firstValue);
  let second = normalize(secondValue);
  var planeNormal = secondNormal;
  let normalSum = firstNormal + secondNormal;
  if (dot(normalSum, normalSum) > NVE_POLYLINE_EPSILON) { planeNormal = normalize(normalSum); }
  let turn = dot(cross(incoming, outgoing), planeNormal);
  if (abs(turn) < NVE_POLYLINE_EPSILON) { return NvePolylineJoin3(vec3f(0.0), false); }
  // direction cross normal points opposite to the 2D perpendicular.
  let side = select(-1.0, 1.0, turn > 0.0);
  var selectedShape = shape;
  if (shape >= 3u) {
    let tip = nve_polyline_offset3(first, second, halfWidths, side, 0u);
    if (all(tip == vec3f(0.0))) { return NvePolylineJoin3(vec3f(0.0), false); }
    if (shape == 3u) { return NvePolylineJoin3(vec3f(0.0), true); }
    selectedShape = select(1u, 2u, shape == 4u);
  }
  return NvePolylineJoin3(nve_polyline_offset3(first, second, halfWidths, side, selectedShape), true);
}
`;
