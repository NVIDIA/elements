// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { clipCue } from './workspace-drag-preview.utils.js';

const rect = { x: 10, y: 20, width: 406, height: 206 };

describe('workspace preview clipping', () => {
  it('clips offers to the visible viewport including an overflowing canvas', () => {
    const bounds = { x: 30, y: 40, width: 100, height: 80 };
    expect(clipCue(rect, bounds)).toEqual(bounds);
    expect(clipCue({ x: 100, y: 100, width: 90, height: 90 }, bounds)).toEqual({
      x: 100,
      y: 100,
      width: 30,
      height: 20
    });
    expect(clipCue({ x: 200, y: 200, width: 90, height: 90 }, bounds)).toEqual({ x: 130, y: 120, width: 0, height: 0 });
  });
});
