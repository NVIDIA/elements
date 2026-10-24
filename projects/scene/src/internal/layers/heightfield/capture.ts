// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { EMPTY_ALPHA_SUMMARY, mergeAlphaSummaries, summarizeRGBAAlpha, type AlphaSummary } from '../../color/alpha.js';
import { copySnapshot } from '../../rendering/capture.js';
import { runPreparation, type PreparationContext } from '../../rendering/preparation.js';
import { validateHeightfieldGridShape, validateHeightfieldHeights } from './compile.js';
import type { HeightfieldGrid } from './types.js';

export interface CapturedHeightfieldGrid {
  readonly grid: HeightfieldGrid;
  readonly alphaSummary: AlphaSummary;
}

/** Validates metadata and allocation bounds before copying any producer data. */
export function readHeightfieldGrid(value: unknown): HeightfieldGrid {
  if (value === null || typeof value !== 'object') throw new RangeError('Grid must be an object.');
  const candidate = value as HeightfieldGrid;
  const grid = {
    columns: candidate.columns,
    rows: candidate.rows,
    spacing: candidate.spacing,
    heights: candidate.heights,
    ...(candidate.colors === undefined ? {} : { colors: candidate.colors }),
    ...(candidate.origin === undefined ? {} : { origin: candidate.origin })
  };
  validateHeightfieldGridShape(grid);
  return grid.origin ? { ...grid, origin: [grid.origin[0], grid.origin[1]] } : grid;
}

export function prepareHeightfieldCapture(
  value: unknown,
  context: PreparationContext
): Promise<CapturedHeightfieldGrid | undefined> {
  return runPreparation(captureGrid(readHeightfieldGrid(value)), context);
}

function* captureGrid(input: HeightfieldGrid): Generator<void, CapturedHeightfieldGrid> {
  const heights = yield* copySnapshot(
    input.heights,
    new Float32Array(input.heights.length),
    validateHeightfieldHeights
  );
  let alphaSummary = EMPTY_ALPHA_SUMMARY;
  let colors: Uint8Array | undefined;
  if (input.colors) {
    yield;
    colors = yield* copySnapshot(input.colors, new Uint8Array(input.colors.length), values => {
      alphaSummary = mergeAlphaSummaries(alphaSummary, summarizeRGBAAlpha(values));
    });
  }
  return { grid: { ...input, heights, ...(colors ? { colors } : {}) }, alphaSummary };
}
