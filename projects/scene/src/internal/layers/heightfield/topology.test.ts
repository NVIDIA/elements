// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it, vi } from 'vitest';
import { createHeightfieldIndices, isHeightfieldTopLeftTriangle, prepareHeightfieldIndices } from './topology.js';

describe('heightfield topology', () => {
  it('connects neighboring rectangular cells with consistent winding and shared diagonals', () => {
    expect([...createHeightfieldIndices(2, 3)]).toEqual([0, 1, 3, 1, 4, 3, 1, 2, 4, 2, 5, 4]);
    expect(createHeightfieldIndices(1, 3)).toHaveLength(0);
    expect(isHeightfieldTopLeftTriangle(0.5, 0.5)).toBe(true);
    expect(isHeightfieldTopLeftTriangle(0.6, 0.5)).toBe(false);
  });

  it('matches synchronous topology and stops obsolete work before allocating its result', async () => {
    const context = { isCurrent: () => true, yield: vi.fn(async () => {}) };
    await expect(prepareHeightfieldIndices(3, 4, context)).resolves.toEqual(createHeightfieldIndices(3, 4));
    await expect(prepareHeightfieldIndices(3, 4, { ...context, isCurrent: () => false })).resolves.toBeUndefined();
  });

  it('checks cancellation between chunks for a large grid', async () => {
    let yields = 0;
    const context = {
      isCurrent: () => yields < 2,
      yield: async () => {
        yields += 1;
      }
    };
    await expect(prepareHeightfieldIndices(130, 130, context)).resolves.toBeUndefined();
    expect(yields).toBe(2);
  });
});
