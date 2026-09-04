// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { Vec3 } from '../types.js';
import type { HeightfieldGrid } from './types.js';
import { isHeightfieldTopLeftTriangle } from './topology.js';

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

/** Return the rendered triangle-surface elevation at frame-local xy. Call only with a checked grid. */
export function surfaceHeightAt(grid: HeightfieldGrid | null, x: number, y: number): number | undefined {
  const sample = getTriangleSample(grid, x, y);
  return sample?.height;
}

/** Return the unit normal of the rendered terrain triangle at frame-local xy. */
export function surfaceNormalAt(grid: HeightfieldGrid | null, x: number, y: number): Vec3 | undefined {
  const sample = getTriangleSample(grid, x, y);
  if (!sample) return undefined;
  const inverseLength = 1 / Math.hypot(sample.xSlope, sample.ySlope, 1);
  return [
    sample.xSlope === 0 ? 0 : -sample.xSlope * inverseLength,
    sample.ySlope === 0 ? 0 : -sample.ySlope * inverseLength,
    inverseLength
  ];
}

/** Return rendered triangle inclination in radians from horizontal at frame-local xy. */
export function surfaceSlopeAt(grid: HeightfieldGrid | null, x: number, y: number): number | undefined {
  const normal = surfaceNormalAt(grid, x, y);
  return normal === undefined ? undefined : Math.acos(Math.max(-1, Math.min(1, normal[2])));
}

/** Copy xyz points and replace each in-bounds z with terrain height plus lift. Call only with a checked grid. */
export function drape(grid: HeightfieldGrid | null, points: Float32Array, lift = 0): Float32Array {
  return drapeWith({ sampler: heightAt, grid, points, lift });
}

/** Copy xyz points and move in-bounds points to the rendered triangle surface plus lift. */
export function drapeToSurface(grid: HeightfieldGrid | null, points: Float32Array, lift = 0): Float32Array {
  return drapeWith({ sampler: surfaceHeightAt, grid, points, lift });
}

function drapeWith(options: {
  readonly sampler: (grid: HeightfieldGrid | null, x: number, y: number) => number | undefined;
  readonly grid: HeightfieldGrid | null;
  readonly points: Float32Array;
  readonly lift: number;
}): Float32Array {
  const { sampler, grid, points, lift } = options;
  if (!(points instanceof Float32Array)) throw new TypeError('points must be a Float32Array.');
  if (points.length % 3 !== 0) throw new RangeError('points must contain xyz triples.');
  if (!Number.isFinite(lift)) throw new RangeError('lift must be finite.');
  const result = new Float32Array(points);
  for (let offset = 0; offset < points.length; offset += 3) {
    const height = sampler(grid, points[offset]!, points[offset + 1]!);
    if (height !== undefined) result[offset + 2] = height + lift;
  }
  return result;
}

function getTriangleSample(
  grid: HeightfieldGrid | null,
  x: number,
  y: number
): { readonly height: number; readonly xSlope: number; readonly ySlope: number } | undefined {
  const coordinates = getSurfaceCoordinates(grid, x, y);
  if (coordinates === undefined || grid === null) return undefined;
  const corners = getCellHeights(grid, coordinates);
  const u = coordinates.columnFraction;
  const v = coordinates.rowFraction;
  if (isHeightfieldTopLeftTriangle(u, v)) {
    return {
      height: corners.topLeft + (corners.topRight - corners.topLeft) * u + (corners.bottomLeft - corners.topLeft) * v,
      xSlope: (corners.topRight - corners.topLeft) / grid.spacing,
      ySlope: (corners.bottomLeft - corners.topLeft) / grid.spacing
    };
  }
  return {
    height:
      corners.bottomRight +
      (corners.bottomRight - corners.bottomLeft) * (u - 1) +
      (corners.bottomRight - corners.topRight) * (v - 1),
    xSlope: (corners.bottomRight - corners.bottomLeft) / grid.spacing,
    ySlope: (corners.bottomRight - corners.topRight) / grid.spacing
  };
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
