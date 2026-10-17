// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { contentDirection } from './workspace-rearrange.controller.js';

describe('workspace content drop directions', () => {
  const rect = { x: 10, y: 20, width: 400, height: 236 };

  it('uses directional splits throughout the content, including its center region', () => {
    expect(contentDirection(180, 156, { rect, headerHeight: 36 })).toBe('left');
    expect(contentDirection(240, 156, { rect, headerHeight: 36 })).toBe('right');
    expect(contentDirection(210, 136, { rect, headerHeight: 36 })).toBe('top');
    expect(contentDirection(210, 176, { rect, headerHeight: 36 })).toBe('bottom');
  });

  it('normalizes distance by content dimensions for wide and short panes', () => {
    expect(contentDirection(210, 110, { rect, headerHeight: 36 })).toBe('top');
    expect(contentDirection(230, 190, { rect, headerHeight: 36 })).toBe('bottom');
    expect(contentDirection(40, 170, { rect, headerHeight: 36 })).toBe('left');
  });

  it('keeps all four directions available above a short pane minimum', () => {
    const short = { x: 0, y: 0, width: 400, height: 100 };
    expect(contentDirection(200, 45, { rect: short, headerHeight: 36 })).toBe('top');
    expect(contentDirection(200, 90, { rect: short, headerHeight: 36 })).toBe('bottom');
    expect(contentDirection(30, 68, { rect: short, headerHeight: 36 })).toBe('left');
    expect(contentDirection(370, 68, { rect: short, headerHeight: 36 })).toBe('right');
  });
});
