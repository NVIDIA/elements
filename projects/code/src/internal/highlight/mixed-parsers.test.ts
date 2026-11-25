// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { javascript } from './mixed-parsers.js';
import { syntaxRanges } from './syntax.js';

function highlight(source: string) {
  return syntaxRanges(javascript.parse(source)).map(([start, end, category]) => [source.slice(start, end), category]);
}

describe('mixed parsers', () => {
  it('parses CSS templates while keeping substitutions in JavaScript', () => {
    const tokens = highlight('css`div { color: ${color}; }`');
    expect(tokens).toContainEqual(['color', 'property']);
    expect(tokens).toContainEqual(['color', 'variable']);
  });

  it('parses HTML templates without substitutions', () => {
    const tokens = highlight('html`<p class="a">hi</p>`');
    expect(tokens).toContainEqual(['p', 'tag']);
    expect(tokens).toContainEqual(['class', 'attribute']);
  });

  it('parses HTML templates that start and end with substitutions', () => {
    const tokens = highlight('html`${first}<p>${last}`');
    expect(tokens).toContainEqual(['p', 'tag']);
    expect(tokens).toContainEqual(['first', 'variable']);
    expect(tokens).toContainEqual(['last', 'variable']);
  });

  it('leaves templates with other tags as plain strings', () => {
    for (const source of ['sql`select 1`', 'foo.html`<p></p>`']) {
      const tokens = highlight(source);
      expect(tokens.some(([, category]) => category === 'tag')).toBe(false);
      expect(tokens).toContainEqual([source.slice(source.indexOf('`')), 'string']);
    }
  });
});
