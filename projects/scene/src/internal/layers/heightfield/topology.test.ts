// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0
import { describe, expect, it, vi } from 'vitest';
import {
  buildHeightfieldIndices,
  createHeightfieldIndices,
  isHeightfieldTopLeftTriangle,
  prepareHeightfieldIndices
} from './topology.js';
import { PREPARATION_CHUNK_SIZE } from '../../rendering/preparation.js';

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

  it.each([1, 2, 4, 6, 7])('preserves cell order across row splits with a budget of %i', chunkSize => {
    const steps = buildHeightfieldIndices(3, 4, chunkSize);
    let step = steps.next();
    let yields = 0;
    while (!step.done) {
      yields += 1;
      step = steps.next();
    }

    expect(yields).toBe(Math.floor(6 / chunkSize));
    expect([...step.value]).toEqual([
      0, 1, 4, 1, 5, 4, 1, 2, 5, 2, 6, 5, 2, 3, 6, 3, 7, 6, 4, 5, 8, 5, 9, 8, 5, 6, 9, 6, 10, 9, 6, 7, 10, 7, 11, 10
    ]);
  });

  it('yields after an exact final budget and retains the complete topology', async () => {
    const context = { isCurrent: () => true, yield: vi.fn(async () => {}) };
    const columns = PREPARATION_CHUNK_SIZE + 1;

    await expect(prepareHeightfieldIndices(2, columns, context)).resolves.toEqual(createHeightfieldIndices(2, columns));
    expect(context.yield).toHaveBeenCalledTimes(2);
  });

  it.each([0, -1, 1.5, Number.POSITIVE_INFINITY, Number.MAX_SAFE_INTEGER + 1])(
    'rejects an invalid work budget of %s',
    chunkSize => {
      expect(() => buildHeightfieldIndices(3, 4, chunkSize).next()).toThrow(RangeError);
    }
  );
});
