// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { LINE_VERTEX } from '../internal/layouts/built-ins.js';
import { readLineVertex } from '../internal/layouts/helpers.js';
import { createGridVertices, gridVertexCount, MAX_GRID_COUNT } from './utils.js';

describe('createGridVertices', () => {
  it('writes the exact X-then-Y segments for count two and half-meter spacing', () => {
    // These fractions map exactly to unorm8 channels, avoiding a raw-float
    // expectation that would differ after vertex packing.
    const color = [64 / 255, 128 / 255, 191 / 255, 1] as const;
    const bytes = createGridVertices({ color: [...color], count: 2, spacing: 0.5, width: 1 });

    expect(bytes).toHaveLength(LINE_VERTEX.stride * 20);
    const records = Array.from({ length: 20 }, (_, index) => readLineVertex(bytes, index));
    expect(records.map(record => record.position)).toEqual([
      [-1, -1, 0],
      [1, -1, 0],
      [-1, -0.5, 0],
      [1, -0.5, 0],
      [-1, 0, 0],
      [1, 0, 0],
      [-1, 0.5, 0],
      [1, 0.5, 0],
      [-1, 1, 0],
      [1, 1, 0],
      [-1, -1, 0],
      [-1, 1, 0],
      [-0.5, -1, 0],
      [-0.5, 1, 0],
      [0, -1, 0],
      [0, 1, 0],
      [0.5, -1, 0],
      [0.5, 1, 0],
      [1, -1, 0],
      [1, 1, 0]
    ]);
    expect(records.every(record => record.width === 1 && record.color.every((value, i) => value === color[i]))).toBe(
      true
    );
  });

  it.each([1, 10])('uses the documented vertex-count formula for count %i', count => {
    expect(createGridVertices({ color: [1, 1, 1, 1], count, spacing: 1, width: 1 })).toHaveLength(
      LINE_VERTEX.stride * gridVertexCount(count)
    );
  });

  it('accepts the allocation boundary and rejects inputs beyond it', () => {
    expect(createGridVertices({ color: [1, 1, 1, 1], count: MAX_GRID_COUNT, spacing: 1, width: 1 })).toHaveLength(
      LINE_VERTEX.stride * gridVertexCount(MAX_GRID_COUNT)
    );
    expect(() => createGridVertices({ color: [1, 1, 1, 1], count: MAX_GRID_COUNT + 1, spacing: 1, width: 1 })).toThrow(
      RangeError
    );
    expect(() => createGridVertices({ color: [1, 1, 1, 1], count: 2, spacing: Number.MAX_VALUE, width: 1 })).toThrow(
      RangeError
    );
  });
});
