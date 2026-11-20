// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from 'vitest';
import { bracketRanges, parseCode, parseCodeTree, syntaxRanges } from './syntax.js';
import '../../languages/html.js';
import '../../languages/javascript.js';
import '../../languages/markdown.js';
import '../../languages/tsx.js';
import '../../languages/typescript.js';

function tokens(language: string, text: string) {
  return parseCode(language, text).ranges.map(([from, to, category]) => [text.slice(from, to), category]);
}

describe('shared syntax projection', () => {
  it('leaves plain text untouched', () => {
    expect(parseCode('text', 'unparsed { source }').ranges).toEqual([]);
  });

  it('selects distinct TypeScript and TSX syntax', () => {
    const source = 'const view = <NveCard title="hello" />;';
    expect(tokens('tsx', source)).toContainEqual(['NveCard', 'tag']);
    expect(tokens('typescript', source)).not.toContainEqual(['NveCard', 'tag']);
  });

  it('parses HTML script and style regions', () => {
    const source = '<nve-card title="hello"><style>.panel{color:red}</style><script>const x=42;</script></nve-card>';
    const result = tokens('html', source);
    expect(result).toContainEqual(['nve-card', 'tag']);
    expect(result).toContainEqual(['title', 'attribute']);
    expect(result).toContainEqual(['color', 'property']);
    expect(result).toContainEqual(['const', 'keyword']);
  });

  it('parses tagged templates while keeping interpolation in the host language', () => {
    const source = 'const page = html`<div class="panel">${value}</div>`;';
    const result = tokens('javascript', source);
    expect(result).toContainEqual(['div', 'tag']);
    expect(result).toContainEqual(['class', 'attribute']);
    expect(result).toContainEqual(['value', 'variable']);
  });

  it('parses Markdown fences with their selected languages', () => {
    const source = '# Title\n\n```typescript\nconst answer: number = 42;\n```\n\n```python\nprint("hello")\n```';
    const result = tokens('markdown', source);
    expect(result).toContainEqual(['const', 'keyword']);
    expect(result).toContainEqual(['number', 'type']);
    expect(result).toContainEqual(['print', 'function']);
    expect(result).toContainEqual(['"hello"', 'string']);
  });

  it('highlights Markdown fence bodies when the language is followed by metadata', () => {
    const source = '```JS\ttitle=demo.js\nconst answer = 42;\n```';

    expect(tokens('markdown', source)).toContainEqual(['const', 'keyword']);
  });

  it('colors syntax tree brackets inside Markdown without coloring strings', () => {
    const source = '```python\nprint("(text)")\n```';
    const tree = parseCode('markdown', source).tree;
    if (!tree) throw new Error('Missing Markdown tree');
    expect(bracketRanges(tree, 'shared').map(([from, to]) => source.slice(from, to))).toEqual(['(', ')']);
  });

  it('can count bracket colors independently by pair type', () => {
    const source = 'function getTime(): number {\n  return new Date().getTime();\n}';
    const tree = parseCode('typescript', source).tree;
    if (!tree) throw new Error('Missing TypeScript tree');
    const call = source.indexOf('Date(') + 'Date'.length;
    const categoryAt = (mode: 'shared' | 'independent') =>
      bracketRanges(tree, mode).find(([from]) => from === call)?.[2];

    expect(categoryAt('shared')).toBe('bracket-2');
    expect(categoryAt('independent')).toBe('bracket-1');
    expect(bracketRanges(tree, null)).toEqual([]);

    const nested = 'const value = ((1));';
    const nestedTree = parseCode('typescript', nested).tree;
    if (!nestedTree) throw new Error('Missing nested TypeScript tree');
    expect(bracketRanges(nestedTree, 'independent').map(([from, , category]) => [nested[from], category])).toEqual([
      ['(', 'bracket-1'],
      ['(', 'bracket-2'],
      [')', 'bracket-2'],
      [')', 'bracket-1']
    ]);
  });

  it('projects only the requested part of a mixed-language tree', () => {
    const source = '# Heading\n\n```typescript\nconst greeting = "hello";\n```\n\nAfter';
    const parsed = parseCodeTree('markdown', source);
    if (!parsed.tree) throw new Error('Missing Markdown tree');
    const from = source.indexOf('greeting') + 3;
    const to = source.indexOf('hello') + 2;
    const expected = parseCode('markdown', source)
      .ranges.filter(([start, end]) => end > from && start < to)
      .map(([start, end, category]) => [Math.max(start, from), Math.min(end, to), category]);

    expect(syntaxRanges(parsed.tree, from, to)).toEqual(expected);
    expect(parsed).not.toHaveProperty('ranges');
  });

  it('matches a fresh parse after an edit inside embedded code', () => {
    const original = '# Title\n\n```typescript\nconst value = 42;\n```';
    const first = parseCode('markdown', original);
    const edited = original.replace('42', '"value"');
    const changed = parseCode('markdown', edited, first);
    expect(changed.ranges).toEqual(parseCode('markdown', edited).ranges);
  });
});
