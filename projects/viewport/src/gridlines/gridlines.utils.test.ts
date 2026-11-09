// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { createGridlineCoverage, gridlineCoverageNeedsUpdate, selectGridlineInterval } from './gridlines.utils.js';

describe('selectGridlineInterval', () => {
  it.each([
    [1, 10],
    [2, 5],
    [0.5, 20],
    [0.1, 100]
  ])('selects a step multiple at scale %s', (scale, expected) => {
    expect(selectGridlineInterval({ scale, step: 1, targetSpacing: 10 })).toBe(expected);
  });

  it('retains an integral interval within the spacing guard, including its boundaries', () => {
    for (const scale of [0.5, 1, 1.5]) {
      expect(selectGridlineInterval({ current: 10, scale, step: 2, targetSpacing: 10 })).toBe(10);
    }
    expect(selectGridlineInterval({ current: 10, scale: 2, step: 2, targetSpacing: 10 })).toBe(4);
  });

  it('rejects intervals that are not integral multiples and handles extreme zoom', () => {
    expect(selectGridlineInterval({ current: 3, scale: 1, step: 2, targetSpacing: 10 })).toBe(10);
    expect(selectGridlineInterval({ scale: 0, step: 1, targetSpacing: 10 })).toBe(Number.MAX_VALUE);
    expect(selectGridlineInterval({ scale: 100, step: 2, targetSpacing: 10 })).toBe(2);
  });
});

describe('gridline coverage', () => {
  const visible = { x: 10, y: 20, width: 100, height: 50 };
  it('overscans in both directions without changing the input', () => {
    expect(createGridlineCoverage(visible)).toEqual({ x: -90, y: -30, width: 300, height: 150 });
    expect(visible).toEqual({ x: 10, y: 20, width: 100, height: 50 });
  });

  it('reuses coverage until the visible rectangle approaches an edge', () => {
    const coverage = createGridlineCoverage(visible);
    expect(gridlineCoverageNeedsUpdate(undefined, visible)).toBe(true);
    expect(gridlineCoverageNeedsUpdate(coverage, visible)).toBe(false);
    for (const delta of [{ x: -80 }, { x: 100 }, { y: -20 }, { y: 70 }, { width: 300 }, { height: 150 }]) {
      expect(gridlineCoverageNeedsUpdate(coverage, { ...visible, ...delta })).toBe(true);
    }
  });
});
