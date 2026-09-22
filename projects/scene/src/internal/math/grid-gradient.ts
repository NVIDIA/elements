// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/** Validated row-major samples with at least two rows and columns and finite positive spacing. */
export interface UniformScalarGrid {
  readonly values: Float32Array;
  readonly rows: number;
  readonly columns: number;
  readonly spacing: number;
}

/** Writes the upward unit normal at one sample into xyz storage, using central and one-sided differences. */
// eslint-disable-next-line max-params -- Scalar coordinates avoid an allocation or integer division per sample.
export function writeGridNormal(grid: UniformScalarGrid, normals: Float32Array, row: number, column: number): void {
  const xSlope = differenceX(grid, row, column);
  const ySlope = differenceY(grid, row, column);
  const inverseLength = 1 / Math.hypot(xSlope, ySlope, 1);
  const offset = (row * grid.columns + column) * 3;
  normals[offset] = -xSlope * inverseLength;
  normals[offset + 1] = -ySlope * inverseLength;
  normals[offset + 2] = inverseLength;
}

function differenceX(grid: UniformScalarGrid, row: number, column: number): number {
  const current = row * grid.columns + column;
  if (column === 0) return (grid.values[current + 1]! - grid.values[current]!) / grid.spacing;
  if (column === grid.columns - 1) return (grid.values[current]! - grid.values[current - 1]!) / grid.spacing;
  return (grid.values[current + 1]! - grid.values[current - 1]!) / (2 * grid.spacing);
}

function differenceY(grid: UniformScalarGrid, row: number, column: number): number {
  const current = row * grid.columns + column;
  if (row === 0) return (grid.values[current + grid.columns]! - grid.values[current]!) / grid.spacing;
  if (row === grid.rows - 1) return (grid.values[current]! - grid.values[current - grid.columns]!) / grid.spacing;
  return (grid.values[current + grid.columns]! - grid.values[current - grid.columns]!) / (2 * grid.spacing);
}

/** Shader differences for validated row-major storage; dimensions contain columns and rows. */
export const GRID_GRADIENT_WGSL = /* wgsl */ `
fn nve_grid_gradient(values: ptr<storage, array<f32>, read>, dimensions: vec2u, spacing: f32, index: u32) -> vec2f {
  let row = index / dimensions.x;
  let column = index - row * dimensions.x;
  var dx: f32;
  if (column == 0u) { dx = ((*values)[index + 1u] - (*values)[index]) / spacing; }
  else if (column + 1u == dimensions.x) { dx = ((*values)[index] - (*values)[index - 1u]) / spacing; }
  else { dx = ((*values)[index + 1u] - (*values)[index - 1u]) / (2.0 * spacing); }
  var dy: f32;
  if (row == 0u) { dy = ((*values)[index + dimensions.x] - (*values)[index]) / spacing; }
  else if (row + 1u == dimensions.y) { dy = ((*values)[index] - (*values)[index - dimensions.x]) / spacing; }
  else { dy = ((*values)[index + dimensions.x] - (*values)[index - dimensions.x]) / (2.0 * spacing); }
  return vec2f(dx, dy);
}
`;
