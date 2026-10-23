// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, vi } from 'vitest';
import {
  getGridlinesCheckerboard,
  getGridlinesStyleSampler,
  registerGridlinesStyleSampler,
  setGridlinesCheckerboard
} from './gridlines.js';

describe('gridlines state', () => {
  it('keeps style samplers local to each layer and replaces previous registrations', () => {
    const layer = document.createElement('div');
    const other = document.createElement('div');
    const sample = vi.fn();
    const replacement = vi.fn();
    expect(getGridlinesStyleSampler(layer)).toBeUndefined();
    registerGridlinesStyleSampler(layer, sample);
    expect(getGridlinesStyleSampler(layer)).toBe(sample);
    expect(getGridlinesStyleSampler(other)).toBeUndefined();
    expect(sample).not.toHaveBeenCalled();
    registerGridlinesStyleSampler(layer, replacement);
    getGridlinesStyleSampler(layer)?.();
    expect(replacement).toHaveBeenCalledOnce();
    expect(sample).not.toHaveBeenCalled();
  });

  it.each([
    { alpha: 0, alternateAlpha: 0, opaque: false, transparent: false },
    { alpha: 1, alternateAlpha: 1, opaque: true, transparent: false },
    { alpha: 0, alternateAlpha: 1, opaque: true, transparent: true },
    { alpha: 1, alternateAlpha: 0, opaque: true, transparent: true },
    { alpha: 0.25, alternateAlpha: 0.75, opaque: false, transparent: true },
    { alpha: 0, alternateAlpha: 0.5, opaque: false, transparent: true },
    { alpha: 1, alternateAlpha: 0.5, opaque: true, transparent: true }
  ])(
    'classifies checkerboard alpha $alpha and $alternateAlpha into render passes',
    ({ alpha, alternateAlpha, opaque, transparent }) => {
      const layer = document.createElement('div');
      setGridlinesCheckerboard(layer, {
        count: 8,
        color: [1, 0, 0, alpha],
        alternateColor: [0, 0, 1, alternateAlpha]
      });
      expect(getGridlinesCheckerboard(layer)).toEqual({ count: 8, opaque, transparent });
    }
  );

  it('updates and clears checkerboards independently of other layers and samplers', () => {
    const layer = document.createElement('div');
    const other = document.createElement('div');
    const sample = vi.fn();
    const options = {
      count: 4,
      color: [1, 0, 0, 1],
      alternateColor: [0, 0, 0, 0]
    } satisfies Parameters<typeof setGridlinesCheckerboard>[1];
    expect(getGridlinesCheckerboard(layer)).toBeUndefined();
    registerGridlinesStyleSampler(layer, sample);
    setGridlinesCheckerboard(layer, options);
    expect(getGridlinesCheckerboard(other)).toBeUndefined();
    setGridlinesCheckerboard(other, options);
    setGridlinesCheckerboard(layer, { ...options, count: 16 });
    expect(getGridlinesCheckerboard(layer)?.count).toBe(16);
    expect(getGridlinesCheckerboard(other)?.count).toBe(4);
    setGridlinesCheckerboard(layer, undefined);
    expect(getGridlinesCheckerboard(layer)).toBeUndefined();
    expect(getGridlinesCheckerboard(other)?.count).toBe(4);
    expect(getGridlinesStyleSampler(layer)).toBe(sample);
  });
});
