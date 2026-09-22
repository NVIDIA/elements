// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

// eslint-disable-next-line max-statements -- Direct scalar writes avoid per-triangle temporary arrays.
export function writeTriangleNormal(
  geometry: { positions: Float32Array; normals: Float32Array },
  offset: number,
  normalization: 'division' | 'reciprocal' = 'reciprocal'
): void {
  const { positions, normals } = geometry;
  const ax = positions[offset + 3]! - positions[offset]!;
  const ay = positions[offset + 4]! - positions[offset + 1]!;
  const az = positions[offset + 5]! - positions[offset + 2]!;
  const bx = positions[offset + 6]! - positions[offset]!;
  const by = positions[offset + 7]! - positions[offset + 1]!;
  const bz = positions[offset + 8]! - positions[offset + 2]!;
  const nx = ay * bz - az * by;
  const ny = az * bx - ax * bz;
  const nz = ax * by - ay * bx;
  const length = Math.hypot(nx, ny, nz);
  const inverseLength = length === 0 ? 0 : 1 / length;
  // Preserve each caller's rounding and signed zeros while sharing winding and storage.
  const normalX = normalization === 'division' ? (length === 0 ? 0 : nx / length) : nx * inverseLength;
  const normalY = normalization === 'division' ? (length === 0 ? 0 : ny / length) : ny * inverseLength;
  const normalZ = length === 0 ? 1 : normalization === 'division' ? nz / length : nz * inverseLength;
  for (let vertex = 0; vertex < 3; vertex += 1) {
    const target = offset + vertex * 3;
    normals[target] = normalX;
    normals[target + 1] = normalY;
    normals[target + 2] = normalZ;
  }
}
