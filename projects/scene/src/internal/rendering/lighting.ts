// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/** Shared ambient and directional lighting from the default camera side. */
export const DEFAULT_LIGHTING_WGSL = /* wgsl */ `
fn nve_default_lighting(normal: vec3f) -> f32 {
  let directionToLight = normalize(vec3f(0.0, -1.0, 1.0));
  return 0.25 + 0.75 * max(dot(normalize(normal), directionToLight), 0.0);
}
`;
