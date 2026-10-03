// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { categories } from '../../internal/highlight/categories.mjs';

interface ValueRange extends AbstractRange {
  disconnect(): void;
}

interface HighlightableTextarea extends HTMLTextAreaElement {
  createValueRange(start: number, end: number): ValueRange;
}

interface Entry {
  category: number;
  range: ValueRange;
  highlight: Highlight;
}

/** Checks the native APIs without changing the textarea's editing behavior. */
export function supportsValueHighlights(textarea: HTMLTextAreaElement): textarea is HighlightableTextarea {
  return (
    'createValueRange' in textarea &&
    typeof textarea.createValueRange === 'function' &&
    typeof CSS !== 'undefined' &&
    !!CSS.highlights &&
    typeof Highlight !== 'undefined'
  );
}

/** Owns only this textarea's ranges in the shared semantic highlight groups. */
export class ValueHighlights {
  #entries: Entry[] = [];

  constructor(private readonly textarea: HighlightableTextarea) {}

  #previousIndex = 0;

  update(spans: [number, number, number][]) {
    const next: Entry[] = [];
    this.#previousIndex = 0;
    for (const [start, end, category] of spans) {
      const name = categories[category];
      if (!name || end <= start) continue;
      next.push(this.#takeMatchingRange(start, end, category) ?? this.#createRange(start, end, category));
    }
    this.#removeRemaining();
    this.#entries = next;
  }

  #takeMatchingRange(start: number, end: number, category: number): Entry | undefined {
    let entry = this.#entries[this.#previousIndex];
    while (
      entry &&
      (entry.range.startOffset < start || (entry.range.startOffset === start && entry.range.endOffset < end))
    ) {
      this.#remove(entry);
      entry = this.#entries[++this.#previousIndex];
    }
    // The browser has already moved live ranges. Reuse only endpoints and
    // categories that agree with the newly scanned value.
    if (entry?.range.startOffset === start && entry.range.endOffset === end && entry.category === category) {
      this.#previousIndex++;
      return entry;
    }
    return undefined;
  }

  #createRange(start: number, end: number, category: number): Entry {
    const key = `nve-code-${categories[category]}`;
    let highlight = CSS.highlights.get(key);
    if (!highlight) {
      highlight = new Highlight();
      CSS.highlights.set(key, highlight);
    }
    const range = this.textarea.createValueRange(start, end);
    highlight.add(range);
    return { category, range, highlight };
  }

  #removeRemaining() {
    for (const entry of this.#entries.slice(this.#previousIndex)) this.#remove(entry);
  }

  clear() {
    for (const entry of this.#entries) this.#remove(entry);
    this.#entries = [];
  }

  #remove(entry: Entry) {
    entry.highlight.delete(entry.range);
    entry.range.disconnect();
  }
}
