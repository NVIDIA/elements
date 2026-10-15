// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { writeGridNormal, type UniformScalarGrid } from './grid-gradient.js';
import { isGridTopLeftTriangle, PreparedGridSampler, type GridInterpolation } from './grid-sampling.js';

const saddle = { values: new Float32Array([0, 0, 0, 4]), columns: 2, rows: 2, spacing: 1 };

describe('prepared uniform grid sampling', () => {
  it('keeps bilinear, triangle, and finite-difference normals distinct, including signed zeros', () => {
    const sampler = new PreparedGridSampler(saddle);
    expect(sampler.heightAt(0.5, 0.5)).toBe(1);
    expect(sampler.heightAt(0.5, 0.5, 'triangle')).toBe(0);
    expect(sampler.heightAt(0.75, 0.75, 'triangle')).toBe(2);
    expect(sampler.normalAt(0.5, 0.5)).toEqual([-2 / 3, -2 / 3, 1 / 3]);
    expect(sampler.normalAt(0.5, 0.5, 'triangle')).toEqual([0, 0, 1]);
    expect(sampler.slopeAt(0.5, 0.5, 'triangle')).toBe(0);
    const normals = new Float32Array(12);
    writeGridNormal(saddle, normals, 0, 0);
    expect([...normals.subarray(0, 3)]).toEqual([-0, -0, 1]);
    const flat = new PreparedGridSampler({ ...saddle, values: new Float32Array(4) });
    expect(flat.normalAt(0, 0)).toEqual([-0, -0, 1]);
    expect(flat.normalAt(0, 0, 'triangle')).toEqual([0, 0, 1]);
    expect(isGridTopLeftTriangle(0.5, 0.5)).toBe(true);
    expect(isGridTopLeftTriangle(0.5 + Number.EPSILON, 0.5)).toBe(false);
  });

  it('captures metadata and origin while borrowing sample storage', () => {
    const grid = { ...saddle, values: saddle.values.slice() };
    const origin: [number, number] = [1e12, -1e12];
    const sampler = new PreparedGridSampler(grid, origin);
    grid.columns = 99;
    grid.rows = 99;
    grid.spacing = 99;
    grid.values[3] = 8;
    grid.values = new Float32Array(4);
    origin[0] = 0;
    expect(sampler.heightAt(1e12 + 1, -1e12 + 1)).toBe(8);
    expect(sampler.heightAt(1e12 + 1.5, -1e12)).toBeUndefined();
    const normal = sampler.normalAt(1e12 + 0.5, -1e12 + 0.5);
    sampler.normalAt(1e12, -1e12, 'triangle');
    const inverseLength = 1 / Math.hypot(4, 4, 1);
    expect(normal).toEqual([-4 * inverseLength, -4 * inverseLength, inverseLength]);
  });

  it.each([0.1, 0.5, 1e-30, 1e30])('matches the original arithmetic at spacing %s on rectangular grids', spacing => {
    const grid = {
      values: Float32Array.from({ length: 35 }, (_, index) => (((index * 193) % 71) - 35) * 1e10),
      columns: 7,
      rows: 5,
      spacing
    };
    const origin: [number, number] = [-3 * spacing, 7 * spacing];
    const sampler = new PreparedGridSampler(grid, origin);
    for (const interpolation of ['bilinear', 'triangle'] as const) {
      for (let index = 0; index < 512; index += 1) {
        const x = origin[0] + (((index * 37) % 49) / 8) * spacing;
        const y = origin[1] + (((index * 19) % 33) / 8) * spacing;
        const reference = referenceSample({ grid, origin, x, y, interpolation });
        expect(sampler.heightAt(x, y, interpolation)).toBe(reference?.height);
        expect(sampler.normalAt(x, y, interpolation)).toEqual(reference?.normal);
        expect(sampler.slopeAt(x, y, interpolation)).toBe(reference?.slope);
      }
    }
  });

  it('excludes nonfinite and outside coordinates without exposing scratch from previous queries', () => {
    const sampler = new PreparedGridSampler(saddle);
    for (const interpolation of ['bilinear', 'triangle'] as const) {
      expect(sampler.heightAt(1, 1, interpolation)).toBe(4);
      for (const value of [Number.NaN, Infinity, -Infinity, -Number.MIN_VALUE, 1 + Number.EPSILON]) {
        expect(sampler.heightAt(value, 0, interpolation)).toBeUndefined();
        expect(sampler.normalAt(0, value, interpolation)).toBeUndefined();
        expect(sampler.slopeAt(value, 0, interpolation)).toBeUndefined();
      }
      expect(sampler.heightAt(0, 0, interpolation)).toBe(0);
    }
  });

  it.each(['bilinear', 'triangle'] as const)(
    'writes %s heights into a subview and preserves all other bits',
    interpolation => {
      const sampler = new PreparedGridSampler(saddle);
      const storage = new Float32Array([777, 0.5, 0.5, 99, 2, 1, -0, NaN, 1, NaN, -0, -0, 99, 888]);
      const bits = new Uint32Array(storage.buffer);
      bits[7] = 0x7fc0_1234;
      bits[9] = 0x7fc0_5678;
      const before = bits.slice();
      const samplesBefore = saddle.values.slice();
      const points = storage.subarray(1, 13);
      sampler.writeHeights(points, { interpolation, lift: 0.25 });
      expect(storage[3]).toBe(interpolation === 'bilinear' ? 1.25 : 0.25);
      expect(storage[12]).toBe(0.25);
      for (let index = 0; index < bits.length; index += 1) {
        if (index !== 3 && index !== 12) expect(bits[index]).toBe(before[index]);
      }
      expect(saddle.values).toEqual(samplesBefore);
      sampler.writeHeights(new Float32Array());
    }
  );

  it('rejects malformed batches and overlapping grid storage before writing', () => {
    const storage = new Float32Array([0, 0, 0, 4, 0.5, 0.5, 99]);
    const values = storage.subarray(0, 4);
    const sampler = new PreparedGridSampler({ ...saddle, values });
    const before = storage.slice();
    expect(() => sampler.writeHeights(storage.subarray(1, 4))).toThrow(RangeError);
    expect(() => sampler.writeHeights(new Float32Array(4))).toThrow(RangeError);
    expect(() => sampler.writeHeights(storage.subarray(4), { lift: Infinity })).toThrow(RangeError);
    expect(() => Reflect.apply(sampler.writeHeights, sampler, [new Float64Array(3)])).toThrow(TypeError);
    expect(storage).toEqual(before);
    sampler.writeHeights(storage.subarray(4));
    expect(storage[6]).toBe(1);
    expect(values).toEqual(before.subarray(0, 4));
    sampler.writeHeights(storage.subarray(1, 1));
  });
});

// Stateless reference preserves the pre-extraction evaluation order and object-returning query behavior.
function referenceSample(options: {
  grid: UniformScalarGrid;
  origin: readonly [number, number];
  x: number;
  y: number;
  interpolation: GridInterpolation;
}): { height: number; normal: number[]; slope: number } | undefined {
  const { grid, origin, x, y, interpolation } = options;
  const localX = (x - origin[0]) / grid.spacing;
  const localY = (y - origin[1]) / grid.spacing;
  if (localX < 0 || localX > grid.columns - 1 || localY < 0 || localY > grid.rows - 1) return undefined;
  const column = Math.min(Math.floor(localX), grid.columns - 2);
  const row = Math.min(Math.floor(localY), grid.rows - 2);
  const u = localX - column;
  const v = localY - row;
  const index = row * grid.columns + column;
  const [a, b, c, d] = [
    grid.values[index]!,
    grid.values[index + 1]!,
    grid.values[index + grid.columns]!,
    grid.values[index + grid.columns + 1]!
  ];
  let height: number, dx: number, dy: number;
  if (interpolation === 'triangle') {
    if (u + v <= 1) {
      height = a + (b - a) * u + (c - a) * v;
      dx = (b - a) / grid.spacing;
      dy = (c - a) / grid.spacing;
    } else {
      height = d + (d - c) * (u - 1) + (d - b) * (v - 1);
      dx = (d - c) / grid.spacing;
      dy = (d - b) / grid.spacing;
    }
  } else {
    const top = a + (b - a) * u;
    const bottom = c + (d - c) * u;
    height = top + (bottom - top) * v;
    dx = ((b - a) * (1 - v) + (d - c) * v) / grid.spacing;
    dy = ((c - a) * (1 - u) + (d - b) * u) / grid.spacing;
  }
  const inverseLength = 1 / Math.hypot(dx, dy, 1);
  return {
    height,
    normal: referenceNormal(dx, dy, interpolation),
    slope: Math.acos(Math.max(-1, Math.min(1, inverseLength)))
  };
}

function referenceNormal(dx: number, dy: number, interpolation: GridInterpolation): number[] {
  const inverseLength = 1 / Math.hypot(dx, dy, 1);
  return [
    interpolation === 'triangle' && dx === 0 ? 0 : -dx * inverseLength,
    interpolation === 'triangle' && dy === 0 ? 0 : -dy * inverseLength,
    inverseLength
  ];
}
