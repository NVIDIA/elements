// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Matrix4 } from '../math/types.js';

/** Writes rigid frame rotation independently of the precise position transform. */
export function writeFrameNormalTransform(uniforms: Float32Array, frame: Matrix4): void {
  uniforms.fill(0, 16, 32);
  uniforms[31] = 1;
  for (let column = 0; column < 3; column += 1) {
    for (let row = 0; row < 3; row += 1) {
      const index = column * 4 + row;
      uniforms[16 + index] = frame[index]!;
    }
  }
}

/** Shared ambient and directional lighting from the default camera side. */
export const DEFAULT_LIGHTING_WGSL = /* wgsl */ `
fn nve_default_lighting(normal: vec3f) -> f32 {
  let directionToLight = normalize(vec3f(0.0, -1.0, 1.0));
  return 0.25 + 0.75 * max(dot(normalize(normal), directionToLight), 0.0);
}
`;
