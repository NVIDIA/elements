// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { GlyphSDFRasterizer } from './glyph-sdf.js';

export interface LabelGlyphMetric {
  readonly height: number;
  readonly u1: number;
  readonly u2: number;
  readonly v1: number;
  readonly v2: number;
  readonly width: number;
  readonly xAdvance: number;
  readonly yOffset: number;
}

export interface LabelFontAtlas {
  readonly data: Uint8Array;
  readonly glyphs: ReadonlyMap<string, LabelGlyphMetric>;
  readonly height: number;
  readonly lineHeight: number;
  readonly replacement: string;
  readonly width: number;
}

interface RawGlyph {
  readonly atlasX: number;
  readonly atlasY: number;
  readonly height: number;
  readonly width: number;
  readonly xAdvance: number;
  readonly yOffset: number;
}

const REPLACEMENT_CHARACTER = '\uFFFD';
const ATLAS_SIZE = 1024;
const FONT_SIZE = 48;
const FONT_BUFFER = Math.ceil(FONT_SIZE / 16);
export const LABEL_REFERENCE_LINE_HEIGHT = 72;

let cachedAtlas: LabelFontAtlas | undefined;

export function getLabelFontAtlas(): LabelFontAtlas {
  cachedAtlas ??= createAtlas();
  return cachedAtlas;
}

function createAtlas(): LabelFontAtlas {
  const rasterizer = new GlyphSDFRasterizer({
    buffer: FONT_BUFFER,
    cutoff: 0.25,
    fontFamily: 'monospace',
    fontSize: FONT_SIZE,
    radius: Math.ceil(FONT_SIZE / 4)
  });
  const data = new Uint8Array(ATLAS_SIZE * ATLAS_SIZE);
  const raw = new Map<string, RawGlyph>();
  const metrics = populateAtlas({ data, rasterizer, raw });
  return {
    data,
    glyphs: scaleGlyphs(raw, metrics),
    height: ATLAS_SIZE,
    lineHeight: LABEL_REFERENCE_LINE_HEIGHT,
    replacement: REPLACEMENT_CHARACTER,
    width: ATLAS_SIZE
  };
}

// eslint-disable-next-line max-statements -- This one-time atlas pack keeps row placement and font metrics together.
function populateAtlas(options: {
  readonly data: Uint8Array;
  readonly rasterizer: GlyphSDFRasterizer;
  readonly raw: Map<string, RawGlyph>;
}): { readonly lineHeight: number; readonly maxAscent: number } {
  let x = 0;
  let y = 0;
  let rowHeight = 0;
  let lineHeight = 0;
  let maxAscent = 0;
  for (const character of atlasCharacters()) {
    const sdf = options.rasterizer.rasterize(character);
    if (x + sdf.width > ATLAS_SIZE) {
      x = 0;
      y += rowHeight;
      rowHeight = 0;
    }
    if (y + sdf.height > ATLAS_SIZE) throw new RangeError('The SDF label atlas exceeded its fixed capacity.');
    copyGlyph(options.data, sdf.data, { height: sdf.height, width: sdf.width, x, y });
    options.raw.set(character, {
      atlasX: x,
      atlasY: y,
      height: sdf.height,
      width: sdf.width,
      xAdvance: Math.max(sdf.advance, sdf.width - FONT_BUFFER),
      yOffset: sdf.top
    });
    rowHeight = Math.max(rowHeight, sdf.height);
    lineHeight = Math.max(lineHeight, sdf.height);
    maxAscent = Math.max(maxAscent, sdf.top);
    x += sdf.width;
  }
  return { lineHeight, maxAscent };
}

function scaleGlyphs(
  raw: ReadonlyMap<string, RawGlyph>,
  metrics: { readonly lineHeight: number; readonly maxAscent: number }
): ReadonlyMap<string, LabelGlyphMetric> {
  const scale = LABEL_REFERENCE_LINE_HEIGHT / metrics.lineHeight;
  const glyphs = new Map<string, LabelGlyphMetric>();
  for (const [character, glyph] of raw) {
    const topOffset = metrics.maxAscent - glyph.yOffset;
    glyphs.set(character, {
      height: glyph.height * scale,
      u1: (glyph.atlasX + 0.5) / ATLAS_SIZE,
      u2: (glyph.atlasX + glyph.width - 0.5) / ATLAS_SIZE,
      v1: (glyph.atlasY + glyph.height - 0.5) / ATLAS_SIZE,
      v2: (glyph.atlasY + 0.5) / ATLAS_SIZE,
      width: glyph.width * scale,
      xAdvance: glyph.xAdvance * scale,
      yOffset: (metrics.lineHeight - topOffset - glyph.height) * scale
    });
  }
  return glyphs;
}

function copyGlyph(
  target: Uint8Array,
  source: Uint8ClampedArray,
  bounds: { readonly height: number; readonly width: number; readonly x: number; readonly y: number }
): void {
  for (let row = 0; row < bounds.height; row += 1) {
    const start = row * bounds.width;
    target.set(source.subarray(start, start + bounds.width), ATLAS_SIZE * (bounds.y + row) + bounds.x);
  }
}

function atlasCharacters(): string {
  let result = REPLACEMENT_CHARACTER;
  for (let codePoint = 32; codePoint <= 126; codePoint += 1) result += String.fromCodePoint(codePoint);
  return result;
}
