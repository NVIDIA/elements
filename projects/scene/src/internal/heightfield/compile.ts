// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { HeightfieldGrid } from './types.js';

const MAX_TYPED_ARRAY_LENGTH = 0xffff_ffff;
const MAX_VERTEX_COUNT = Math.floor(MAX_TYPED_ARRAY_LENGTH / 4);
const MAX_INDEX_COUNT = Math.floor(MAX_TYPED_ARRAY_LENGTH / 6) * 6;
const MAX_COMPILED_BYTE_LENGTH = 256 * 1024 * 1024;

interface CompiledHeightfield {
  readonly positions: Float32Array;
  readonly normals: Float32Array;
  readonly colors: Float32Array | null;
  readonly indices: Uint32Array;
}

interface HeightfieldTopology {
  readonly rows: number;
  readonly columns: number;
  readonly spacing: number;
}

const compiledTopologies = new WeakMap<CompiledHeightfield, HeightfieldTopology>();

/** Check a grid before compiling or assigning it to a heightfield element. */
export function validateHeightfieldGrid(grid: HeightfieldGrid): void {
  if (grid === null || typeof grid !== 'object') {
    throw new RangeError('Grid must be an object.');
  }
  if (!Number.isFinite(grid.spacing) || grid.spacing <= 0) {
    throw new RangeError('spacing must be a finite number greater than zero.');
  }
  validateDimension(grid.rows, 'rows');
  validateDimension(grid.columns, 'columns');
  validateAllocationCounts(grid);
  validateHeights(grid);
  validateOrigin(grid.origin);
  validateColors(grid);
}

function validateHeights(grid: HeightfieldGrid): void {
  if (!(grid.heights instanceof Float32Array)) {
    throw new RangeError('heights must be a Float32Array.');
  }
  const vertexCount = grid.rows * grid.columns;
  if (grid.heights.length !== vertexCount) {
    throw new RangeError('heights length must equal rows multiplied by columns.');
  }
  if (grid.heights.some(height => !Number.isFinite(height))) {
    throw new RangeError('heights must contain only finite values.');
  }
}

function validateColors(grid: HeightfieldGrid): void {
  if (grid.colors !== undefined) {
    if (!(grid.colors instanceof Uint8Array)) {
      throw new RangeError('colors must be a Uint8Array when supplied.');
    }
    if (grid.colors.length !== grid.rows * grid.columns * 4) {
      throw new RangeError('colors length must contain four values for every height sample.');
    }
  }
}

/** Compile a validated grid into indexed, smooth-shaded mesh arrays. */
export function compileHeightfield(grid: HeightfieldGrid): CompiledHeightfield {
  validateHeightfieldGrid(grid);
  const positions = createPositions(grid);
  const compiled = {
    positions,
    normals: createNormals(grid),
    colors: createColors(grid.colors),
    indices: createIndices(grid.rows, grid.columns)
  };
  compiledTopologies.set(compiled, topologyOf(grid));
  return compiled;
}

/**
 * Rebuild mutable heightfield attributes while retaining known-safe topology.
 * Dimensions and spacing must match the previous grid's topology; origin and
 * colors may change and update the returned mesh data.
 */
export function recomputeHeightfield(grid: HeightfieldGrid, previous: CompiledHeightfield): CompiledHeightfield {
  validateHeightfieldGrid(grid);
  if (!hasTopology(previous, grid)) {
    throw new RangeError('Grid topology does not match the previously compiled heightfield.');
  }
  const compiled = {
    positions: createPositions(grid),
    normals: createNormals(grid),
    colors: createColors(grid.colors),
    indices: previous.indices
  };
  compiledTopologies.set(compiled, topologyOf(grid));
  return compiled;
}

function validateDimension(value: number, name: 'rows' | 'columns'): void {
  if (!Number.isSafeInteger(value) || value < 2) {
    throw new RangeError(`${name} must be a safe integer greater than or equal to two.`);
  }
}

function validateOrigin(origin: HeightfieldGrid['origin']): void {
  if (origin === undefined) return;
  if (!Array.isArray(origin) || origin.length !== 2 || !Number.isFinite(origin[0]) || !Number.isFinite(origin[1])) {
    throw new RangeError('origin must contain exactly two finite numbers.');
  }
}

function validateAllocationCounts(grid: HeightfieldGrid): void {
  const vertexCount = grid.rows * grid.columns;
  const cellCount = (grid.rows - 1) * (grid.columns - 1);
  const indexCount = cellCount * 6;
  const byteLength =
    vertexCount * 6 * Float32Array.BYTES_PER_ELEMENT +
    indexCount * Uint32Array.BYTES_PER_ELEMENT +
    (grid.colors === undefined ? 0 : vertexCount * 4 * Float32Array.BYTES_PER_ELEMENT);
  if (
    !Number.isSafeInteger(vertexCount) ||
    !Number.isSafeInteger(cellCount) ||
    !Number.isSafeInteger(indexCount) ||
    vertexCount > MAX_VERTEX_COUNT ||
    indexCount > MAX_INDEX_COUNT ||
    byteLength > MAX_COMPILED_BYTE_LENGTH
  ) {
    throw new RangeError('Grid dimensions exceed the heightfield allocation limit.');
  }
}

function topologyOf(grid: HeightfieldGrid): HeightfieldTopology {
  return { rows: grid.rows, columns: grid.columns, spacing: grid.spacing };
}

function hasTopology(previous: CompiledHeightfield, grid: HeightfieldGrid): boolean {
  const topology = compiledTopologies.get(previous);
  return topology?.rows === grid.rows && topology.columns === grid.columns && topology.spacing === grid.spacing;
}

function createPositions(grid: HeightfieldGrid): Float32Array {
  const positions = new Float32Array(grid.rows * grid.columns * 3);
  const [originX, originY] = grid.origin ?? [0, 0];
  for (let row = 0; row < grid.rows; row += 1) {
    for (let column = 0; column < grid.columns; column += 1) {
      const sample = row * grid.columns + column;
      const offset = sample * 3;
      positions[offset] = originX + column * grid.spacing;
      positions[offset + 1] = originY + row * grid.spacing;
      positions[offset + 2] = grid.heights[sample]!;
    }
  }
  return positions;
}

function createNormals(grid: HeightfieldGrid): Float32Array {
  const normals = new Float32Array(grid.rows * grid.columns * 3);
  for (let row = 0; row < grid.rows; row += 1) {
    for (let column = 0; column < grid.columns; column += 1) {
      const xSlope = differenceX(grid, row, column);
      const ySlope = differenceY(grid, row, column);
      const inverseLength = 1 / Math.hypot(xSlope, ySlope, 1);
      const offset = (row * grid.columns + column) * 3;
      normals[offset] = -xSlope * inverseLength;
      normals[offset + 1] = -ySlope * inverseLength;
      normals[offset + 2] = inverseLength;
    }
  }
  return normals;
}

function differenceX(grid: HeightfieldGrid, row: number, column: number): number {
  const current = row * grid.columns + column;
  if (column === 0) return (grid.heights[current + 1]! - grid.heights[current]!) / grid.spacing;
  if (column === grid.columns - 1) return (grid.heights[current]! - grid.heights[current - 1]!) / grid.spacing;
  return (grid.heights[current + 1]! - grid.heights[current - 1]!) / (2 * grid.spacing);
}

function differenceY(grid: HeightfieldGrid, row: number, column: number): number {
  const current = row * grid.columns + column;
  if (row === 0) return (grid.heights[current + grid.columns]! - grid.heights[current]!) / grid.spacing;
  if (row === grid.rows - 1) return (grid.heights[current]! - grid.heights[current - grid.columns]!) / grid.spacing;
  return (grid.heights[current + grid.columns]! - grid.heights[current - grid.columns]!) / (2 * grid.spacing);
}

function createColors(colors: Uint8Array | undefined): Float32Array | null {
  if (colors === undefined) return null;
  const normalized = new Float32Array(colors.length);
  for (let index = 0; index < colors.length; index += 1) normalized[index] = colors[index]! / 255;
  return normalized;
}

function createIndices(rows: number, columns: number): Uint32Array {
  const indices = new Uint32Array((rows - 1) * (columns - 1) * 6);
  let offset = 0;
  for (let row = 0; row < rows - 1; row += 1) {
    for (let column = 0; column < columns - 1; column += 1) {
      const topLeft = row * columns + column;
      const topRight = topLeft + 1;
      const bottomLeft = topLeft + columns;
      const bottomRight = bottomLeft + 1;
      indices.set([topLeft, topRight, bottomLeft, topRight, bottomRight, bottomLeft], offset);
      offset += 6;
    }
  }
  return indices;
}
