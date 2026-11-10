// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, describe, expect, it, vi } from 'vitest';
import { GlyphSDFRasterizer } from './glyph-sdf.js';

describe('glyph signed-distance fields', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates a symmetric exact distance field around an opaque pixel', () => {
    const field = rasterizeAlpha(new Uint8ClampedArray([0, 0, 0, 0, 255, 0, 0, 0, 0]), {
      cutoff: 0.25,
      height: 3,
      radius: 2,
      width: 3
    });

    expect([...field]).toEqual([11, 64, 11, 64, 255, 64, 11, 64, 11]);
  });

  it('preserves antialiased edge coverage and clamps empty or full fields', () => {
    expect(rasterizeAlpha(new Uint8ClampedArray([128]), fieldOptions())).toEqual(new Uint8ClampedArray([192]));
    expect(rasterizeAlpha(new Uint8ClampedArray([0]), fieldOptions())).toEqual(new Uint8ClampedArray([0]));
    expect(rasterizeAlpha(new Uint8ClampedArray([255]), fieldOptions())).toEqual(new Uint8ClampedArray([255]));
  });

  it('encodes rectangular antialiased fields without changing the source alpha', () => {
    const alpha = new Uint8ClampedArray([0, 64, 128, 192, 255, 0]);
    const original = alpha.slice();
    const field = rasterizeAlpha(alpha, { cutoff: 0.25, height: 2, radius: 2, width: 3 });

    expect([...field]).toEqual([64, 160, 192, 224, 255, 64]);
    expect(alpha).toEqual(original);
    expect(field.buffer).not.toBe(alpha.buffer);
  });

  it('rasterizes visible glyphs deterministically and retains whitespace advance', () => {
    const rasterizer = createRasterizer();
    const first = rasterizer.rasterize('A');
    const second = rasterizer.rasterize('A');
    const space = rasterizer.rasterize(' ');

    expect(first.advance).toBeGreaterThan(0);
    expect(first.top).toBeGreaterThan(0);
    expect(first.width).toBeGreaterThan(6);
    expect(first.height).toBeGreaterThan(6);
    expect(first.data).toHaveLength(first.width * first.height);
    expect(first.data.some(value => value > 191)).toBe(true);
    expect(first.data.some(value => value < 191)).toBe(true);
    expect(second).toEqual(first);
    expect(space.advance).toBeGreaterThan(0);
    expect(space.data.every(value => value === 0)).toBe(true);
  });

  it('reports unavailable Canvas 2D support clearly', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);

    expect(() => createRasterizer()).toThrow('Canvas 2D is required to build the label font atlas.');
  });
});

function createRasterizer(): GlyphSDFRasterizer {
  return new GlyphSDFRasterizer({
    buffer: 3,
    cutoff: 0.25,
    fontFamily: 'monospace',
    fontSize: 48,
    radius: 12
  });
}

function fieldOptions() {
  return { cutoff: 0.25, height: 1, radius: 2, width: 1 };
}

function rasterizeAlpha(
  alpha: Uint8ClampedArray,
  options: { readonly cutoff: number; readonly height: number; readonly radius: number; readonly width: number }
): Uint8ClampedArray {
  const { width, height, radius, cutoff } = options;
  const context = document.createElement('canvas').getContext('2d');
  if (!context) throw new Error('Expected Canvas 2D support.');
  const pixels = context.createImageData(width, height);
  alpha.forEach((value, index) => {
    pixels.data[index * 4 + 3] = value;
  });
  const metrics = context.measureText('A');
  Object.defineProperties(metrics, {
    actualBoundingBoxAscent: { value: height },
    actualBoundingBoxLeft: { value: 0 },
    actualBoundingBoxRight: { value: width }
  });
  vi.spyOn(context, 'measureText').mockReturnValue(metrics);
  vi.spyOn(context, 'getImageData').mockReturnValue(pixels);
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context);
  return new GlyphSDFRasterizer({
    buffer: 0,
    cutoff,
    fontFamily: 'monospace',
    fontSize: Math.max(width, height),
    radius
  }).rasterize('A').data;
}
