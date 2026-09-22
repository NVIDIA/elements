// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  beginPreparation,
  continuePreparation,
  PREPARATION_CHUNK_SIZE,
  type PreparationContext
} from '../preparation.js';
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
  const indices = new Uint32Array((rows - 1) * (columns - 1) * 6);
  let offset = 0;
  for (let row = 0; row < rows - 1; row += 1) {
    for (let column = 0; column < columns - 1; column += 1) {
      const topLeft = row * columns + column;
      writeHeightfieldCell(indices, offset, columns, topLeft);
      offset += 6;
    }
  }
  return indices;
}

/** Creates heightfield topology in bounded tasks, or returns undefined after cancellation. */
export async function prepareHeightfieldIndices(
  rows: number,
  columns: number,
  context: PreparationContext
): Promise<Uint32Array | undefined> {
  if (!(await beginPreparation(context))) return undefined;
  const columnCount = columns - 1;
  const cellCount = (rows - 1) * columnCount;
  const indices = new Uint32Array(cellCount * 6);
  for (let cell = 0; cell < cellCount; cell += 1) {
    const row = Math.floor(cell / columnCount);
    const column = cell % columnCount;
    writeHeightfieldCell(indices, cell * 6, columns, row * columns + column);
    if ((cell + 1) % PREPARATION_CHUNK_SIZE === 0 && !(await continuePreparation(context))) return undefined;
  }
  return context.isCurrent() ? indices : undefined;
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
