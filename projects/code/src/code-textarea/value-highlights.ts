// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { getHighlightGroup } from '../internal/highlight/highlight-group.js';
import type { SyntaxSpan } from '../internal/highlight/syntax.js';

interface ValueRange extends AbstractRange {
  disconnect(): void;
  getBoundingClientRect(): DOMRect;
}

interface HighlightableTextarea extends HTMLTextAreaElement {
  createValueRange(start: number, end: number): ValueRange;
}

interface Entry {
  category: string;
  range: ValueRange;
  highlight: Highlight;
}

type TextWindow = [from: number, to: number];

export const highlightRangeLimit = 4_096;
const wideLineLength = 2_048;
const simpleLine = /^[\t\x20-\x7e]+$/;

export function supportsValueHighlights(textarea: HTMLTextAreaElement): textarea is HighlightableTextarea {
  return (
    'createValueRange' in textarea &&
    typeof textarea.createValueRange === 'function' &&
    typeof CSS !== 'undefined' &&
    !!CSS.highlights &&
    typeof Highlight !== 'undefined'
  );
}

function getValueRect(textarea: HighlightableTextarea, offset: number) {
  const range = textarea.createValueRange(offset, offset + 1);
  try {
    return range.getBoundingClientRect();
  } finally {
    range.disconnect();
  }
}

function findOffset(from: number, to: number, isBefore: (offset: number) => boolean) {
  let start = from;
  let end = to;
  while (start < end) {
    const middle = Math.floor((start + end) / 2);
    if (isBefore(middle)) start = middle + 1;
    else end = middle;
  }
  return start;
}

function getVerticalWindow(textarea: HighlightableTextarea, textLength: number, rect: DOMRect): TextWindow {
  const buffer = textarea.clientHeight * 2;
  const positions = new Map<number, number>();
  const topAt = (offset: number) => {
    let top = positions.get(offset);
    if (top === undefined) {
      top = getValueRect(textarea, offset).top;
      positions.set(offset, top);
    }
    return top;
  };
  const firstAt = (target: number) => findOffset(0, textLength, offset => topAt(offset) < target);

  return [Math.max(0, firstAt(rect.top - buffer) - 1), Math.min(textLength, firstAt(rect.bottom + buffer) + 1)];
}

export function getWideLines(text: string) {
  const lines: TextWindow[] = [];
  let start = 0;
  while (start < text.length) {
    const newline = text.indexOf('\n', start);
    const end = newline === -1 ? text.length : newline;
    if (end - start >= wideLineLength) {
      if (!simpleLine.test(text.slice(start, end))) return { lines, canClip: false };
      lines.push([start, end]);
    }
    start = end + 1;
  }
  return { lines, canClip: true };
}

function isTranslation(transform: string) {
  if (transform === 'none') return true;
  const matrix = new DOMMatrixReadOnly(transform);
  return matrix.is2D && matrix.a === 1 && matrix.b === 0 && matrix.c === 0 && matrix.d === 1;
}

function preservesAxes(style: CSSStyleDeclaration) {
  return (
    isTranslation(style.transform) &&
    style.rotate === 'none' &&
    style.scale === 'none' &&
    style.perspective === 'none' &&
    style.offsetPath === 'none' &&
    style.zoom === '1'
  );
}

function preservesGeometry(textarea: HTMLTextAreaElement, textareaStyle: CSSStyleDeclaration) {
  if (textareaStyle.writingMode !== 'horizontal-tb') return false;
  let element: Element | null = textarea;
  while (element) {
    const style = element === textarea ? textareaStyle : getComputedStyle(element);
    if (!preservesAxes(style)) return false;
    const root = element.getRootNode();
    element = element.assignedSlot ?? element.parentElement ?? (root instanceof ShadowRoot ? root.host : null);
  }
  return true;
}

function hasMonotonicInlineLayout(style: CSSStyleDeclaration) {
  return style.direction === 'ltr' && !(parseFloat(style.letterSpacing) < 0 || parseFloat(style.wordSpacing) < 0);
}

function getHorizontalLine(
  textarea: HighlightableTextarea,
  [lineStart, lineEnd]: TextWindow,
  { vertical: [from, to], left, right }: { vertical: TextWindow; left: number; right: number }
) {
  const first = getValueRect(textarea, lineStart);
  const last = getValueRect(textarea, lineEnd - 1);
  // A horizontal search requires source offsets to advance across the same rendered row.
  if (!first.height || first.top !== last.top || last.right <= first.left) return;

  const rowStart = Math.max(from, lineStart);
  const rowEnd = Math.min(to, lineEnd);
  const visibleStart = findOffset(rowStart, rowEnd, offset => getValueRect(textarea, offset).right < left);
  const visibleEnd = findOffset(visibleStart, rowEnd, offset => getValueRect(textarea, offset).left < right);
  return { rowStart, rowEnd, visibleStart, visibleEnd };
}

function getHorizontalWindows(
  textarea: HighlightableTextarea,
  lines: TextWindow[],
  { vertical, rect }: { vertical: TextWindow; rect: DOMRect }
) {
  const bounds = { vertical, left: rect.left - rect.width, right: rect.right + rect.width };
  const windows: TextWindow[] = [];
  let start = vertical[0];
  for (
    let index = findOffset(0, lines.length, lineIndex => lines[lineIndex]![1] <= vertical[0]);
    index < lines.length;
    index++
  ) {
    const line = lines[index]!;
    if (line[0] >= vertical[1]) break;
    const clip = getHorizontalLine(textarea, line, bounds);
    if (!clip) return;
    if (clip.visibleStart > clip.rowStart) {
      if (start < clip.rowStart) windows.push([start, clip.rowStart]);
      start = clip.visibleStart;
    }
    if (clip.visibleEnd < clip.rowEnd) {
      if (start < clip.visibleEnd) windows.push([start, clip.visibleEnd]);
      start = clip.rowEnd;
    }
  }
  return windows.concat(start < vertical[1] ? [[start, vertical[1]]] : []);
}

/** Finds the source windows to highlight, with a conservative horizontal window for wide unwrapped rows. */
export function getValueViewport(
  textarea: HighlightableTextarea,
  textLength: number,
  scanWideLines: () => ReturnType<typeof getWideLines>
): { windows: TextWindow[]; horizontal?: { left: number; width: number } } | null | undefined {
  const rect = textarea.getBoundingClientRect();
  if (!rect.width || !rect.height) return { windows: [] };

  const style = getComputedStyle(textarea);
  if (!preservesGeometry(textarea, style)) return;
  if (style.getPropertyValue('text-wrap-mode') !== 'nowrap') {
    return { windows: [getVerticalWindow(textarea, textLength, rect)] };
  }

  const { lines, canClip } = scanWideLines();
  if (!canClip || (lines.length && !hasMonotonicInlineLayout(style))) return;
  const vertical = getVerticalWindow(textarea, textLength, rect);
  if (!lines.length) return { windows: [vertical] };

  const windows = getHorizontalWindows(textarea, lines, { vertical, rect });
  return windows ? { windows, horizontal: { left: textarea.scrollLeft, width: textarea.clientWidth } } : null;
}

/** Owns only this textarea's ranges in the shared semantic highlight groups. */
export class ValueHighlights {
  #entries: Entry[] = [];

  constructor(private readonly textarea: HighlightableTextarea) {}

  #previousIndex = 0;

  update(spans: SyntaxSpan[]) {
    if (this.#entries.length + spans.length > highlightRangeLimit) this.clear();
    const next: Entry[] = [];
    this.#previousIndex = 0;
    for (const [start, end, category] of spans) {
      if (!category || end <= start) continue;
      next.push(this.#takeMatchingRange(start, end, category) ?? this.#createRange(start, end, category));
    }
    this.#removeRemaining();
    this.#entries = next;
  }

  #takeMatchingRange(start: number, end: number, category: string): Entry | undefined {
    // Native edits move existing opaque range endpoints before reconciliation.
    let entry = this.#entries[this.#previousIndex];
    while (
      entry &&
      (entry.range.startOffset < start || (entry.range.startOffset === start && entry.range.endOffset < end))
    ) {
      this.#remove(entry);
      entry = this.#entries[++this.#previousIndex];
    }
    if (entry?.range.startOffset === start && entry.range.endOffset === end && entry.category === category) {
      this.#previousIndex++;
      return entry;
    }
    return undefined;
  }

  #createRange(start: number, end: number, category: string): Entry {
    const highlight = getHighlightGroup(category);
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
