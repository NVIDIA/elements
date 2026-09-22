// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { LINE_VERTEX } from '../internal/layouts/built-ins.js';
import { readLineVertex } from '../internal/layouts/helpers.js';
import { AXES_VERTEX_COUNT, createAxesVertices } from './utils.js';

describe('createAxesVertices', () => {
  it.each([
    [
      'positive',
      1,
      [
        [0, 0, 0],
        [1, 0, 0],
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0],
        [0, 0, 1]
      ]
    ],
    [
      'positive',
      2.5,
      [
        [0, 0, 0],
        [2.5, 0, 0],
        [0, 0, 0],
        [0, 2.5, 0],
        [0, 0, 0],
        [0, 0, 2.5]
      ]
    ],
    [
      'bidirectional',
      2,
      [
        [-2, 0, 0],
        [2, 0, 0],
        [0, -2, 0],
        [0, 2, 0],
        [0, 0, -2],
        [0, 0, 2]
      ]
    ]
  ] as const)('writes the exact %s axis records for length %s', (direction, length, positions) => {
    const bytes = createAxesVertices({ direction, length, width: 3 });

    expect(bytes).toHaveLength(LINE_VERTEX.stride * AXES_VERTEX_COUNT);
    const records = Array.from({ length: AXES_VERTEX_COUNT }, (_, index) => readLineVertex(bytes, index));
    expect(records.map(record => record.position)).toEqual(positions);
    expect(records.map(record => record.color)).toEqual([
      [229 / 255, 57 / 255, 53 / 255, 1],
      [229 / 255, 57 / 255, 53 / 255, 1],
      [67 / 255, 160 / 255, 71 / 255, 1],
      [67 / 255, 160 / 255, 71 / 255, 1],
      [30 / 255, 136 / 255, 229 / 255, 1],
      [30 / 255, 136 / 255, 229 / 255, 1]
    ]);
    expect(records.every(record => record.width === 3)).toBe(true);
  });
});
