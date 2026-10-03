// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createFixture, removeFixture } from '@internals/testing';
import { registerHighlights } from './highlights.mjs';

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

  it('maps offsets across text nodes without replacing the source nodes', () => {
    const code = fixture.querySelector('code');
    if (!code) throw new Error('Missing code fixture');
    const first = document.createTextNode('const ');
    const second = document.createTextNode('value');
    code.append(first, second);
    cleanups.push(registerHighlights(code, [[3, 9, 1]]));
    const ranges = Array.from(CSS.highlights.get('nve-code-keyword') ?? []);
    const range = ranges.find(value => 'startContainer' in value && value.startContainer === first);
    if (!range || !('startContainer' in range)) throw new Error('Missing text range');
    expect(range.startContainer).toBe(first);
    expect(range.startOffset).toBe(3);
    expect(range.endContainer).toBe(second);
    expect(range.endOffset).toBe(3);
    expect(Array.from(code.childNodes)).toEqual([first, second]);
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
      [0, 1, 1],
      [2, 3, 2]
    ]);
    const cleanSecond = registerHighlights(second, [
      [0, 1, 1],
      [2, 3, 2]
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
});
