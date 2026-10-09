// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  runPreparation,
  runPreparationSync,
  PREPARATION_CHUNK_SIZE,
  type PreparationContext
} from '../../rendering/preparation.js';
import type { HeightfieldGrid } from './types.js';

export interface HeightfieldTopology {
  readonly columns: number;
  readonly rows: number;
  readonly spacing: number;
}

export function getHeightfieldTopology(grid: HeightfieldGrid): HeightfieldTopology {
  return { columns: grid.columns, rows: grid.rows, spacing: grid.spacing };
}

export function hasSameHeightfieldTopology(
  left: HeightfieldTopology | null | undefined,
  right: HeightfieldTopology
): boolean {
  return left?.columns === right.columns && left.rows === right.rows && left.spacing === right.spacing;
}

/** Creates the shared row-major, counter-clockwise index topology for a heightfield grid. */
export function createHeightfieldIndices(rows: number, columns: number): Uint32Array {
  return runPreparationSync(buildHeightfieldIndices(rows, columns, Number.MAX_SAFE_INTEGER));
}

/** Creates heightfield topology in bounded tasks, or returns undefined after cancellation. */
export function prepareHeightfieldIndices(
  rows: number,
  columns: number,
  context: PreparationContext
): Promise<Uint32Array | undefined> {
  return runPreparation(buildHeightfieldIndices(rows, columns), context);
}

/** Builds row-major topology, yielding after each complete cell budget, including the final budget. */
export function* buildHeightfieldIndices(
  rows: number,
  columns: number,
  chunkSize = PREPARATION_CHUNK_SIZE
): Generator<void, Uint32Array, void> {
  if (!Number.isSafeInteger(chunkSize) || chunkSize < 1) {
    throw new RangeError('Heightfield topology chunk size must be a positive safe integer.');
  }
  const columnCount = columns - 1;
  const cellCount = (rows - 1) * columnCount;
  const indices = new Uint32Array(cellCount * 6);
  for (let start = 0; start < cellCount; start += chunkSize) {
    writeHeightfieldCells(indices, columns, start, Math.min(cellCount, start + chunkSize));
    if (start + chunkSize <= cellCount) yield;
  }
  return indices;
}

// eslint-disable-next-line max-params -- @hotpath One range call keeps chunk scheduling outside the per-cell loop.
function writeHeightfieldCells(indices: Uint32Array, columns: number, start: number, end: number): void {
  const columnCount = columns - 1;
  const firstRow = Math.floor(start / columnCount);
  const lastRow = Math.ceil(end / columnCount);
  let column = start % columnCount;
  let offset = start * 6;
  for (let row = firstRow; row < lastRow; row += 1) {
    const lastColumn = Math.min(columnCount, end - row * columnCount);
    for (; column < lastColumn; column += 1) {
      writeHeightfieldCell(indices, offset, columns, row * columns + column);
      offset += 6;
    }
    column = 0;
  }
}

// eslint-disable-next-line max-params -- @hotpath Positional arguments avoid allocating one options object per grid cell.
function writeHeightfieldCell(indices: Uint32Array, offset: number, columns: number, topLeft: number): void {
  const topRight = topLeft + 1;
  const bottomLeft = topLeft + columns;
  const bottomRight = bottomLeft + 1;
  indices[offset] = topLeft;
  indices[offset + 1] = topRight;
  indices[offset + 2] = bottomLeft;
  indices[offset + 3] = topRight;
  indices[offset + 4] = bottomRight;
  indices[offset + 5] = bottomLeft;
}

/** Selects the top-left triangle used by the shared top-right-to-bottom-left cell diagonal. */
export function isHeightfieldTopLeftTriangle(columnFraction: number, rowFraction: number): boolean {
  return columnFraction + rowFraction <= 1;
}
