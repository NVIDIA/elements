// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { contentBoundsFromClientRects, revealTarget } from './viewport-fitting.utils.js';

describe('contentBoundsFromClientRects', () => {
  it('converts a client rectangle through the viewport frame, translation, and scale', () => {
    const bounds = contentBoundsFromClientRects(
      [{ height: 100, left: 140, top: 90, width: 200 }],
      { left: 100, top: 50 },
      { scale: 2, x: 10, y: -5 }
    );

    expect(bounds).toEqual({ height: 50, width: 100, x: 30, y: 15 });
  });

  it('unions multiple client rectangles in one content-space result', () => {
    const bounds = contentBoundsFromClientRects(
      [
        { height: 40, left: 120, top: 80, width: 80 },
        { height: 80, left: 80, top: 120, width: 160 }
      ],
      { left: 100, top: 50 },
      { scale: 2, x: 10, y: -5 }
    );

    expect(bounds).toEqual({ height: 60, width: 80, x: 0, y: 10 });
  });

  it('returns undefined for empty or entirely unmeasurable input', () => {
    expect(contentBoundsFromClientRects([], { left: 0, top: 0 }, { scale: 1, x: 0, y: 0 })).toBeUndefined();
    expect(
      contentBoundsFromClientRects(
        [
          { height: 10, left: 0, top: 0, width: 0 },
          { height: 0, left: 0, top: 0, width: 10 },
          { height: 10, left: 0, top: 0, width: -10 }
        ],
        { left: 0, top: 0 },
        { scale: 1, x: 0, y: 0 }
      )
    ).toBeUndefined();
  });

  it('ignores unmeasurable rectangles while retaining measurable negative content-space bounds', () => {
    const bounds = contentBoundsFromClientRects(
      [
        { height: 0, left: 0, top: 0, width: 20 },
        { height: 40, left: 60, top: 30, width: 80 },
        { height: 20, left: 0, top: 0, width: -10 }
      ],
      { left: 100, top: 50 },
      { scale: 2, x: 0, y: 0 }
    );

    expect(bounds).toEqual({ height: 20, width: 40, x: -20, y: -10 });
  });
});

describe('revealTarget', () => {
  const scaleRange = { max: 4, min: 0.5 };
  const transform = { scale: 2, x: 10, y: 20 };
  const viewport = { height: 300, width: 400 };

  it('reveals a point at the current scale', () => {
    expect(revealTarget({ x: 300, y: 200 }, { options: {}, scaleRange, transform, viewport })).toEqual({
      scale: 2,
      x: 200,
      y: 125
    });
  });

  it('fits a rectangle with a uniform CSS-pixel inset', () => {
    expect(
      revealTarget(
        { height: 100, width: 200, x: 50, y: 25 },
        { options: { inset: 20 }, scaleRange, transform, viewport }
      )
    ).toEqual({ scale: 1.8, x: 150 - 200 / 1.8, y: 75 - 150 / 1.8 });
  });

  it('uses an explicit scale and clamps requested scales to the configured range', () => {
    const region = { height: 100, width: 200, x: 50, y: 25 };

    expect(revealTarget(region, { options: { scale: 3 }, scaleRange, transform, viewport })).toEqual({
      scale: 3,
      x: 150 - 400 / 6,
      y: 75 - 300 / 6
    });
    expect(revealTarget(region, { options: { scale: 10 }, scaleRange, transform, viewport }).scale).toBe(4);
    expect(revealTarget(region, { options: { scale: 0.1 }, scaleRange, transform, viewport }).scale).toBe(0.5);
  });

  it('uses established fallbacks for invalid or nonfinite geometry inputs', () => {
    expect(
      revealTarget(
        { height: Number.NaN, width: Number.POSITIVE_INFINITY, x: Number.NaN, y: Number.POSITIVE_INFINITY },
        { options: { inset: Number.NaN, scale: Number.NaN }, scaleRange, transform, viewport }
      )
    ).toEqual({ scale: 0.5, x: -400, y: -300 });
  });

  it('retains the current scale when an inset leaves no available viewport area', () => {
    expect(
      revealTarget(
        { height: 100, width: 100, x: 0, y: 0 },
        { options: { inset: 20 }, scaleRange, transform, viewport: { height: 40, width: 40 } }
      )
    ).toEqual({ scale: 2, x: 40, y: 40 });
  });
});
