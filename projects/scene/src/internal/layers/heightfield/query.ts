// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { PreparedGridSampler, type GridInterpolation } from '../../math/grid-sampling.js';
import type { Vec3 } from '../../math/types.js';
import type { HeightfieldGrid } from './types.js';

/** Adapts one validated, layer-owned grid snapshot without copying its samples. */
export function prepareHeightfieldSampler(grid: HeightfieldGrid): PreparedGridSampler {
  return new PreparedGridSampler(
    { values: grid.heights, columns: grid.columns, rows: grid.rows, spacing: grid.spacing },
    grid.origin
  );
}

/** Returns the bilinear terrain elevation at frame-local xy. */
export function heightAt(sampler: PreparedGridSampler | null, x: number, y: number): number | undefined {
  return sampler?.heightAt(x, y);
}

/** Returns the analytic unit normal of the bilinear terrain surface at frame-local xy. */
export function normalAt(sampler: PreparedGridSampler | null, x: number, y: number): Vec3 | undefined {
  return sampler?.normalAt(x, y);
}

/** Returns terrain inclination in radians from horizontal at frame-local xy. */
export function slopeAt(sampler: PreparedGridSampler | null, x: number, y: number): number | undefined {
  return sampler?.slopeAt(x, y);
}

/** Returns the rendered triangle-surface elevation at frame-local xy. */
export function surfaceHeightAt(sampler: PreparedGridSampler | null, x: number, y: number): number | undefined {
  return sampler?.heightAt(x, y, 'triangle');
}

/** Returns the unit normal of the rendered terrain triangle at frame-local xy. */
export function surfaceNormalAt(sampler: PreparedGridSampler | null, x: number, y: number): Vec3 | undefined {
  return sampler?.normalAt(x, y, 'triangle');
}

/** Returns rendered triangle inclination in radians from horizontal at frame-local xy. */
export function surfaceSlopeAt(sampler: PreparedGridSampler | null, x: number, y: number): number | undefined {
  return sampler?.slopeAt(x, y, 'triangle');
}

/** Copies xyz points and replaces each in-bounds z with terrain height plus lift. */
export function drape(sampler: PreparedGridSampler | null, points: Float32Array, lift = 0): Float32Array {
  return drapeWith({ sampler, points, lift, interpolation: 'bilinear' });
}

/** Copies xyz points and moves in-bounds points to the rendered triangle surface plus lift. */
export function drapeToSurface(sampler: PreparedGridSampler | null, points: Float32Array, lift = 0): Float32Array {
  return drapeWith({ sampler, points, lift, interpolation: 'triangle' });
}

function drapeWith(options: {
  readonly sampler: PreparedGridSampler | null;
  readonly points: Float32Array;
  readonly lift: number;
  readonly interpolation: GridInterpolation;
}): Float32Array {
  const { sampler, points, lift, interpolation } = options;
  if (!(points instanceof Float32Array)) throw new TypeError('points must be a Float32Array.');
  if (points.length % 3 !== 0) throw new RangeError('points must contain xyz triples.');
  if (!Number.isFinite(lift)) throw new RangeError('lift must be finite.');
  const result = new Float32Array(points);
  sampler?.writeHeights(result, { lift, interpolation });
  return result;
}
