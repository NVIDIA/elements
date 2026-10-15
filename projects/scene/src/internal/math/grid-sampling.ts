// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { UniformScalarGrid } from './grid-gradient.js';
import type { Vec3 } from './types.js';

export type GridInterpolation = 'bilinear' | 'triangle';

/** Selects the top-left triangle on the top-right-to-bottom-left cell diagonal, including ties. */
export function isGridTopLeftTriangle(columnFraction: number, rowFraction: number): boolean {
  return columnFraction + rowFraction <= 1;
}

/**
 * Captures checked grid dimensions, spacing, and a finite origin, borrowing the row-major sample storage.
 * Queries include the final extent and exclude nonfinite coordinates. Samples must remain valid for this sampler's lifetime.
 * Internal scalar scratch storage avoids temporary coordinate and corner objects during synchronous queries.
 */
export class PreparedGridSampler {
  readonly #values: Float32Array;
  readonly #columns: number;
  readonly #lastColumn: number;
  readonly #lastRow: number;
  readonly #spacing: number;
  readonly #originX: number;
  readonly #originY: number;
  #index = 0;
  #u = 0;
  #v = 0;
  #xSlope = 0;
  #ySlope = 0;

  constructor(grid: UniformScalarGrid, origin?: readonly [number, number]) {
    this.#values = grid.values;
    this.#columns = grid.columns;
    this.#lastColumn = grid.columns - 1;
    this.#lastRow = grid.rows - 1;
    this.#spacing = grid.spacing;
    this.#originX = origin?.[0] ?? 0;
    this.#originY = origin?.[1] ?? 0;
  }

  /** Interpolates a scalar without allocating storage. Triangle mode uses the shared cell diagonal. */
  heightAt(x: number, y: number, interpolation: GridInterpolation = 'bilinear'): number | undefined {
    if (!this.#locate(x, y)) return undefined;
    const values = this.#values;
    const index = this.#index;
    const topLeft = values[index]!;
    const topRight = values[index + 1]!;
    const bottomLeft = values[index + this.#columns]!;
    const bottomRight = values[index + this.#columns + 1]!;
    const u = this.#u;
    const v = this.#v;
    if (interpolation === 'triangle') {
      return isGridTopLeftTriangle(u, v)
        ? topLeft + (topRight - topLeft) * u + (bottomLeft - topLeft) * v
        : bottomRight + (bottomRight - bottomLeft) * (u - 1) + (bottomRight - topRight) * (v - 1);
    }
    const top = topLeft + (topRight - topLeft) * u;
    const bottom = bottomLeft + (bottomRight - bottomLeft) * u;
    return top + (bottom - top) * v;
  }

  /** Returns the analytic upward surface normal, distinct from finite-difference sample shading normals. */
  normalAt(x: number, y: number, interpolation: GridInterpolation = 'bilinear'): Vec3 | undefined {
    if (!this.#locate(x, y)) return undefined;
    this.#slopes(interpolation);
    const xSlope = this.#xSlope;
    const ySlope = this.#ySlope;
    const inverseLength = 1 / Math.hypot(xSlope, ySlope, 1);
    return [
      interpolation === 'triangle' && xSlope === 0 ? 0 : -xSlope * inverseLength,
      interpolation === 'triangle' && ySlope === 0 ? 0 : -ySlope * inverseLength,
      inverseLength
    ];
  }

  /** Returns inclination in radians from horizontal without allocating a normal vector. */
  slopeAt(x: number, y: number, interpolation: GridInterpolation = 'bilinear'): number | undefined {
    if (!this.#locate(x, y)) return undefined;
    this.#slopes(interpolation);
    const inverseLength = 1 / Math.hypot(this.#xSlope, this.#ySlope, 1);
    return Math.acos(Math.max(-1, Math.min(1, inverseLength)));
  }

  /**
   * Replaces in-bounds z values in caller-owned xyz storage, preserving every other bit.
   * Storage must not overlap the borrowed grid samples. Reuses scalar scratch storage throughout the batch.
   */
  writeHeights(
    points: Float32Array,
    options: { readonly interpolation?: GridInterpolation; readonly lift?: number } = {}
  ): void {
    const { interpolation = 'bilinear', lift = 0 } = options;
    assertPointStorage(points, lift, this.#values);
    for (let offset = 0; offset < points.length; offset += 3) {
      const height = this.heightAt(points[offset]!, points[offset + 1]!, interpolation);
      if (height !== undefined) points[offset + 2] = height + lift;
    }
  }

  #locate(x: number, y: number): boolean {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return false;
    // Keep division and subtraction order: reciprocal multiplication can change boundary inclusion.
    const localX = (x - this.#originX) / this.#spacing;
    const localY = (y - this.#originY) / this.#spacing;
    if (localX < 0 || localX > this.#lastColumn || localY < 0 || localY > this.#lastRow) return false;
    const column = Math.min(Math.floor(localX), this.#lastColumn - 1);
    const row = Math.min(Math.floor(localY), this.#lastRow - 1);
    this.#index = row * this.#columns + column;
    this.#u = localX - column;
    this.#v = localY - row;
    return true;
  }

  #slopes(interpolation: GridInterpolation): void {
    const values = this.#values;
    const index = this.#index;
    const topLeft = values[index]!;
    const topRight = values[index + 1]!;
    const bottomLeft = values[index + this.#columns]!;
    const bottomRight = values[index + this.#columns + 1]!;
    const u = this.#u,
      v = this.#v;
    if (interpolation === 'triangle') {
      if (isGridTopLeftTriangle(u, v)) {
        this.#xSlope = (topRight - topLeft) / this.#spacing;
        this.#ySlope = (bottomLeft - topLeft) / this.#spacing;
      } else {
        this.#xSlope = (bottomRight - bottomLeft) / this.#spacing;
        this.#ySlope = (bottomRight - topRight) / this.#spacing;
      }
    } else {
      this.#xSlope = ((topRight - topLeft) * (1 - v) + (bottomRight - bottomLeft) * v) / this.#spacing;
      this.#ySlope = ((bottomLeft - topLeft) * (1 - u) + (bottomRight - topRight) * u) / this.#spacing;
    }
  }
}

function assertPointStorage(points: Float32Array, lift: number, values: Float32Array): void {
  if (!(points instanceof Float32Array)) throw new TypeError('points must be a Float32Array.');
  if (points.length % 3 !== 0) throw new RangeError('points must contain xyz triples.');
  if (!Number.isFinite(lift)) throw new RangeError('lift must be finite.');
  if (
    points.byteLength > 0 &&
    points.buffer === values.buffer &&
    points.byteOffset < values.byteOffset + values.byteLength &&
    values.byteOffset < points.byteOffset + points.byteLength
  ) {
    throw new RangeError('Point storage must not overlap grid samples.');
  }
}
