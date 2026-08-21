// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const UNPACK_COLOR_WGSL = /* wgsl */ `
fn nve_unpack_unorm8x4(word: u32) -> vec4f {
  let bytes = vec4u(word & 0xffu, (word >> 8u) & 0xffu, (word >> 16u) & 0xffu, (word >> 24u) & 0xffu);
  return vec4f(bytes) / 255.0;
}
`;

/** Shared ambient and directional lighting from the default camera side. */
export const DEFAULT_LIGHTING_WGSL = /* wgsl */ `
fn nve_default_lighting(normal: vec3f) -> f32 {
  let directionToLight = normalize(vec3f(0.0, -1.0, 1.0));
  return 0.25 + 0.75 * max(dot(normalize(normal), directionToLight), 0.0);
}
`;

export const MARKER_WGSL = /* wgsl */ `
struct NveMarker {
  position: vec3f,
  orientation: vec4f,
  scale: vec3f,
  color: vec4f,
  outlineColor: vec4f,
}

@group(1) @binding(0) var<storage, read> nve_marker_words: array<u32>;
${UNPACK_COLOR_WGSL}
fn nve_load_marker(i: u32) -> NveMarker {
  let base = i * 12u;
  return NveMarker(
    vec3f(
      bitcast<f32>(nve_marker_words[base]),
      bitcast<f32>(nve_marker_words[base + 1u]),
      bitcast<f32>(nve_marker_words[base + 2u]),
    ),
    vec4f(
      bitcast<f32>(nve_marker_words[base + 3u]),
      bitcast<f32>(nve_marker_words[base + 4u]),
      bitcast<f32>(nve_marker_words[base + 5u]),
      bitcast<f32>(nve_marker_words[base + 6u]),
    ),
    vec3f(
      bitcast<f32>(nve_marker_words[base + 7u]),
      bitcast<f32>(nve_marker_words[base + 8u]),
      bitcast<f32>(nve_marker_words[base + 9u]),
    ),
    nve_unpack_unorm8x4(nve_marker_words[base + 10u]),
    nve_unpack_unorm8x4(nve_marker_words[base + 11u]),
  );
}
`;

export const STREAM_WGSL = /* wgsl */ `
struct NveStreamVertex {
  position: vec3f,
  color: vec4f,
}

@group(1) @binding(0) var<storage, read> nve_stream_words: array<u32>;
${UNPACK_COLOR_WGSL}
fn nve_load_stream_vertex(i: u32) -> NveStreamVertex {
  let base = i * 4u;
  return NveStreamVertex(
    vec3f(
      bitcast<f32>(nve_stream_words[base]),
      bitcast<f32>(nve_stream_words[base + 1u]),
      bitcast<f32>(nve_stream_words[base + 2u]),
    ),
    nve_unpack_unorm8x4(nve_stream_words[base + 3u]),
  );
}
`;

export const LINE_WGSL = /* wgsl */ `
struct NveLineVertex {
  position: vec3f,
  color: vec4f,
  normal: vec3f,
  width: f32,
  dash: f32,
  gap: f32,
}

@group(1) @binding(0) var<storage, read> nve_line_words: array<u32>;
${UNPACK_COLOR_WGSL}
fn nve_load_line_vertex(i: u32) -> NveLineVertex {
  let base = i * 10u;
  return NveLineVertex(
    vec3f(
      bitcast<f32>(nve_line_words[base]),
      bitcast<f32>(nve_line_words[base + 1u]),
      bitcast<f32>(nve_line_words[base + 2u]),
    ),
    nve_unpack_unorm8x4(nve_line_words[base + 3u]),
    vec3f(
      bitcast<f32>(nve_line_words[base + 4u]),
      bitcast<f32>(nve_line_words[base + 5u]),
      bitcast<f32>(nve_line_words[base + 6u]),
    ),
    bitcast<f32>(nve_line_words[base + 7u]),
    bitcast<f32>(nve_line_words[base + 8u]),
    bitcast<f32>(nve_line_words[base + 9u]),
  );
}
`;
