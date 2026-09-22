// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { writeGridNormal, type UniformScalarGrid } from './grid-gradient.js';

describe('uniform grid differences', () => {
  it.each([
    { rows: 2, columns: 2 },
    { rows: 3, columns: 5 },
    { rows: 7, columns: 4 }
  ])('uses one-sided boundaries and central interior differences for $rows by $columns planes', ({ rows, columns }) => {
    const spacing = 0.5;
    const values = Float32Array.from(
      { length: rows * columns },
      (_, index) => 2 * (index % columns) * spacing - 3 * Math.floor(index / columns) * spacing + 7
    );
    const grid = { values, rows, columns, spacing };
    const before = values.slice();
    const normals = calculateNormals(grid);
    const length = Math.sqrt(14);
    for (let index = 0; index < values.length; index += 1) {
      expect(Array.from(normals.subarray(index * 3, index * 3 + 3))).toEqual(
        Array.from(new Float32Array([-2 / length, 3 / length, 1 / length]))
      );
    }
    expect(values).toEqual(before);
  });

  it('uses the quadratic derivative inside and the secant slope at every boundary', () => {
    const columns = 5;
    const rows = 4;
    const values = Float32Array.from(
      { length: rows * columns },
      (_, index) => (index % columns) ** 2 + Math.floor(index / columns) ** 2
    );
    const normals = calculateNormals({ values, rows, columns, spacing: 1 });
    for (let index = 0; index < values.length; index += 1) {
      const column = index % columns;
      const row = Math.floor(index / columns);
      const dx = column === 0 ? 1 : column === columns - 1 ? 2 * column - 1 : 2 * column;
      const dy = row === 0 ? 1 : row === rows - 1 ? 2 * row - 1 : 2 * row;
      const inverse = 1 / Math.hypot(dx, dy, 1);
      expect(normals.subarray(index * 3, index * 3 + 3)).toEqual(
        new Float32Array([-dx * inverse, -dy * inverse, inverse])
      );
    }
  });

  it('writes only the selected sample and preserves flat-surface signed zeros', () => {
    const grid = { values: new Float32Array(4), rows: 2, columns: 2, spacing: 1 };
    const normals = new Float32Array(12).fill(99);
    writeGridNormal(grid, normals, 1, 0);
    expect(normals).toEqual(new Float32Array([99, 99, 99, 99, 99, 99, -0, -0, 1, 99, 99, 99]));
  });
});

function calculateNormals(grid: UniformScalarGrid): Float32Array {
  const normals = new Float32Array(grid.values.length * 3);
  for (let row = 0; row < grid.rows; row += 1) {
    for (let column = 0; column < grid.columns; column += 1) writeGridNormal(grid, normals, row, column);
  }
  return normals;
}
