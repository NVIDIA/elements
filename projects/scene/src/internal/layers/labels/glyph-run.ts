// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { LabelFontAtlas, LabelGlyphMetric } from './font/atlas.js';
import {
  beginPreparation,
  resumePreparation,
  runPreparationSync,
  PREPARATION_CHUNK_SIZE,
  type PreparationContext
} from '../../rendering/preparation.js';

export const LABEL_GLYPH_STRIDE = 36;

export interface LabelGlyphRun {
  readonly bytes: Uint8Array;
  /** Prefix sums delimit each label's glyph range; the final entry holds the total. */
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

interface LabelTextCursor {
  readonly atlas: LabelFontAtlas;
  readonly count: number;
  readonly texts: readonly string[];
  labelIndex: number;
  characterOffset: number;
}

interface LabelMetricCursor extends LabelTextCursor {
  readonly offsets: Uint32Array;
  readonly widths: number[] | Float32Array;
  visible: number;
  width: number;
}

interface LabelGlyphCursor extends LabelTextCursor {
  readonly metrics: LabelMetrics;
  readonly view: DataView;
  cursor: number;
  glyphIndex: number;
}

export function createLabelGlyphRun(texts: readonly string[], count: number, atlas: LabelFontAtlas): LabelGlyphRun {
  const options = { atlas, count, texts };
  const metrics = runPreparationSync(
    buildLabelMetrics({ ...options, chunkSize: Number.MAX_SAFE_INTEGER, widthPrecision: 'number' })
  );
  const bytes = runPreparationSync(buildGlyphBytes(options, metrics, Number.MAX_SAFE_INTEGER));
  return { bytes, offsets: metrics.offsets };
}

/** Builds a glyph run in bounded tasks and returns undefined when its generation is obsolete. */
export async function prepareLabelGlyphRun(options: LabelGlyphPreparationOptions): Promise<LabelGlyphRun | undefined> {
  const { context } = options;
  if (!(await beginPreparation(context))) return undefined;
  const metrics = await resumePreparation(
    buildLabelMetrics({ ...options, chunkSize: PREPARATION_CHUNK_SIZE, widthPrecision: 'float32' }),
    context
  );
  if (!metrics) return undefined;
  const bytes = await resumePreparation(buildGlyphBytes(options, metrics), context);
  return bytes && context.isCurrent() ? { bytes, offsets: metrics.offsets } : undefined;
}

function* buildLabelMetrics(options: {
  readonly atlas: LabelFontAtlas;
  readonly count: number;
  readonly texts: readonly string[];
  readonly chunkSize: number;
  readonly widthPrecision: 'number' | 'float32';
}): Generator<void, LabelMetrics, void> {
  const { atlas, count, texts, chunkSize } = options;
  // Preserve the existing width rounding of each caller before packing glyph coordinates.
  const state: LabelMetricCursor = {
    atlas,
    count,
    texts,
    labelIndex: 0,
    characterOffset: 0,
    visible: 0,
    width: 0,
    offsets: new Uint32Array(count + 1),
    widths: options.widthPrecision === 'float32' ? new Float32Array(count) : new Array<number>(count)
  };
  while (state.labelIndex < count) {
    if (writeLabelMetricChunk(state, chunkSize) >= chunkSize) yield;
  }
  return { offsets: state.offsets, widths: state.widths };
}

// eslint-disable-next-line max-statements -- @hotpath Character traversal runs outside the generator's scheduling loop.
function writeLabelMetricChunk(state: LabelMetricCursor, chunkSize: number): number {
  const { atlas, count, texts, offsets, widths } = state;
  let { labelIndex, characterOffset, visible, width } = state;
  let work = 0;
  while (labelIndex < count && work < chunkSize) {
    const text = texts[labelIndex] ?? '';
    const characters = labelTextSpan(text, characterOffset, chunkSize - work);
    const end = characterOffset + characters.length;
    for (const sourceCharacter of characters) {
      const character = normalizedCharacter(sourceCharacter, atlas);
      const glyph = requiredGlyph(character, atlas);
      if (character !== ' ') visible += 1;
      width += glyph.xAdvance;
    }
    work += Math.max(1, end - characterOffset);
    if (end === text.length) {
      offsets[labelIndex + 1] = (offsets[labelIndex] ?? 0) + visible;
      widths[labelIndex] = width;
      labelIndex += 1;
      characterOffset = 0;
      visible = 0;
      width = 0;
    } else {
      characterOffset = end;
    }
  }
  state.labelIndex = labelIndex;
  state.characterOffset = characterOffset;
  state.visible = visible;
  state.width = width;
  return work;
}

function* buildGlyphBytes(
  options: Pick<LabelGlyphPreparationOptions, 'atlas' | 'count' | 'texts'>,
  metrics: LabelMetrics,
  chunkSize = PREPARATION_CHUNK_SIZE
): Generator<void, Uint8Array, void> {
  const { atlas, count, texts } = options;
  const glyphCount = metrics.offsets[count] ?? 0;
  const bytes = new Uint8Array(glyphCount * LABEL_GLYPH_STRIDE);
  const state: LabelGlyphCursor = {
    atlas,
    count,
    texts,
    metrics,
    labelIndex: 0,
    characterOffset: 0,
    cursor: 0,
    glyphIndex: 0,
    view: new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
  };
  while (state.labelIndex < count) {
    if (writeGlyphChunk(state, chunkSize) >= chunkSize) yield;
  }
  return bytes;
}

// eslint-disable-next-line max-statements -- @hotpath Character traversal runs outside the generator's scheduling loop.
function writeGlyphChunk(state: LabelGlyphCursor, chunkSize: number): number {
  const { atlas, count, texts, view } = state;
  const { offsets, widths } = state.metrics;
  let { labelIndex, characterOffset, cursor, glyphIndex } = state;
  let work = 0;
  while (labelIndex < count && work < chunkSize) {
    const text = texts[labelIndex] ?? '';
    const characters = labelTextSpan(text, characterOffset, chunkSize - work);
    const end = characterOffset + characters.length;
    const start = offsets[labelIndex] ?? 0;
    const textWidth = widths[labelIndex] ?? 0;
    for (const sourceCharacter of characters) {
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
    work += Math.max(1, end - characterOffset);
    if (end === text.length) {
      labelIndex += 1;
      characterOffset = 0;
      cursor = 0;
      glyphIndex = 0;
    } else {
      characterOffset = end;
    }
  }
  state.labelIndex = labelIndex;
  state.characterOffset = characterOffset;
  state.cursor = cursor;
  state.glyphIndex = glyphIndex;
  return work;
}

/** Bounds UTF-16 spans while keeping surrogate pairs together. */
function labelTextSpan(text: string, start: number, budget: number): string {
  if (start === 0 && text.length <= budget) return text;
  let end = Math.min(text.length, start + budget);
  const before = text.charCodeAt(end - 1);
  const after = text.charCodeAt(end);
  if (before >= 0xd800 && before <= 0xdbff && after >= 0xdc00 && after <= 0xdfff) end += 1;
  return text.slice(start, end);
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
