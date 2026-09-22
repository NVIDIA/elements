// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/** Defines the GPU half of the little-endian pick ID and depth readback protocol. */
export const PICK_OUTPUT_WGSL = /* wgsl */ `
struct NvePickOutput {
  @location(0) id: vec4u,
  @location(1) depth: f32,
}

fn nve_pick_output(id: u32, depth: f32) -> NvePickOutput {
  return NvePickOutput(
    vec4u(id & 255u, (id >> 8u) & 255u, (id >> 16u) & 255u, id >> 24u),
    depth
  );
}
`;
