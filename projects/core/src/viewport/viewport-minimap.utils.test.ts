// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import {
  createViewportMinimapProjection,
  hasPositiveFiniteRect,
  projectViewportMinimapRect
} from './viewport-minimap.utils.js';

describe('viewport minimap projection', () => {
  it('accepts finite coordinates with positive dimensions', () => {
    expect(hasPositiveFiniteRect({ x: -10, y: 20, width: 30, height: 40 })).toBe(true);
  });

  it.each([
    { name: 'NaN', rect: { x: Number.NaN, y: 0, width: 10, height: 10 } },
    { name: 'positive infinity', rect: { x: 0, y: Number.POSITIVE_INFINITY, width: 10, height: 10 } },
    { name: 'negative infinity', rect: { x: Number.NEGATIVE_INFINITY, y: 0, width: 10, height: 10 } },
    { name: 'zero width', rect: { x: 0, y: 0, width: 0, height: 10 } },
    { name: 'zero height', rect: { x: 0, y: 0, width: 10, height: 0 } },
    { name: 'negative width', rect: { x: 0, y: 0, width: -1, height: 10 } },
    { name: 'negative height', rect: { x: 0, y: 0, width: 10, height: -1 } }
  ])('rejects $name', ({ rect }) => {
    expect(hasPositiveFiniteRect(rect)).toBe(false);
  });

  it('includes content bounds and the visible rectangle in its padded extent', () => {
    const projection = createViewportMinimapProjection(
      [{ x: 50, y: 0, width: 50, height: 100 }],
      { x: -100, y: -50, width: 50, height: 25 },
      { width: 200, height: 100 }
    );

    expect(projection?.scale).toBeCloseTo(5 / 9);
  });

  it('centers a uniform projection', () => {
    const projection = createViewportMinimapProjection(
      [{ x: 0, y: 0, width: 800, height: 600 }],
      { x: 0, y: 0, width: 400, height: 300 },
      { width: 192, height: 144 }
    );
    expect(projection).toBeDefined();
    expect(projection?.scale).toBeCloseTo(0.2);
    expect(projectViewportMinimapRect({ x: 0, y: 0, width: 400, height: 300 }, projection!)).toEqual({
      x: 16,
      y: 12,
      width: 80,
      height: 60
    });
  });

  it('expands continuously to keep content and a moving visible rectangle in frame', () => {
    const item = { x: 0, y: 0, width: 800, height: 600 };
    const atEdge = createViewportMinimapProjection(
      [item],
      { x: 400, y: 0, width: 400, height: 300 },
      { width: 192, height: 144 }
    )!;
    const justBeyondEdge = createViewportMinimapProjection(
      [item],
      { x: 401, y: 0, width: 400, height: 300 },
      { width: 192, height: 144 }
    )!;
    const edgeItem = projectViewportMinimapRect(item, atEdge);
    const expandedItem = projectViewportMinimapRect(item, justBeyondEdge);
    const expandedVisible = projectViewportMinimapRect({ x: 401, y: 0, width: 400, height: 300 }, justBeyondEdge);

    expect(edgeItem.width).toBe(160);
    expect(expandedItem.width).toBeLessThan(edgeItem.width);
    expect(edgeItem.width - expandedItem.width).toBeLessThan(1);
    expect(expandedItem.x).toBeGreaterThanOrEqual(0);
    expect(expandedItem.x + expandedItem.width).toBeLessThanOrEqual(192);
    expect(expandedVisible.x).toBeGreaterThanOrEqual(0);
    expect(expandedVisible.x + expandedVisible.width).toBeLessThanOrEqual(192);
  });
});
