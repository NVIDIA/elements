// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

/** Byte budget for one prepared label glyph run. */
export const MAX_LABEL_GLYPH_BYTES = 16 * 1024 * 1024;
export const LABEL_GLYPH_STRIDE = 36;
export const MAX_LABEL_COUNT = 65_536;
export const MAX_LABEL_TEXT_UNITS = Math.floor(MAX_LABEL_GLYPH_BYTES / LABEL_GLYPH_STRIDE);

export class LabelBudgetError extends RangeError {}

/** Budgets UTF-16 units as potential glyphs, including whitespace and surrogate pairs. */
export function validateLabelTextBudget(
  texts: readonly string[],
  count: number,
  maxGlyphBytes = MAX_LABEL_GLYPH_BYTES
): void {
  const limit = labelTextUnitLimit(count, maxGlyphBytes);
  let units = 0;
  for (let index = 0; index < count; index += 1) {
    units += texts[index]?.length ?? 0;
    if (units > limit) throw new LabelBudgetError('Label text exceeds the glyph byte limit.');
  }
}

/** Retains bounded prefix totals for one immutable text generation. */
export class LabelTextBudget {
  readonly #texts: readonly string[];
  readonly #units = [0];

  constructor(texts: readonly string[]) {
    this.#texts = texts;
  }

  validate(count: number, maxGlyphBytes = MAX_LABEL_GLYPH_BYTES): void {
    const limit = labelTextUnitLimit(count, maxGlyphBytes);
    let units = this.#units[Math.min(count, this.#units.length - 1)]!;
    if (units > limit) throw new LabelBudgetError('Label text exceeds the glyph byte limit.');
    for (let index = this.#units.length - 1; index < count; index += 1) {
      units += this.#texts[index]?.length ?? 0;
      if (units > limit) throw new LabelBudgetError('Label text exceeds the glyph byte limit.');
      this.#units.push(units);
    }
  }
}

function labelTextUnitLimit(count: number, maxGlyphBytes: number): number {
  if (!Number.isSafeInteger(count) || count < 0 || count > MAX_LABEL_COUNT) {
    throw new LabelBudgetError('Label count exceeds the preparation limit.');
  }
  return Math.floor(Math.min(maxGlyphBytes, MAX_LABEL_GLYPH_BYTES) / LABEL_GLYPH_STRIDE);
}
