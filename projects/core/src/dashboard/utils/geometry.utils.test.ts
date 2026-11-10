// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import {
  getAnchoredResizeGeometry,
  getDashboardCanvasSize,
  getDashboardPixelPlacement,
  getProjectedControlRect,
  getRevealScrollDelta,
  preservesDashboardResizeAnchors,
  resolveDashboardMetrics
} from './geometry.utils.js';

import type { DashboardResizeEdge } from './geometry.utils.js';

describe('dashboard geometry utilities', () => {
  const input = {
    flow: 'vertical' as const,
    tracks: 6,
    sizing: 'fit' as const,
    width: 1040,
    height: 600,
    columnSize: 160,
    rowSize: 120,
    gap: 16,
    overlap: 0
  };

  it('fits bounded columns while keeping finite row lengths', () => {
    expect(resolveDashboardMetrics(input)).toEqual({
      columnSize: 160,
      rowSize: 120,
      gap: 16,
      width: 1040,
      height: 600
    });
    expect(resolveDashboardMetrics({ ...input, width: 700 })?.columnSize).toBeCloseTo(103.333);
  });

  it('preserves both metrics independently of viewport dimensions', () => {
    expect(resolveDashboardMetrics({ ...input, width: 700, sizing: 'fixed' })?.columnSize).toBe(160);
  });

  it('fits bounded rows for horizontal growth', () => {
    expect(resolveDashboardMetrics({ ...input, flow: 'horizontal', height: 1040 })?.rowSize).toBe(160);
  });

  it('converts spans including internal gaps', () => {
    const metrics = resolveDashboardMetrics(input)!;

    expect(getDashboardPixelPlacement({ column: 1, row: 2, columnSpan: 3, rowSpan: 2 }, metrics)).toEqual({
      inlineStart: 176,
      top: 272,
      width: 512,
      height: 256
    });
  });

  it('rejects zero dimensions, nonfinite metrics, and gaps exceeding available space', () => {
    expect(resolveDashboardMetrics({ ...input, width: 0 })).toBeUndefined();
    expect(resolveDashboardMetrics({ ...input, gap: 1000 })).toBeUndefined();
    expect(resolveDashboardMetrics({ ...input, sizing: 'fixed', rowSize: NaN })).toBeUndefined();
  });

  it('overlaps zero-gap cells while preserving fitted full-span extent and fixed cell size', () => {
    const fit = resolveDashboardMetrics({ ...input, gap: 0, overlap: 3 })!;

    expect(fit.gap).toBe(-3);
    expect(getDashboardPixelPlacement({ column: 0, row: 0, columnSpan: 6, rowSpan: 1 }, fit).width).toBe(1040);

    const fixed = resolveDashboardMetrics({ ...input, gap: 0, overlap: 3, sizing: 'fixed' })!;

    expect(getDashboardPixelPlacement({ column: 0, row: 0, columnSpan: 1, rowSpan: 1 }, fixed)).toMatchObject({
      width: 160,
      height: 120
    });
    expect(getDashboardPixelPlacement({ column: 1, row: 1, columnSpan: 1, rowSpan: 1 }, fixed)).toMatchObject({
      inlineStart: 157,
      top: 117
    });
  });

  it('retains authored positive separation even when border overlap is available', () => {
    expect(resolveDashboardMetrics({ ...input, gap: 0.5, overlap: 3 })?.gap).toBe(0.5);
    expect(resolveDashboardMetrics({ ...input, overlap: 3 })?.gap).toBe(16);
  });

  it('rejects nonpositive pitches and invalid authored overlap rather than producing inverted coordinates', () => {
    expect(resolveDashboardMetrics({ ...input, sizing: 'fixed', columnSize: 1, gap: 0, overlap: 1 })).toBeUndefined();
    expect(resolveDashboardMetrics({ ...input, gap: -1, overlap: 1 })).toBeUndefined();
    expect(resolveDashboardMetrics({ ...input, overlap: NaN })).toBeUndefined();
    expect(resolveDashboardMetrics({ ...input, overlap: -1 })).toBeUndefined();
  });

  it('constrains raw resizing to declared spans and the bounded axis while retaining its initial visual placement', () => {
    const metrics = resolveDashboardMetrics(input)!;
    const source = { column: 4, row: 2, columnSpan: 2, rowSpan: 2 };
    const result = getAnchoredResizeGeometry(
      {
        initialPixelPlacement: { inlineStart: 702, top: 270, width: 336, height: 256 },
        delta: { inline: 664, vertical: -255 },
        edge: 'bottom-right',
        source,
        grid: { flow: 'vertical', tracks: 6 },
        readingDirection: 'ltr' as const,
        limits: { id: 'a', minColumnSpan: 1, minRowSpan: 2, maxColumnSpan: 5, maxRowSpan: 6 }
      },
      metrics
    );

    expect(result.canvasPlacement).toEqual({ inlineStart: 702, top: 270, width: 336, height: 256 });
  });

  it.each([
    ['left', { inline: -176, vertical: 30 }, { column: 1, row: 2, columnSpan: 4, rowSpan: 3 }],
    ['right', { inline: 176, vertical: 30 }, { column: 2, row: 2, columnSpan: 4, rowSpan: 3 }],
    ['top', { inline: 30, vertical: -136 }, { column: 2, row: 1, columnSpan: 3, rowSpan: 4 }],
    ['bottom', { inline: 30, vertical: 136 }, { column: 2, row: 2, columnSpan: 3, rowSpan: 4 }],
    ['bottom-right', { inline: 176, vertical: 136 }, { column: 2, row: 2, columnSpan: 4, rowSpan: 4 }]
  ] satisfies readonly [
    DashboardResizeEdge,
    { inline: number; vertical: number },
    { column: number; row: number; columnSpan: number; rowSpan: number }
  ][])('anchors the opposite boundaries for %s resizing', (edge, delta, expected) => {
    const metrics = resolveDashboardMetrics(input)!;
    const source = { column: 2, row: 2, columnSpan: 3, rowSpan: 3 };
    const initialPixelPlacement = getDashboardPixelPlacement(source, metrics);
    const result = getAnchoredResizeGeometry(
      {
        source,
        initialPixelPlacement,
        delta,
        edge,
        grid: { flow: 'vertical', tracks: 6 },
        readingDirection: 'ltr' as const,
        limits: { id: 'a', minColumnSpan: 1, minRowSpan: 1, maxColumnSpan: 6, maxRowSpan: 6 }
      },
      metrics
    );

    expect(result.geometry).toEqual(expected);
    expect(preservesDashboardResizeAnchors(source, result.geometry, { edge, readingDirection: 'ltr' })).toBe(true);
    expect(result.canvasPlacement).toEqual(getDashboardPixelPlacement(expected, metrics));
  });

  it.each(['left', 'right', 'top', 'bottom', 'bottom-right'] as const)(
    'keeps %s spans independent of visual position during a panel transition',
    edge => {
      const metrics = resolveDashboardMetrics(input)!;
      const source = { column: 2, row: 2, columnSpan: 3, rowSpan: 3 };
      const initialPixelPlacement = { ...getDashboardPixelPlacement(source, metrics), inlineStart: 0, top: 0 };
      const result = getAnchoredResizeGeometry(
        {
          source,
          initialPixelPlacement,
          delta: { inline: 3, vertical: 3 },
          edge,
          grid: { flow: 'vertical', tracks: 6 },
          readingDirection: 'ltr' as const,
          limits: { id: 'a', minColumnSpan: 1, minRowSpan: 1, maxColumnSpan: 6, maxRowSpan: 6 }
        },
        metrics
      );

      expect(result.geometry).toEqual(source);

      if (edge === 'left') {
        expect(result.canvasPlacement.inlineStart + result.canvasPlacement.width).toBe(
          initialPixelPlacement.inlineStart + initialPixelPlacement.width
        );
      }

      if (edge === 'top') {
        expect(result.canvasPlacement.top + result.canvasPlacement.height).toBe(
          initialPixelPlacement.top + initialPixelPlacement.height
        );
      }
    }
  );

  for (const readingDirection of ['ltr', 'rtl'] as const) {
    for (const paintedSpan of [2, 4]) {
      it.each(['left', 'right', 'top', 'bottom', 'bottom-right', 'bottom-left'] as const)(
        `keeps committed spans while painted span ${paintedSpan} lags during %s resizing in ${readingDirection}`,
        edge => {
          const metrics = resolveDashboardMetrics(input)!;
          const source = { column: 2, row: 2, columnSpan: 3, rowSpan: 3 };
          const result = getAnchoredResizeGeometry(
            {
              source,
              initialPixelPlacement: getDashboardPixelPlacement(
                { ...source, columnSpan: paintedSpan, rowSpan: paintedSpan },
                metrics
              ),
              delta: { inline: 3, vertical: 3 },
              edge,
              grid: { flow: 'vertical', tracks: 6 },
              readingDirection,
              limits: { id: 'a', minColumnSpan: 1, minRowSpan: 1, maxColumnSpan: 6, maxRowSpan: 6 }
            },
            metrics
          );

          expect(result.geometry).toEqual(source);
          expect(preservesDashboardResizeAnchors(source, result.geometry, { edge, readingDirection })).toBe(true);
        }
      );
    }
  }

  it.each(['left', 'top'] as const)('clamps the %s boundary without flipping or drifting its opposite edge', edge => {
    const metrics = resolveDashboardMetrics(input)!;
    const source = { column: 2, row: 2, columnSpan: 3, rowSpan: 3 };
    const base = {
      source,
      initialPixelPlacement: getDashboardPixelPlacement(source, metrics),
      edge,
      grid: { flow: 'vertical' as const, tracks: 6 },
      readingDirection: 'ltr' as const,
      limits: { id: 'a', minColumnSpan: 2, minRowSpan: 2, maxColumnSpan: 4, maxRowSpan: 4 }
    };
    const shrink = getAnchoredResizeGeometry({ ...base, delta: { inline: 10000, vertical: 10000 } }, metrics);
    const grow = getAnchoredResizeGeometry({ ...base, delta: { inline: -10000, vertical: -10000 } }, metrics);

    expect(shrink.geometry).toEqual(
      edge === 'left'
        ? { column: 3, row: 2, columnSpan: 2, rowSpan: 3 }
        : { column: 2, row: 3, columnSpan: 3, rowSpan: 2 }
    );
    expect(grow.geometry).toEqual(
      edge === 'left'
        ? { column: 1, row: 2, columnSpan: 4, rowSpan: 3 }
        : { column: 2, row: 1, columnSpan: 3, rowSpan: 4 }
    );
    expect(
      preservesDashboardResizeAnchors(
        source,
        { ...shrink.geometry, column: shrink.geometry.column + 1 },
        { edge, readingDirection: 'ltr' }
      )
    ).toBe(false);
  });

  it('retains the visible growth extent during a gesture without expanding the bounded axis', () => {
    const metrics = resolveDashboardMetrics(input)!;
    const layout = { version: 1 as const, grid: { flow: 'vertical' as const, tracks: 6 }, items: [] };
    const items = [{ column: 0, row: 9, columnSpan: 2, rowSpan: 2 }];

    expect(getDashboardCanvasSize({ layout, metrics, sizing: 'fit', items })).toEqual({ width: 1040, height: 1480 });
    expect(
      getDashboardCanvasSize({ layout, metrics, sizing: 'fit', items, floor: { width: 2000, height: 1616 } })
    ).toEqual({ width: 1040, height: 1616 });
  });

  it('projects a bottom-right control to its settled frame before revealing it', () => {
    const target = getProjectedControlRect(
      {
        current: { x: 100, y: 100, width: 200, height: 150 },
        target: { x: 300, y: 500, width: 240, height: 180 },
        control: { x: 264, y: 202, width: 36, height: 48 }
      },
      { right: true, bottom: true }
    );

    expect(target).toEqual({ x: 504, y: 632, width: 36, height: 48 });
    expect(getRevealScrollDelta(target, { x: 0, y: 0, width: 520, height: 650 })).toEqual({ x: 20, y: 30 });
  });
});
