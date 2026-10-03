// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import assert from 'node:assert/strict';
import test from 'node:test';
import { compileGrammar } from '../../build/highlight/compile.mjs';
import { loadLanguage } from '../../build/highlight/loaders/load-language.mjs';
import { createScanner } from '../../src/internal/highlight/scanner.mjs';
import { categories } from '../../src/internal/highlight/categories.mjs';
import { createDocument, editDocument } from '../../src/code-textarea/internal/incremental.mjs';
import { jsxCases, genericCases } from './fixtures/jsx-corpus.mjs';

for (const [language, samples] of [
  [
    'typescript',
    [
      ...genericCases,
      'const value = <Type>input;\nconst tail = 42;',
      'const f = <T>\n(value: T) => value;\nconst tail = 42;'
    ]
  ],
  [
    'tsx',
    [
      ...jsxCases.map(sample => sample.text),
      'const view = <Widget>\n(label)\n</Widget>;\nconst tail = 42;',
      'const f = <T,>(value: T) => value;\nconst tail = 42;'
    ]
  ]
]) {
  const { grammar, related } = await loadLanguage(language);
  const scan = createScanner(compileGrammar(grammar, related, { shared: true, compact: true }));
  test(`separate ${language} profile preserves its dialect through checkpoints and edits`, () => {
    for (const text of samples) {
      const checkpoints = [];
      const ranges = scan(text, undefined, checkpoints);
      const kinds = Array(text.length).fill('');
      for (const [start, end, kind] of ranges) kinds.fill(categories[kind], start, end);
      const tail = text.indexOf('const tail');
      if (tail >= 0) assert.deepEqual(kinds.slice(tail, tail + 5), Array(5).fill('keyword'));
      if (language === 'typescript')
        assert.ok(ranges.every(([, , kind]) => !['tag', 'attribute'].includes(categories[kind])));
      else if (text.includes('<Widget>\n(label)')) {
        assert.equal(kinds[text.indexOf('Widget')], 'builtin');
        assert.equal(kinds[text.indexOf('label')], '');
      }
      for (const checkpoint of checkpoints)
        assert.deepEqual(
          scan(text, checkpoint),
          ranges
            .filter(([, end]) => end > checkpoint[0])
            .map(([start, end, kind]) => [Math.max(start, checkpoint[0]), end, kind])
        );
      let document = createDocument(scan, text, 1);
      for (const [needle, insertion] of [
        ['<', '<\n'],
        ['42', '987'],
        ['>', '>\n']
      ]) {
        const start = document.text.indexOf(needle);
        if (start < 0) continue;
        document = editDocument(scan, document, start, start + needle.length, insertion);
        assert.deepEqual(document.ranges, scan(document.text));
      }
    }
  });
}

test('Markdown ts and tsx fences select distinct dialects and recover after their boundaries', async () => {
  const { grammar, related } = await loadLanguage('markdown');
  const scan = createScanner(compileGrammar(grammar, related, { shared: true, compact: true }));
  const text =
    '```ts\nconst value = <Type>input;\nconst f = <T>\n(value: T) => value;\nconst tail = 42;\n```\n# after TS\n```tsx\nconst view = <Widget>\n(label)\n</Widget>;\nconst tail = 42;\n```\n# after TSX';
  const ranges = scan(text);
  const kinds = Array(text.length).fill('');
  for (const [start, end, kind] of ranges) kinds.fill(categories[kind], start, end);
  for (const needle of ['const tail', '# after TS', '# after TSX']) {
    const start = text.indexOf(needle);
    assert.equal(kinds[start], 'keyword', needle);
  }
  assert.equal(kinds[text.indexOf('Type')], '');
  assert.equal(kinds[text.indexOf('Widget')], 'builtin');
  assert.equal(kinds[text.indexOf('label')], '');
  let document = createDocument(scan, text, 1);
  const start = text.indexOf('```ts');
  document = editDocument(scan, document, start, start + 5, '```tsx');
  assert.deepEqual(document.ranges, scan(document.text));
});
