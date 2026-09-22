// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { LabelFontAtlas, LabelGlyphMetric } from '../font/atlas.js';
import {
  beginPreparation,
  continuePreparation,
  PREPARATION_CHUNK_SIZE,
  type PreparationContext
} from '../preparation.js';

export const LABEL_GLYPH_STRIDE = 36;

export interface LabelGlyphRun {
  readonly bytes: Uint8Array;
  readonly offsets: Uint32Array;
}

interface LabelGlyphPreparationOptions {
  readonly atlas: LabelFontAtlas;
  readonly context: PreparationContext;
  readonly count: number;
  readonly texts: readonly string[];
}

interface LabelMetrics {
  readonly offsets: Uint32Array;
  readonly widths: readonly number[] | Float32Array;
}

export function createLabelGlyphRun(texts: readonly string[], count: number, atlas: LabelFontAtlas): LabelGlyphRun {
  const { offsets, widths } = createLabelMetrics(texts, count, atlas);
  const glyphCount = offsets[count] ?? 0;
  const bytes = new Uint8Array(glyphCount * LABEL_GLYPH_STRIDE);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  for (let labelIndex = 0; labelIndex < count; labelIndex += 1) {
    writeLabelGlyphs({
      atlas,
      labelIndex,
      start: offsets[labelIndex] ?? 0,
      text: texts[labelIndex] ?? '',
      textWidth: widths[labelIndex] ?? 0,
      view
    });
  }
  return { bytes, offsets };
}

/** Builds a glyph run in bounded tasks and returns undefined when its generation is obsolete. */
export async function prepareLabelGlyphRun(options: LabelGlyphPreparationOptions): Promise<LabelGlyphRun | undefined> {
  const { context } = options;
  if (!(await beginPreparation(context))) return undefined;
  const metrics = await prepareLabelMetrics(options);
  if (!metrics) return undefined;
  const bytes = await prepareGlyphBytes(options, metrics);
  return bytes && context.isCurrent() ? { bytes, offsets: metrics.offsets } : undefined;
}

// eslint-disable-next-line max-statements -- The loop yields after each bounded code-point chunk.
async function prepareLabelMetrics(options: LabelGlyphPreparationOptions): Promise<LabelMetrics | undefined> {
  const { atlas, context, count, texts } = options;
  const offsets = new Uint32Array(count + 1);
  const widths = new Float32Array(count);
  let work = 0;
  for (let labelIndex = 0; labelIndex < count; labelIndex += 1) {
    let visible = 0;
    let width = 0;
    for (const sourceCharacter of texts[labelIndex] ?? '') {
      const character = normalizedCharacter(sourceCharacter, atlas);
      const glyph = requiredGlyph(character, atlas);
      if (character !== ' ') visible += 1;
      width += glyph.xAdvance;
      work += 1;
      if (work >= PREPARATION_CHUNK_SIZE) {
        work = 0;
        // eslint-disable-next-line max-depth -- Cancellation must follow the yield inside both iteration levels.
        if (!(await continuePreparation(context))) return undefined;
      }
    }
    offsets[labelIndex + 1] = (offsets[labelIndex] ?? 0) + visible;
    widths[labelIndex] = width;
  }
  return { offsets, widths };
}

// eslint-disable-next-line complexity, max-statements -- The loop yields after each bounded code-point chunk.
async function prepareGlyphBytes(
  options: LabelGlyphPreparationOptions,
  metrics: LabelMetrics
): Promise<Uint8Array | undefined> {
  const { atlas, context, count, texts } = options;
  const { offsets, widths } = metrics;
  const glyphCount = offsets[count] ?? 0;
  const bytes = new Uint8Array(glyphCount * LABEL_GLYPH_STRIDE);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let work = 0;
  for (let labelIndex = 0; labelIndex < count; labelIndex += 1) {
    const text = texts[labelIndex] ?? '';
    let cursor = 0;
    let glyphIndex = 0;
    for (const sourceCharacter of text) {
      const character = normalizedCharacter(sourceCharacter, atlas);
      const glyph = requiredGlyph(character, atlas);
      if (character !== ' ') {
        writeGlyph(view, (glyphIndex + (offsets[labelIndex] ?? 0)) * LABEL_GLYPH_STRIDE, {
          glyph,
          labelIndex,
          x: cursor - (widths[labelIndex] ?? 0) * 0.5,
          y: glyph.yOffset - atlas.lineHeight * 0.5
        });
        glyphIndex += 1;
      }
      cursor += glyph.xAdvance;
      work += 1;
      if (work >= PREPARATION_CHUNK_SIZE) {
        work = 0;
        // eslint-disable-next-line max-depth -- Cancellation must follow the yield inside both iteration levels.
        if (!(await continuePreparation(context))) return undefined;
      }
    }
  }
  return context.isCurrent() ? bytes : undefined;
}

function createLabelMetrics(texts: readonly string[], count: number, atlas: LabelFontAtlas): LabelMetrics {
  const offsets = new Uint32Array(count + 1);
  const widths = new Array<number>(count);
  for (let labelIndex = 0; labelIndex < count; labelIndex += 1) {
    let visible = 0;
    let width = 0;
    for (const sourceCharacter of texts[labelIndex] ?? '') {
      const character = normalizedCharacter(sourceCharacter, atlas);
      const glyph = requiredGlyph(character, atlas);
      if (character !== ' ') visible += 1;
      width += glyph.xAdvance;
    }
    offsets[labelIndex + 1] = (offsets[labelIndex] ?? 0) + visible;
    widths[labelIndex] = width;
  }
  return { offsets, widths };
}

function writeLabelGlyphs(options: {
  readonly atlas: LabelFontAtlas;
  readonly labelIndex: number;
  readonly start: number;
  readonly text: string;
  readonly textWidth: number;
  readonly view: DataView;
}): void {
  const { atlas, labelIndex, start, text, textWidth, view } = options;
  let cursor = 0;
  let glyphIndex = 0;
  for (const sourceCharacter of text) {
    const character = normalizedCharacter(sourceCharacter, atlas);
    const glyph = requiredGlyph(character, atlas);
    if (character !== ' ') {
      writeGlyph(view, (glyphIndex + start) * LABEL_GLYPH_STRIDE, {
        glyph,
        labelIndex,
        x: cursor - textWidth * 0.5,
        y: glyph.yOffset - atlas.lineHeight * 0.5
      });
      glyphIndex += 1;
    }
    cursor += glyph.xAdvance;
  }
}

function writeGlyph(
  view: DataView,
  offset: number,
  options: { readonly glyph: LabelGlyphMetric; readonly labelIndex: number; readonly x: number; readonly y: number }
): void {
  const { glyph, labelIndex, x, y } = options;
  view.setUint32(offset, labelIndex, true);
  view.setFloat32(offset + 4, x, true);
  view.setFloat32(offset + 8, y, true);
  view.setFloat32(offset + 12, glyph.width, true);
  view.setFloat32(offset + 16, glyph.height, true);
  view.setFloat32(offset + 20, glyph.u1, true);
  view.setFloat32(offset + 24, glyph.v1, true);
  view.setFloat32(offset + 28, glyph.u2, true);
  view.setFloat32(offset + 32, glyph.v2, true);
}

function normalizedCharacter(character: string, atlas: LabelFontAtlas): string {
  if (character === '\t' || character === '\r' || character === '\n') return ' ';
  return atlas.glyphs.has(character) ? character : atlas.replacement;
}

function requiredGlyph(character: string, atlas: LabelFontAtlas): LabelGlyphMetric {
  const glyph = atlas.glyphs.get(character) ?? atlas.glyphs.get(atlas.replacement);
  if (!glyph) throw new TypeError('The SDF label atlas has no replacement glyph.');
  return glyph;
}
