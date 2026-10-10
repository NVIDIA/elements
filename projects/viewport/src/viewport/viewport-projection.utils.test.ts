// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { anchoredTransform, centeredScaleTransform, contentPointFromViewport } from './viewport-projection.utils.js';

describe('contentPointFromViewport', () => {
  it('converts signed viewport coordinates through translation and scale', () => {
    expect(contentPointFromViewport(-30, 50, { scale: 2, x: 10, y: -20 })).toEqual({ x: -5, y: 5 });
  });
});

describe('anchoredTransform', () => {
  it('positions an anchor at the requested viewport point and scale', () => {
    const anchor = { x: -12, y: 35 };
    const viewport = { x: 80, y: -30 };
    const transform = anchoredTransform(anchor, viewport, 2.5);

    expect(transform).toEqual({ scale: 2.5, x: -44, y: 47 });
    expect(contentPointFromViewport(viewport.x, viewport.y, transform)).toEqual(anchor);
  });
});

describe('centeredScaleTransform', () => {
  it('preserves the content point beneath the center while changing scale', () => {
    const transform = { scale: 2, x: 10, y: -20 };
    const viewport = { x: 150, y: 60 };
    const result = centeredScaleTransform(4, transform, { height: 120, width: 300 });

    expect(result).toEqual({ scale: 4, x: 47.5, y: -5 });
    expect(contentPointFromViewport(viewport.x, viewport.y, result)).toEqual(
      contentPointFromViewport(viewport.x, viewport.y, transform)
    );
  });

  it('returns an equivalent transform when the scale is unchanged', () => {
    const transform = { scale: 2, x: 10, y: -20 };

    expect(centeredScaleTransform(transform.scale, transform, { height: 120, width: 300 })).toEqual(transform);
  });
});
