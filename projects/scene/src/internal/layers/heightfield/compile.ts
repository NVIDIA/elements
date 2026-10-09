// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { HeightfieldGrid } from './types.js';
import { writeGridNormal, type UniformScalarGrid } from '../../math/grid-gradient.js';
import {
  createHeightfieldIndices,
  getHeightfieldTopology,
  hasSameHeightfieldTopology,
  prepareHeightfieldIndices,
  type HeightfieldTopology
} from './topology.js';
import {
  beginPreparation,
  resumePreparation,
  runPreparationSync,
  PREPARATION_CHUNK_SIZE,
  type PreparationContext
} from '../../rendering/preparation.js';

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
    indices: createHeightfieldIndices(grid.rows, grid.columns)
  };
  compiledTopologies.set(compiled, getHeightfieldTopology(grid));
  return compiled;
}

/** Compiles an already validated grid in bounded tasks and honors generation cancellation. */
export async function prepareHeightfield(
  grid: HeightfieldGrid,
  context: PreparationContext
): Promise<CompiledHeightfield | undefined> {
  if (!(await beginPreparation(context))) return undefined;
  const positions = await preparePositions(grid, context);
  if (!positions) return undefined;
  const normals = await prepareNormals(grid, context);
  if (!normals) return undefined;
  const colors = await prepareColors(grid.colors, context);
  if (colors === undefined) return undefined;
  const indices = await prepareHeightfieldIndices(grid.rows, grid.columns, context);
  if (!indices) return undefined;
  const compiled = { colors, indices, normals, positions };
  compiledTopologies.set(compiled, getHeightfieldTopology(grid));
  return compiled;
}

/**
 * Rebuild mutable heightfield attributes while retaining known-safe topology.
 * Dimensions and spacing must match the previous grid's topology; origin and
 * colors may change and update the returned mesh data.
 */
export function recomputeHeightfield(grid: HeightfieldGrid, previous: CompiledHeightfield): CompiledHeightfield {
  validateHeightfieldGrid(grid);
  if (!hasSameHeightfieldTopology(compiledTopologies.get(previous), grid)) {
    throw new RangeError('Grid topology does not match the previously compiled heightfield.');
  }
  const compiled = {
    positions: createPositions(grid),
    normals: createNormals(grid),
    colors: createColors(grid.colors),
    indices: previous.indices
  };
  compiledTopologies.set(compiled, getHeightfieldTopology(grid));
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

function createPositions(grid: HeightfieldGrid): Float32Array {
  return runPreparationSync(buildPositions(grid, Number.MAX_SAFE_INTEGER));
}

function preparePositions(grid: HeightfieldGrid, context: PreparationContext): Promise<Float32Array | undefined> {
  return resumePreparation(buildPositions(grid), context);
}

function* buildPositions(
  grid: HeightfieldGrid,
  chunkSize = PREPARATION_CHUNK_SIZE
): Generator<void, Float32Array, void> {
  const count = grid.rows * grid.columns;
  const positions = new Float32Array(count * 3);
  for (let start = 0; start < count; start += chunkSize) {
    writePositions(grid, positions, start, Math.min(count, start + chunkSize));
    if (start + chunkSize <= count) yield;
  }
  return positions;
}

// eslint-disable-next-line max-params -- @hotpath Chunk boundaries stay outside the per-sample loop.
function writePositions(grid: HeightfieldGrid, positions: Float32Array, start: number, end: number): void {
  const [originX, originY] = grid.origin ?? [0, 0];
  let column = start % grid.columns;
  let sample = start;
  for (let row = Math.floor(start / grid.columns); row < Math.ceil(end / grid.columns); row += 1) {
    const lastColumn = Math.min(grid.columns, end - row * grid.columns);
    for (; column < lastColumn; column += 1) {
      const offset = sample * 3;
      positions[offset] = originX + column * grid.spacing;
      positions[offset + 1] = originY + row * grid.spacing;
      positions[offset + 2] = grid.heights[sample]!;
      sample += 1;
    }
    column = 0;
  }
}

function createNormals(grid: HeightfieldGrid): Float32Array {
  return runPreparationSync(buildNormals(grid, Number.MAX_SAFE_INTEGER));
}

function prepareNormals(grid: HeightfieldGrid, context: PreparationContext): Promise<Float32Array | undefined> {
  return resumePreparation(buildNormals(grid), context);
}

function* buildNormals(grid: HeightfieldGrid, chunkSize = PREPARATION_CHUNK_SIZE): Generator<void, Float32Array, void> {
  const count = grid.rows * grid.columns;
  const normals = new Float32Array(count * 3);
  const samples: UniformScalarGrid = {
    values: grid.heights,
    columns: grid.columns,
    rows: grid.rows,
    spacing: grid.spacing
  };
  for (let start = 0; start < count; start += chunkSize) {
    writeNormals(samples, normals, start, Math.min(count, start + chunkSize));
    if (start + chunkSize <= count) yield;
  }
  return normals;
}

// eslint-disable-next-line max-params -- @hotpath Chunk boundaries stay outside the per-sample loop.
function writeNormals(samples: UniformScalarGrid, normals: Float32Array, start: number, end: number): void {
  let column = start % samples.columns;
  for (let row = Math.floor(start / samples.columns); row < Math.ceil(end / samples.columns); row += 1) {
    const lastColumn = Math.min(samples.columns, end - row * samples.columns);
    for (; column < lastColumn; column += 1) writeGridNormal(samples, normals, row, column);
    column = 0;
  }
}

function createColors(colors: Uint8Array | undefined): Float32Array | null {
  if (colors === undefined) return null;
  return runPreparationSync(buildColors(colors, Number.MAX_SAFE_INTEGER));
}

function prepareColors(
  colors: Uint8Array | undefined,
  context: PreparationContext
): Promise<Float32Array | null | undefined> {
  return colors === undefined ? Promise.resolve(null) : resumePreparation(buildColors(colors), context);
}

function* buildColors(colors: Uint8Array, chunkSize = PREPARATION_CHUNK_SIZE): Generator<void, Float32Array, void> {
  const normalized = new Float32Array(colors.length);
  for (let start = 0; start < colors.length; start += chunkSize) {
    const end = Math.min(colors.length, start + chunkSize);
    for (let index = start; index < end; index += 1) normalized[index] = colors[index]! / 255;
    if (start + chunkSize <= colors.length) yield;
  }
  return normalized;
}
