// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import assert from 'node:assert/strict';
import test from 'node:test';
import { compileGrammar } from '../compile.mjs';
import { loadScript } from '../loaders/load-script.mjs';
import { loadMarkdown } from '../loaders/load-markdown.mjs';
import { categories } from '../../../src/internal/highlight/categories.mjs';
import { createScanner } from '../../../src/internal/highlight/scanner.mjs';
import { createDocument, editDocument } from '../../../src/code-textarea/internal/incremental.mjs';
import { jsxCases } from '../../../tests/highlight/fixtures/jsx-corpus.mjs';

function assertKinds(scan, text, checks) {
  const ranges = scan(text);
  const kinds = Array(text.length).fill('');
  for (const [start, end, category] of ranges) kinds.fill(categories[category], start, end);
  for (const [needle, kind, width = needle.length] of checks) {
    const start = text.indexOf(needle);
    assert.ok(start >= 0, needle);
    assert.deepEqual(kinds.slice(start, start + width), Array(width).fill(kind), needle);
  }
  return ranges;
}

for (const language of ['javascript', 'tsx']) {
  const { grammar, related } = await loadScript(language);
  const original = await loadScript(language, { jsxWrappers: true });
  const before = JSON.stringify([grammar, related]);
  const scans = [
    {},
    { shared: true },
    { shared: true, compact: true },
    { shared: true, compact: true, ascii: true },
    { shared: true, compact: true, nativeCase: true }
  ].map(options => createScanner(compileGrammar(grammar, related, options)));
  scans.unshift(createScanner(compileGrammar(original.grammar, original.related, { shared: true, compact: true })));
  assert.equal(JSON.stringify([grammar, related]), before);
  for (const sample of jsxCases.filter(sample => !sample.languages || sample.languages.includes(language))) {
    test(`${language} JSX: ${sample.name}`, () => {
      const expected = assertKinds(scans[0], sample.text, sample.checks);
      for (const scan of scans) {
        const checkpoints = [];
        assert.deepEqual(scan(sample.text, undefined, checkpoints), expected);
        for (const checkpoint of checkpoints)
          assert.deepEqual(
            scan(sample.text, checkpoint),
            expected
              .filter(([, end]) => end > checkpoint[0])
              .map(([start, end, kind]) => [Math.max(start, checkpoint[0]), end, kind])
          );
        let document = createDocument(scan, sample.text, 1);
        for (const [needle, insertion] of [
          ['42', '987'],
          ['{', '{\n'],
          ['"', ''],
          ['/>', '>\n</Widget>'],
          ['}', '}\n'],
          ['</', '</\n']
        ]) {
          const start = document.text.indexOf(needle);
          if (start < 0) continue;
          document = editDocument(scan, document, start, start + needle.length, insertion);
          assert.deepEqual(document.ranges, scan(document.text));
        }
      }
    });
  }
}

test('Markdown fences restore block parsing from unfinished JSX headers and expressions', async () => {
  const { grammar, related } = await loadMarkdown(['javascript', 'tsx'], true);
  const scan = createScanner(compileGrammar(grammar, related, { shared: true, compact: true }));
  const text =
    '```js\nconst view = <Widget title={\n 42\n```\n# recovered\n```tsx\nconst view = <Widget enabled={true}>\n <span>{42}</span>\n</Widget>;\n```\n# tail';
  assertKinds(scan, text, [
    ['Widget', 'builtin'],
    ['title', 'attribute'],
    ['42', 'number'],
    ['# recovered', 'keyword'],
    ['span', 'tag'],
    ['# tail', 'keyword']
  ]);
  let document = createDocument(scan, text, 1);
  const start = text.indexOf('42');
  document = editDocument(scan, document, start, start + 2, '<em>{false}</em>');
  assert.deepEqual(document.ranges, scan(document.text));
});

test('deep JSX nesting uses the explicit stack and resumes a child expression', async () => {
  const { grammar, related } = await loadScript();
  const scan = createScanner(compileGrammar(grammar, related, { shared: true, compact: true }));
  const text =
    'const view = ' + '<Widget title={true}>'.repeat(512) + '\n{42}\n' + '</Widget>'.repeat(512) + '; const tail = 7;';
  const checkpoints = [];
  const ranges = scan(text, undefined, checkpoints);
  assert.ok(checkpoints[1][3].length >= 512);
  assert.deepEqual(
    scan(text, checkpoints[1]),
    ranges.filter(([, end]) => end > checkpoints[1][0])
  );
  assertKinds(scan, text, [
    ['42', 'number'],
    ['const tail', 'keyword', 5],
    ['7', 'number']
  ]);
});
