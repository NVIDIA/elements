// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { getLabelFontAtlas, LABEL_REFERENCE_LINE_HEIGHT } from './atlas.js';

describe(getLabelFontAtlas.name, () => {
  it('builds and caches the printable ASCII atlas with replacement coverage', () => {
    const atlas = getLabelFontAtlas();

    expect(atlas).toBe(getLabelFontAtlas());
    expect(atlas.width).toBe(1024);
    expect(atlas.height).toBe(1024);
    expect(atlas.lineHeight).toBe(LABEL_REFERENCE_LINE_HEIGHT);
    expect(atlas.replacement).toBe('\uFFFD');
    expect(atlas.glyphs).toHaveLength(96);
    expect(atlas.glyphs.has(' ')).toBe(true);
    expect(atlas.glyphs.has('~')).toBe(true);
    expect(atlas.glyphs.has(atlas.replacement)).toBe(true);
    expect(atlas.data.some(value => value > 0)).toBe(true);
    for (const glyph of atlas.glyphs.values()) {
      expect(Object.values(glyph).every(Number.isFinite)).toBe(true);
      expect(glyph.xAdvance).toBeGreaterThan(0);
    }
  }, 10_000);
});
