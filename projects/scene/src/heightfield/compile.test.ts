// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { compileHeightfield, recomputeHeightfield, validateHeightfieldGrid } from './compile.js';
import type { HeightfieldGrid } from './heightfield-types.js';

describe('heightfield compilation', () => {
  it('writes exact row-major positions and the fixed CCW topology', () => {
    const compiled = compileHeightfield({
      origin: [10, 20],
      spacing: 0.5,
      columns: 3,
      rows: 3,
      heights: new Float32Array([0, 1, 2, 3, 4, 5, 6, 7, 8])
    });

    expect([...compiled.positions]).toEqual([
      10, 20, 0, 10.5, 20, 1, 11, 20, 2, 10, 20.5, 3, 10.5, 20.5, 4, 11, 20.5, 5, 10, 21, 6, 10.5, 21, 7, 11, 21, 8
    ]);
    expect([...compiled.indices]).toEqual([0, 1, 3, 1, 4, 3, 1, 2, 4, 2, 5, 4, 3, 4, 6, 4, 7, 6, 4, 5, 7, 5, 8, 7]);
  });

  it('computes central and one-sided smooth normals for a sampled plane', () => {
    const grid = gridFrom(3, 3, (row, column) => 2 * column - 3 * row + 5);
    const normal = [-2 / Math.sqrt(14), 3 / Math.sqrt(14), 1 / Math.sqrt(14)];
    const compiled = compileHeightfield(grid);

    for (let offset = 0; offset < compiled.normals.length; offset += 3) {
      expectCloseArray(compiled.normals.subarray(offset, offset + 3), normal, 6);
    }
  });

  it('computes analytic interior normals for a sampled paraboloid', () => {
    const grid = gridFrom(5, 5, (row, column) => column * column + row * row);
    const compiled = compileHeightfield(grid);
    const offset = (2 * grid.columns + 3) * 3;
    const expected = normalize(-6, -4, 1);

    expectCloseArray(compiled.normals.subarray(offset, offset + 3), expected, 3);
  });

  it('uses counter-clockwise winding when viewed from positive z', () => {
    const compiled = compileHeightfield(gridFrom(3, 3, () => 0));

    for (let offset = 0; offset < compiled.indices.length; offset += 3) {
      const a = compiled.indices[offset]! * 3;
      const b = compiled.indices[offset + 1]! * 3;
      const c = compiled.indices[offset + 2]! * 3;
      const abX = compiled.positions[b]! - compiled.positions[a]!;
      const abY = compiled.positions[b + 1]! - compiled.positions[a + 1]!;
      const acX = compiled.positions[c]! - compiled.positions[a]!;
      const acY = compiled.positions[c + 1]! - compiled.positions[a + 1]!;
      expect(abX * acY - abY * acX).toBeGreaterThan(0);
    }
  });

  it('updates positions, normals, and colors while reusing prior topology', () => {
    const initial = withColors(
      gridFrom(3, 2, (row, column) => row + column),
      [0, 64, 128, 255]
    );
    const previous = compileHeightfield(initial);
    const updated: HeightfieldGrid = {
      ...initial,
      origin: [5, -2],
      heights: new Float32Array([0, 1, 4, 9, 16, 25]),
      colors: new Uint8Array([255, 128, 64, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20])
    };
    const recomputed = recomputeHeightfield(updated, previous);
    const full = compileHeightfield(updated);

    expect(recomputed.indices).toBe(previous.indices);
    expect([...recomputed.positions]).toEqual([...full.positions]);
    expect([...recomputed.normals]).toEqual([...full.normals]);
    expect([...recomputed.colors!]).toEqual([...full.colors!]);
    expect(recomputed.colors).not.toBe(previous.colors);
  });

  it('rejects invalid grid shapes, values, and unsafe allocation dimensions', () => {
    const grid = gridFrom(2, 2, () => 0);
    expect(() => validateHeightfieldGrid({ ...grid, spacing: 0 })).toThrow(RangeError);
    expect(() => validateHeightfieldGrid({ ...grid, rows: 1 })).toThrow(RangeError);
    expect(() => validateHeightfieldGrid({ ...grid, columns: 2.5 })).toThrow(RangeError);
    expect(() => validateHeightfieldGrid({ ...grid, heights: new Float32Array(3) })).toThrow(RangeError);
    expect(() => validateHeightfieldGrid({ ...grid, heights: new Float32Array([0, 0, Number.NaN, 0]) })).toThrow(
      RangeError
    );
    expect(() => validateHeightfieldGrid({ ...grid, origin: [0, Number.POSITIVE_INFINITY] })).toThrow(RangeError);
    expect(() => validateHeightfieldGrid({ ...grid, colors: new Uint8Array(3) })).toThrow(RangeError);
    expect(() => validateHeightfieldGrid({ ...grid, rows: Number.MAX_SAFE_INTEGER, columns: 2 })).toThrow(RangeError);
    expect(() => validateHeightfieldGrid({ ...grid, rows: 10_000, columns: 10_000 })).toThrow(
      'heightfield allocation limit'
    );
    expect(() =>
      recomputeHeightfield(
        gridFrom(2, 3, () => 0),
        compileHeightfield(grid)
      )
    ).toThrow(RangeError);
    expect(() =>
      recomputeHeightfield(
        gridFrom(3, 2, () => 0),
        compileHeightfield(gridFrom(2, 3, () => 0))
      )
    ).toThrow(RangeError);
    expect(() => recomputeHeightfield(grid, { ...compileHeightfield(grid) })).toThrow(RangeError);
  });
});

function gridFrom(rows: number, columns: number, height: (row: number, column: number) => number): HeightfieldGrid {
  const heights = new Float32Array(rows * columns);
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) heights[row * columns + column] = height(row, column);
  }
  return { spacing: 1, columns, rows, heights };
}

function withColors(grid: HeightfieldGrid, color: readonly [number, number, number, number]): HeightfieldGrid {
  const colors = new Uint8Array(grid.rows * grid.columns * 4);
  for (let offset = 0; offset < colors.length; offset += 4) colors.set(color, offset);
  return { ...grid, colors };
}

function normalize(x: number, y: number, z: number): [number, number, number] {
  const inverseLength = 1 / Math.hypot(x, y, z);
  return [x * inverseLength, y * inverseLength, z * inverseLength];
}

function expectCloseArray(actual: ArrayLike<number>, expected: readonly number[], precision: number): void {
  for (let index = 0; index < expected.length; index += 1) {
    expect(actual[index]).toBeCloseTo(expected[index]!, precision);
  }
}
