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
