// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFixture, removeFixture } from '@internals/testing';
import { registerHighlights } from './source-highlights.js';

describe('codeblock highlight ranges', () => {
  let fixture: HTMLElement;
  const cleanups: (() => void)[] = [];
  beforeEach(async () => {
    fixture = await createFixture(html`<code nve-text="code"></code><code nve-text="code"></code>`);
  });
  afterEach(() => {
    for (const cleanup of cleanups.splice(0)) cleanup();
    removeFixture(fixture);
  });

  it('maps offsets across source text nodes in declarative shadow DOM', () => {
    fixture.setHTMLUnsafe('<div><template shadowrootmode="open"><code>const <!-- -->value</code></template></div>');
    const shadowRoot = fixture.firstElementChild?.shadowRoot;
    const code = shadowRoot?.querySelector('code');
    if (!shadowRoot || !code) throw new Error('Missing code fixture');

    const sourceNodes = Array.from(code.childNodes);
    const [first, second] = sourceNodes.filter(node => node.nodeType === Node.TEXT_NODE);
    cleanups.push(registerHighlights(code, [[3, 9, 'keyword']]));
    const ranges = Array.from(CSS.highlights.get('nve-code-keyword') ?? []);
    const range = ranges.find(value => 'startContainer' in value && value.startContainer === first);
    if (!range || !('startContainer' in range)) throw new Error('Missing text range');
    expect(range.startContainer).toBe(first);
    expect(range.startOffset).toBe(3);
    expect(range.endContainer).toBe(second);
    expect(range.endOffset).toBe(3);
    expect(shadowRoot.querySelector('code')).toBe(code);
    expect(code.childNodes).toHaveLength(sourceNodes.length);
    sourceNodes.forEach((node, index) => expect(code.childNodes[index]).toBe(node));
    expect(code.textContent).toBe('const value');
  });

  it('preserves external ranges and other owners during repeated cleanup', () => {
    const [first, second] = fixture.querySelectorAll('code');
    if (!first || !second) throw new Error('Missing code fixtures');
    first.textContent = 'abcdef';
    second.textContent = 'ghijkl';
    const external = new StaticRange({ startContainer: first, startOffset: 0, endContainer: first, endOffset: 1 });
    const previous = CSS.highlights.get('nve-code-keyword');
    const group = new Highlight(external);
    group.priority = 7;
    CSS.highlights.set('nve-code-keyword', group);
    cleanups.push(() => {
      if (previous) CSS.highlights.set('nve-code-keyword', previous);
      else CSS.highlights.delete('nve-code-keyword');
    });
    const cleanFirst = registerHighlights(first, [
      [0, 1, 'keyword'],
      [2, 3, 'string']
    ]);
    const cleanSecond = registerHighlights(second, [
      [0, 1, 'keyword'],
      [2, 3, 'string']
    ]);
    cleanups.push(cleanFirst, cleanSecond);
    expect(group.size).toBe(3);
    cleanFirst();
    cleanFirst();
    expect(group.size).toBe(2);
    expect(Array.from(group).some(range => 'startContainer' in range && second.contains(range.startContainer))).toBe(
      true
    );
    cleanSecond();
    cleanSecond();
    expect(CSS.highlights.get('nve-code-keyword')).toBe(group);
    expect(group.priority).toBe(7);
    expect(Array.from(group)).toEqual([external]);
    expect(first.childElementCount + second.childElementCount).toBe(0);
  });

  it('throws when the CSS Custom Highlight API is unavailable', () => {
    const code = fixture.querySelector('code');
    if (!code) throw new Error('Missing code fixture');
    vi.stubGlobal('Highlight', undefined);
    try {
      expect(() => registerHighlights(code, [[0, 1, 'keyword']])).toThrow('CSS Custom Highlight API is required');
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('skips spans without a category or with an empty range', () => {
    const code = fixture.querySelector('code');
    if (!code) throw new Error('Missing code fixture');
    code.textContent = 'abc';
    const before = CSS.highlights.get('nve-code-probe')?.size ?? 0;
    cleanups.push(
      registerHighlights(code, [
        [0, 1, ''],
        [1, 1, 'probe'],
        [2, 1, 'probe'],
        [0, 1, 'probe']
      ])
    );
    expect(CSS.highlights.has('nve-code-')).toBe(false);
    expect(CSS.highlights.get('nve-code-probe')?.size).toBe(before + 1);
  });

  it('throws when a span ends beyond the source text', () => {
    const code = fixture.querySelector('code');
    if (!code) throw new Error('Missing code fixture');
    code.textContent = 'abc';
    expect(() => registerHighlights(code, [[0, 4, 'keyword']])).toThrow(RangeError);
  });
});
