import { describe, expect, it } from 'vitest';
import {
  calculateDomain,
  calculateSymbolIndices,
  calculateViewBox,
  toValidData,
  toInterpolation,
  toAreaPath,
  toColumnRects,
  toLinePath,
  toPlotPoints,
  toWinLossRects,
  valueToY
} from './sparkline.utils.js';

describe('sparkline.utils', () => {
  describe('toValidData', () => {
    it('returns only finite numeric values for array input', () => {
      expect(toValidData([1, 2, Number.NaN, Infinity, 3])).toEqual([1, 2, 3]);
    });

    it('returns an empty array for non-array input', () => {
      expect(toValidData(undefined)).toEqual([]);
      expect(toValidData('[1, 2, 3]')).toEqual([]);
      expect(toValidData({ data: [1, 2, 3] })).toEqual([]);
    });
  });

  describe('calculateViewBox', () => {
    it('calculates dimensions by mark and interval length', () => {
      expect(calculateViewBox('line', 5)).toEqual({ width: 240, height: 100 });
      expect(calculateViewBox('line', 5, 0.9)).toEqual({ width: 360, height: 100 });
      expect(calculateViewBox('line', 5, 1)).toEqual({ width: 400, height: 100 });
      expect(calculateViewBox('line', 5, 0)).toEqual({ width: 240, height: 100 });
      expect(calculateViewBox('column', 3, 2)).toEqual({ width: 180, height: 100 });
      expect(calculateViewBox('area', 5, 2)).toEqual({ width: 240, height: 100 });
      expect(calculateViewBox('winloss', 4, 1)).toEqual({ width: 240, height: 100 });
    });
  });

  describe('calculateDomain', () => {
    it('returns the data min/max by default', () => {
      expect(calculateDomain([10, 20, 15])).toEqual({ min: 10, max: 20 });
    });

    it('includes zero in the domain when includeZero is true', () => {
      expect(calculateDomain([10, 20, 15], undefined, undefined, true)).toEqual({ min: 0, max: 20 });
    });

    it('returns the observed range when data includes negatives', () => {
      expect(calculateDomain([5, -3, 2])).toEqual({ min: -3, max: 5 });
    });

    it('uses explicit min/max overrides even when data exceeds those bounds', () => {
      expect(calculateDomain([-100, 50, 200], -10, 10)).toEqual({ min: -10, max: 10 });
      expect(calculateDomain([5, -3, 2], -10, undefined)).toEqual({ min: -10, max: 5 });
      expect(calculateDomain([5, -3, 2], undefined, 10)).toEqual({ min: -3, max: 10 });
    });
  });

  describe('plot and symbol helpers', () => {
    it('maps values to plot points and handles zero-range values', () => {
      const points = toPlotPoints([5, 5], 5, 5, 120);
      expect(points).toEqual([
        { x: 0, y: 50 },
        { x: 120, y: 50 }
      ]);
      expect(valueToY(5, 5, 5)).toBe(50);
    });

    it('resolves symbol indices for all boolean flag permutations', () => {
      const values = [5, 1, 3, 1];
      const cases = [
        { flags: [false, false, false, false], expected: [] },
        { flags: [true, false, false, false], expected: [0] },
        { flags: [false, true, false, false], expected: [3] },
        { flags: [false, false, true, false], expected: [1, 3] },
        { flags: [false, false, false, true], expected: [0] },
        { flags: [true, true, false, false], expected: [0, 3] },
        { flags: [true, false, true, false], expected: [0, 1, 3] },
        { flags: [true, false, false, true], expected: [0] },
        { flags: [false, true, true, false], expected: [3, 1] },
        { flags: [false, true, false, true], expected: [3, 0] },
        { flags: [false, false, true, true], expected: [0, 1, 3] },
        { flags: [true, true, true, false], expected: [0, 3, 1] },
        { flags: [true, true, false, true], expected: [0, 3] },
        { flags: [true, false, true, true], expected: [0, 1, 3] },
        { flags: [false, true, true, true], expected: [3, 0, 1] },
        { flags: [true, true, true, true], expected: [0, 3, 1] }
      ] as const;

      for (const { flags, expected } of cases) {
        const [denoteFirst, denoteLast, denoteMin, denoteMax] = flags;
        const actual = Array.from(calculateSymbolIndices(values, denoteFirst, denoteLast, denoteMin, denoteMax));
        expect(actual).toEqual(expected);
      }
    });

    it('returns no symbol indices for empty values', () => {
      expect(Array.from(calculateSymbolIndices([], true, true, true, true))).toEqual([]);
    });
  });

  describe('path builders', () => {
    const points = [
      { x: 0, y: 40 },
      { x: 60, y: 20 },
      { x: 120, y: 80 }
    ];

    it('builds single-point and linear line paths', () => {
      expect(toLinePath([{ x: 0, y: 40 }], 'linear', 120)).toBe('M 0 40.00 L 120.00 40.00');
      expect(toLinePath(points, 'linear', 120)).toContain('L 60.00 20.00');
    });

    it('builds step and smooth line paths', () => {
      expect(toLinePath(points, 'step', 120)).toContain('H 60.00 V 20.00');
      expect(toLinePath(points, 'smooth', 120)).toContain('C ');
    });

    it('returns an empty line path for empty points', () => {
      expect(toLinePath([], 'linear', 120)).toBe('');
    });

    it('normalizes interpolation inputs with linear fallback', () => {
      expect(toInterpolation('step')).toBe('step');
      expect(toInterpolation('smooth')).toBe('smooth');
      expect(toInterpolation('linear')).toBe('linear');
      expect(toInterpolation('invalid')).toBe('linear');
      expect(toInterpolation(undefined)).toBe('linear');
    });

    it('builds closed area paths', () => {
      const linearArea = toAreaPath(points, 'linear');
      expect(linearArea).toContain('100.00');
      expect(linearArea.endsWith('Z')).toBe(true);

      const stepArea = toAreaPath(points, 'step');
      expect(stepArea).toContain('H ');
      expect(stepArea).toContain('100.00');
      expect(stepArea.endsWith('Z')).toBe(true);

      const smoothArea = toAreaPath(points, 'smooth');
      expect(smoothArea).toContain('C ');
      expect(smoothArea).toContain('100.00');
      expect(smoothArea.endsWith('Z')).toBe(true);
    });

    it('returns an empty area path for empty points', () => {
      expect(toAreaPath([], 'linear')).toBe('');
    });
  });

  describe('column rect builders', () => {
    it('builds column rects around baseline with expected geometry', () => {
      const rects = toColumnRects(
        [
          { x: 0, y: 25 },
          { x: 60, y: 75 }
        ],
        50,
        120
      );

      expect(rects).toEqual([
        { x: 9, y: 25, width: 42, height: 25 },
        { x: 69, y: 50, width: 42, height: 25 }
      ]);
    });

    it('centers a single column bar with the expected width', () => {
      const [columnRect] = toColumnRects([{ x: 0, y: 25 }], 50, 60);
      expect(columnRect).toEqual({ x: 9, y: 25, width: 42, height: 25 });
    });

    it('returns no rects for empty column inputs', () => {
      expect(toColumnRects([], 50, 120)).toEqual([]);
    });
  });

  describe('winloss rect builders', () => {
    it('builds winloss rects with expected class and geometry', () => {
      const winlossRects = toWinLossRects([1, 0, -1], 50, 180, 100);
      expect(winlossRects).toEqual([
        { className: 'win', x: 4.5, y: 0, width: 51, height: 50 },
        { className: 'draw', x: 64.5, y: 37.5, width: 51, height: 25 },
        { className: 'loss', x: 124.5, y: 50, width: 51, height: 50 }
      ]);
    });

    it('centers a single winloss bar with the expected width', () => {
      const [winlossRect] = toWinLossRects([1], 50, 60, 100);
      expect(winlossRect).toEqual({ className: 'win', x: 4.5, y: 0, width: 51, height: 50 });
    });

    it('returns no rects for empty winloss inputs', () => {
      expect(toWinLossRects([], 50, 120, 100)).toEqual([]);
    });
  });
});
