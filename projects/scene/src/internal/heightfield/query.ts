// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Vec3 } from '../types.js';
import type { HeightfieldGrid } from './types.js';

interface SurfaceCoordinates {
  readonly column: number;
  readonly row: number;
  readonly columnFraction: number;
  readonly rowFraction: number;
}

/** Return the bilinearly interpolated terrain elevation at frame-local xy. Call only with a checked grid. */
export function heightAt(grid: HeightfieldGrid | null, x: number, y: number): number | undefined {
  const coordinates = getSurfaceCoordinates(grid, x, y);
  if (coordinates === undefined || grid === null) return undefined;
  const corners = getCellHeights(grid, coordinates);
  return bilinear(corners, coordinates.columnFraction, coordinates.rowFraction);
}

/** Return the unit normal of the bilinear terrain surface at frame-local xy. Call only with a checked grid. */
export function normalAt(grid: HeightfieldGrid | null, x: number, y: number): Vec3 | undefined {
  const coordinates = getSurfaceCoordinates(grid, x, y);
  if (coordinates === undefined || grid === null) return undefined;
  const corners = getCellHeights(grid, coordinates);
  const xSlope =
    ((corners.topRight - corners.topLeft) * (1 - coordinates.rowFraction) +
      (corners.bottomRight - corners.bottomLeft) * coordinates.rowFraction) /
    grid.spacing;
  const ySlope =
    ((corners.bottomLeft - corners.topLeft) * (1 - coordinates.columnFraction) +
      (corners.bottomRight - corners.topRight) * coordinates.columnFraction) /
    grid.spacing;
  const inverseLength = 1 / Math.hypot(xSlope, ySlope, 1);
  return [-xSlope * inverseLength, -ySlope * inverseLength, inverseLength];
}

/** Return terrain inclination in radians from horizontal at frame-local xy. Call only with a checked grid. */
export function slopeAt(grid: HeightfieldGrid | null, x: number, y: number): number | undefined {
  const normal = normalAt(grid, x, y);
  return normal === undefined ? undefined : Math.acos(Math.max(-1, Math.min(1, normal[2])));
}

/** Copy xyz points and replace each in-bounds z with terrain height plus lift. Call only with a checked grid. */
export function drape(grid: HeightfieldGrid | null, points: Float32Array, lift = 0): Float32Array {
  if (!(points instanceof Float32Array)) throw new TypeError('points must be a Float32Array.');
  if (points.length % 3 !== 0) throw new RangeError('points must contain xyz triples.');
  if (!Number.isFinite(lift)) throw new RangeError('lift must be finite.');
  const result = new Float32Array(points);
  for (let offset = 0; offset < points.length; offset += 3) {
    const height = heightAt(grid, points[offset]!, points[offset + 1]!);
    if (height !== undefined) result[offset + 2] = height + lift;
  }
  return result;
}

function getSurfaceCoordinates(grid: HeightfieldGrid | null, x: number, y: number): SurfaceCoordinates | undefined {
  if (grid === null || !Number.isFinite(x) || !Number.isFinite(y)) return undefined;
  const [originX, originY] = grid.origin ?? [0, 0];
  const localX = (x - originX) / grid.spacing;
  const localY = (y - originY) / grid.spacing;
  if (localX < 0 || localX > grid.columns - 1 || localY < 0 || localY > grid.rows - 1) return undefined;
  const column = Math.min(Math.floor(localX), grid.columns - 2);
  const row = Math.min(Math.floor(localY), grid.rows - 2);
  return { column, row, columnFraction: localX - column, rowFraction: localY - row };
}

function getCellHeights(
  grid: HeightfieldGrid,
  coordinates: SurfaceCoordinates
): {
  readonly topLeft: number;
  readonly topRight: number;
  readonly bottomLeft: number;
  readonly bottomRight: number;
} {
  const topLeft = coordinates.row * grid.columns + coordinates.column;
  return {
    topLeft: grid.heights[topLeft]!,
    topRight: grid.heights[topLeft + 1]!,
    bottomLeft: grid.heights[topLeft + grid.columns]!,
    bottomRight: grid.heights[topLeft + grid.columns + 1]!
  };
}

function bilinear(corners: ReturnType<typeof getCellHeights>, columnFraction: number, rowFraction: number): number {
  const top = corners.topLeft + (corners.topRight - corners.topLeft) * columnFraction;
  const bottom = corners.bottomLeft + (corners.bottomRight - corners.bottomLeft) * columnFraction;
  return top + (bottom - top) * rowFraction;
}
