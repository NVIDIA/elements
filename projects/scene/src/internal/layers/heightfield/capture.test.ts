// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { prepareHeightfieldCapture } from './capture.js';

describe('heightfield capture', () => {
  it('owns the grid data and counts byte alpha values', async () => {
    const origin: [number, number] = [4, 5];
    const heights = new Float32Array([0, 1, 2, 3]);
    const colors = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 128, 0, 0, 0, 255, 0, 0, 0, 255]);
    const captured = await prepareHeightfieldCapture(
      { columns: 2, rows: 2, spacing: 1, origin, heights, colors },
      { isCurrent: () => true, yield: async () => {} }
    );

    origin[0] = 9;
    heights[1] = 9;
    colors[7] = 255;

    expect(captured?.grid.origin).toEqual([4, 5]);
    expect(captured?.grid.heights[1]).toBe(1);
    expect(captured?.grid.colors?.[7]).toBe(128);
    expect(captured?.alphaSummary).toEqual({ zero: 1, partial: 1, opaque: 2 });
  });
});
