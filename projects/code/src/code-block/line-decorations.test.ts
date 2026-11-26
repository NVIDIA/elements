// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import type { CodeBlock } from '@nvidia-elements/code/code-block';
import '@nvidia-elements/code/code-block/define.js';
import { decorateLines } from './line-decorations.js';

const source = 'const value = "abcdefghijklmnopqrstuvwxyz";\n\n\t// 👩🏽‍💻 é 中文 مرحبا xyz\nconst tail = true;';

describe('Code Block line decoration integration', () => {
  let fixture: HTMLElement | undefined;
  afterEach(() => {
    vi.restoreAllMocks();
    getSelection()?.removeAllRanges();
    if (fixture) removeFixture(fixture);
  });

  it.each([
    { mode: 'unwrapped', wrap: false, ambiguous: false, singleGutter: true },
    { mode: 'wrapped', wrap: true, ambiguous: false, singleGutter: false },
    { mode: 'unwrapped with ambiguous geometry', wrap: false, ambiguous: true, singleGutter: false }
  ])('aligns $mode decorations and excludes them from copied source', async ({ wrap, ambiguous, singleGutter }) => {
    fixture = await createFixture(
      html`<nve-code-block .code=${source} .lineNumbers=${true} highlight="2-3"></nve-code-block>`
    );
    const element = fixture.querySelector('nve-code-block');
    if (!element) throw new Error('Missing code block fixture');
    element.style.cssText = 'font-size:14px; line-height:20px;';
    if (wrap) element.style.cssText += 'width:180px; --white-space:pre-wrap;';
    await elementIsStable(element);
    const { pre, code, node } = codeParts(element);

    const queries = measureGeometry(pre, node, ambiguous);

    if (singleGutter) expect(queries).toBe(1);
    else expect(queries).toBeGreaterThan(1);
    assertAlignedRows(pre, code, lineTops(node));
    const gutter = pre.querySelector('[data-gutter]');
    if (singleGutter) expect(gutter?.textContent).toBe('1\n2\n3\n4');
    else {
      expect(gutter).toBeNull();
      expect(Array.from(pre.querySelectorAll('.line-number')).map(row => row.textContent)).toEqual([
        '1',
        '2',
        '3',
        '4'
      ]);
    }

    const range = document.createRange();
    range.selectNodeContents(pre);
    const selection = getSelection();
    selection?.addRange(range);
    expect(selection?.toString()).toBe(source);
    expect(Array.from(code.childNodes)).toContain(node);
    expect(code.childElementCount).toBe(0);
  });
});

describe('decorateLines line layout', () => {
  let mounted: HTMLElement[] = [];
  afterEach(() => {
    vi.restoreAllMocks();
    for (const element of mounted) element.remove();
    mounted = [];
  });

  function mountPre({ texts, hidden = false }: { texts: string[]; hidden?: boolean }) {
    const container = document.createElement('div');
    container.style.cssText = hidden ? 'display:none' : 'width:300px;font:14px/20px monospace;';
    const pre = document.createElement('pre');
    pre.style.margin = '0';
    const layer = document.createElement('span');
    layer.dataset.lines = '';
    const code = document.createElement('code');
    code.style.cssText = 'display:block;white-space:pre;';
    code.append(...texts);
    pre.append(layer, code);
    container.append(pre);
    document.body.append(container);
    mounted.push(container);
    return { pre, layer, code, text: texts.join('') };
  }

  function lineLabels(layer: HTMLElement) {
    return Array.from(layer.querySelectorAll('[data-line]')).map(row => row.textContent);
  }

  it('does nothing when the pre has no decoration layer', () => {
    const pre = document.createElement('pre');
    pre.append(document.createElement('code'));
    expect(() => decorateLines(pre, 'const a = 1;', { numbers: true })).not.toThrow();
    expect(pre.querySelector('[data-line], [data-gutter]')).toBeNull();
  });

  it('clears existing decorations when the text is empty', () => {
    const { pre, layer, text } = mountPre({ texts: ['a\nb'] });
    decorateLines(pre, text, { numbers: true });
    expect(layer.querySelector('[data-gutter]')?.textContent).toBe('1\n2');
    decorateLines(pre, '', { numbers: true });
    expect(layer.children.length).toBe(0);
  });

  it('clears existing decorations when the code element is missing', () => {
    const { pre, layer, code, text } = mountPre({ texts: ['a\nb'] });
    decorateLines(pre, text, { numbers: true });
    code.remove();
    decorateLines(pre, text, { numbers: true });
    expect(layer.children.length).toBe(0);
  });

  it('clears existing decorations when the code has no text nodes', () => {
    const { pre, layer, code, text } = mountPre({ texts: ['a\nb'] });
    decorateLines(pre, text, { numbers: true });
    code.replaceChildren(document.createElement('b'));
    decorateLines(pre, text, { numbers: true });
    expect(layer.children.length).toBe(0);
  });

  it('clears existing decorations when neither numbers nor selection are requested', () => {
    const { pre, layer, text } = mountPre({ texts: ['a\nb'] });
    decorateLines(pre, text, { numbers: true });
    decorateLines(pre, text, { numbers: false });
    expect(layer.children.length).toBe(0);
  });

  it('batches line tops across multiple text nodes', () => {
    const { pre, layer, text } = mountPre({ texts: ['const a = 1;\n', 'const b = 2;'] });
    decorateLines(pre, text, { numbers: true });
    expect(layer.querySelector('[data-gutter]')?.textContent).toBe('1\n2');
    expect(layer.querySelectorAll('[data-line]').length).toBe(0);
  });

  it('derives a single gutter for a single-line block', () => {
    const { pre, layer, text } = mountPre({ texts: ['const a = 1;'] });
    decorateLines(pre, text, { numbers: true });
    expect(layer.querySelector('[data-gutter]')?.textContent).toBe('1');
  });

  it('reuses the existing gutter when decorations are updated', () => {
    const { pre, layer, text } = mountPre({ texts: ['const a = 1;\nconst b = 2;'] });
    decorateLines(pre, text, { numbers: true });
    decorateLines(pre, text, { numbers: true });
    expect(layer.querySelectorAll('[data-gutter]').length).toBe(1);
    expect(layer.querySelector('[data-gutter]')?.textContent).toBe('1\n2');
  });

  it('falls back to per-line rows when batched line tops are unevenly spaced', () => {
    const { pre, layer, text } = mountPre({ texts: ['a\nb\nc\nd'] });
    const native = Range.prototype.getClientRects;
    vi.spyOn(Range.prototype, 'getClientRects').mockImplementation(function (this: Range) {
      const rects = native.call(this);
      if (this.startOffset !== 0 || this.endOffset !== text.length) return rects;
      const [, , thirdLineTop] = new Set(Array.from(rects, rect => rect.top));
      const shifted = Array.from(rects, rect =>
        rect.top === thirdLineTop ? new DOMRect(rect.x, rect.y + 3, rect.width, rect.height) : rect
      );
      return Object.assign(shifted, { item: (index: number) => shifted[index] ?? null });
    });
    decorateLines(pre, text, { numbers: true });
    expect(layer.querySelector('[data-gutter]')).toBeNull();
    expect(lineLabels(layer)).toEqual(['1', '2', '3', '4']);
  });

  it('decorates lines without layout geometry', () => {
    const { pre, layer, text } = mountPre({ texts: ['a\nb'], hidden: true });
    expect(() => decorateLines(pre, text, { numbers: true })).not.toThrow();
    expect(layer.querySelector('[data-gutter]')).toBeNull();
    expect(lineLabels(layer)).toEqual(['1', '2']);
  });
});

function codeParts(element: CodeBlock) {
  const pre = element.shadowRoot?.querySelector('pre');
  const code = pre?.querySelector('code');
  const node = Array.from(code?.childNodes ?? []).find(child => child instanceof Text);
  if (!pre || !code || !(node instanceof Text)) throw new Error('Missing code text');
  return { pre, code, node };
}

function measureGeometry(pre: HTMLPreElement, node: Text, ambiguous: boolean) {
  const native = Range.prototype.getClientRects;
  let queries = 0;
  const spy = vi.spyOn(Range.prototype, 'getClientRects').mockImplementation(function (this: Range) {
    queries++;
    const rects = native.call(this);
    if (!ambiguous || this.startOffset !== 0 || this.endOffset !== node.length) return rects;
    const last = rects[rects.length - 1];
    if (!last) throw new Error('Missing native rectangles');
    const fragments = [...rects, new DOMRect(0, last.top + 100, 10, 10)];
    return Object.assign(fragments, { item: (index: number) => fragments[index] ?? null });
  });
  try {
    decorateLines(pre, source, { numbers: true, selection: '2-3' });
  } finally {
    spy.mockRestore();
  }
  return queries;
}

function lineTops(node: Text) {
  const range = document.createRange();
  const tops: number[] = [];
  let offset = 0;
  for (const line of source.split('\n')) {
    range.setStart(node, offset);
    range.setEnd(node, Math.min(offset + 1, node.length));
    const rect = range.getClientRects()[0];
    if (!rect) throw new Error('Missing logical line rectangle');
    tops.push(rect.top);
    offset += line.length + 1;
  }
  return tops;
}

function assertAlignedRows(pre: HTMLPreElement, code: HTMLElement, tops: number[]) {
  const bounds = code.getBoundingClientRect();
  const origin = bounds.top - (tops[0] ?? 0);
  for (const row of pre.querySelectorAll<HTMLElement>('[data-line]')) {
    const index = Number(row.dataset.line) - 1;
    const expectedTop = (tops[index] ?? 0) + origin;
    const expectedBottom = index + 1 < tops.length ? (tops[index + 1] ?? 0) + origin : bounds.bottom;
    const actual = row.getBoundingClientRect();
    expect(Math.abs(actual.top - expectedTop)).toBeLessThan(0.1);
    expect(Math.abs(actual.bottom - expectedBottom)).toBeLessThan(0.1);
  }
}
