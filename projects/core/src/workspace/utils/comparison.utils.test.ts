// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';

import { sameArrayItems, sameRect } from './comparison.utils.js';

describe('workspace comparison utilities', () => {
  describe('ordered array items', () => {
    it('accepts the same array and independently created equal arrays', () => {
      const ids = Object.freeze(['a', 'b']);
      expect(sameArrayItems(ids, ids)).toBe(true);
      expect(sameArrayItems(ids, Object.freeze(['a', 'b']))).toBe(true);
      expect(sameArrayItems([], [])).toBe(true);
      expect(sameArrayItems([0.25, 0.75], [0.25, 0.75])).toBe(true);
    });

    it.each([
      { difference: 'order', left: ['a', 'b'], right: ['b', 'a'] },
      { difference: 'length', left: ['a'], right: ['a', 'b'] },
      { difference: 'first item', left: ['a', 'b'], right: ['c', 'b'] },
      { difference: 'last item', left: ['a', 'b'], right: ['a', 'c'] },
      { difference: 'duplicate counts', left: ['a', 'a', 'b'], right: ['a', 'b', 'b'] }
    ])('distinguishes changes in $difference', ({ left, right }) => {
      expect(sameArrayItems(left, right)).toBe(false);
      expect(sameArrayItems(right, left)).toBe(false);
    });

    it('compares numeric items without a tolerance', () => {
      expect(sameArrayItems([0.5, 0.5], [0.5 + 1e-14, 0.5])).toBe(false);
    });

    it('compares object items by reference', () => {
      const item = { id: 'a' };
      expect(sameArrayItems([item], [item])).toBe(true);
      expect(sameArrayItems([item], [{ id: 'a' }])).toBe(false);
    });
  });

  describe('rectangle values', () => {
    const rect = Object.freeze({ x: -12.5, y: 3.25, width: 0.5, height: 0 });

    it('accepts the same rectangle and independently created equal rectangles', () => {
      expect(sameRect(rect, rect)).toBe(true);
      expect(sameRect(rect, Object.freeze({ ...rect }))).toBe(true);
    });

    it.each([
      { field: 'x', change: { x: -10 } },
      { field: 'y', change: { y: 4 } },
      { field: 'width', change: { width: 1 } },
      { field: 'height', change: { height: 1 } }
    ])('distinguishes a changed $field', ({ change }) => {
      expect(sameRect(rect, { ...rect, ...change })).toBe(false);
    });

    it('compares dimensions without a tolerance', () => {
      expect(sameRect(rect, { ...rect, width: rect.width + 1e-14 })).toBe(false);
    });
  });
});
