// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { SRGB_TO_LINEAR_WGSL } from '../color/transfer.js';
import { LINE_WGSL } from '../records/layouts/wgsl.js';
import { OIT_WGSL } from './transparency.js';

/** Evaluates a filtered checkerboard on a finite quad using two packed corner records. */
export const CHECKERBOARD_SHADER = /* wgsl */ `
struct Scene {
  viewProjection: mat4x4f, frame: mat4x4f,
  pixelRatio: f32, viewportWidth: f32, viewportHeight: f32, cells: f32,
}
@group(0) @binding(0) var<uniform> scene: Scene;
${LINE_WGSL}
${SRGB_TO_LINEAR_WGSL}
${OIT_WGSL}
struct Output {
  @builtin(position) position: vec4f,
  @location(0) coordinate: vec2f,
  @interpolate(flat) @location(1) color: vec4f,
  @interpolate(flat) @location(2) alternateColor: vec4f,
}
fn premultiply(value: vec4f) -> vec4f {
  return vec4f(srgbToLinear(value.rgb) * value.a, value.a);
}
@vertex fn vertexMain(@builtin(vertex_index) index: u32) -> Output {
  let corners = array<vec2f, 6>(
    vec2f(0.0, 0.0), vec2f(1.0, 0.0), vec2f(1.0, 1.0),
    vec2f(0.0, 0.0), vec2f(1.0, 1.0), vec2f(0.0, 1.0)
  );
  let start = nve_load_line_vertex(0u);
  let end = nve_load_line_vertex(1u);
  let corner = corners[index];
  var output: Output;
  let position = vec3f(mix(start.position.xy, end.position.xy, corner), 0.0);
  output.position = scene.viewProjection * scene.frame * vec4f(position, 1.0);
  output.coordinate = (corner * 2.0 - 1.0) * scene.cells;
  output.color = premultiply(start.color);
  output.alternateColor = premultiply(end.color);
  return output;
}
// The triangular antiderivative integrates the alternating +/-1 signal exactly
// over each pixel footprint, converging to the average color under minification.
fn integral(coordinate: vec2f) -> vec2f {
  return 2.0 * abs(fract(coordinate * 0.5) - 0.5);
}
fn checkerColor(input: Output) -> vec4f {
  let footprint = max(abs(dpdx(input.coordinate)) + abs(dpdy(input.coordinate)), vec2f(0.0001));
  let average = (integral(input.coordinate - footprint * 0.5) - integral(input.coordinate + footprint * 0.5)) / footprint;
  let coverage = clamp(0.5 + 0.5 * average.x * average.y, 0.0, 1.0);
  return mix(input.alternateColor, input.color, coverage);
}
@fragment fn fragmentMain(input: Output) -> @location(0) vec4f {
  let value = checkerColor(input);
  if (value.a < 1.0) { discard; }
  return value;
}
@fragment fn fragmentOit(input: Output) -> NveOitOutput {
  let value = checkerColor(input);
  if (value.a <= 0.0 || value.a >= 1.0) { discard; }
  return nve_oit(value, input.position.z);
}
`;
