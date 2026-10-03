// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import assert from 'node:assert/strict';
import test from 'node:test';
import { loadGrammar, compileGrammar } from '../compile.mjs';
import { pythonProfile } from './python-profile.mjs';
import { pythonProfileCases } from '../../../tests/highlight/fixtures/python-corpus.mjs';
import { createScanner } from '../../../src/internal/highlight/scanner.mjs';
import { createDocument, editDocument } from '../../../src/code-textarea/internal/incremental.mjs';
import { categories } from '../../../src/internal/highlight/categories.mjs';
import { loadMarkdown } from '../loaders/load-markdown.mjs';

const source = await loadGrammar('@shikijs/langs/python');
const original = JSON.stringify(source);
for (const lexical of [false, true]) {
  const profile = pythonProfile(source, lexical);
  const scanners = [
    {},
    { shared: true },
    { shared: true, compact: true },
    { shared: true, ascii: true },
    { shared: true, compact: true, ascii: true }
  ].map(options => createScanner(compileGrammar(profile, undefined, options)));
  for (const sample of pythonProfileCases) {
    test(`${lexical ? 'lexical' : 'raw-string'} Python: ${sample.name}`, () => {
      const expected = scanners[0](sample.text);
      const kinds = Array(sample.text.length).fill('');
      for (const [start, end, kind] of expected) kinds.fill(categories[kind], start, end);
      for (const [needle, kind, skip = 0] of sample.checks) {
        const found = sample.text.indexOf(needle);
        assert.ok(found >= 0, needle);
        const start = found + skip;
        assert.deepEqual(kinds.slice(start, found + needle.length), Array(needle.length - skip).fill(kind), needle);
      }
      for (const scan of scanners) {
        const checkpoints = [];
        assert.deepEqual(scan(sample.text, undefined, checkpoints), expected);
        for (const checkpoint of checkpoints) {
          assert.deepEqual(
            scan(sample.text, checkpoint),
            expected
              .filter(([, end]) => end > checkpoint[0])
              .map(([start, end, kind]) => [Math.max(start, checkpoint[0]), end, kind])
          );
        }
        let document = createDocument(scan, sample.text, 1);
        let seed = 271828;
        for (let edit = 0; edit < 20; edit++) {
          seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
          const start = seed % (document.text.length + 1);
          const pieces = ['\n', '{', '}', '"', "'", '\\', '42', '#', ''];
          document = editDocument(
            scan,
            document,
            start,
            Math.min(document.text.length, start + (seed % 3)),
            pieces[seed % pieces.length]
          );
          assert.deepEqual(document.ranges, scan(document.text));
        }
      }
    });
  }
}
test('Python adaptation leaves its established grammar source unchanged', () => {
  assert.equal(JSON.stringify(source), original);
});

test('Python formatted literals resume deeply nested explicit stacks', () => {
  const scan = createScanner(compileGrammar(pythonProfile(source, true), undefined, { shared: true, compact: true }));
  const text = 'f"before {'.repeat(512) + '\n42\n' + '} after"'.repeat(512);
  const checkpoints = [];
  const ranges = scan(text, undefined, checkpoints);
  assert.ok(checkpoints[1][3].length >= 1024);
  assert.deepEqual(
    scan(text, checkpoints[1]),
    ranges
      .filter(([, end]) => end > checkpoints[1][0])
      .map(([start, end, kind]) => [Math.max(start, checkpoints[1][0]), end, kind])
  );
});

test('Markdown Python fences use the selected profile and recover unfinished fields', async () => {
  const { grammar, related } = await loadMarkdown(['python'], true);
  const scan = createScanner(compileGrammar(grammar, related, { shared: true, compact: true }));
  const text = '```python\nx = r"\\n\\t"\ny = f"{\n42\n```\n# recovered\n';
  const ranges = scan(text);
  const kinds = Array(text.length).fill('');
  for (const [start, end, kind] of ranges) kinds.fill(categories[kind], start, end);
  for (const [needle, kind] of [
    ['\\n\\t', 'string'],
    ['42', 'number'],
    ['# recovered', 'keyword']
  ]) {
    const start = text.indexOf(needle);
    assert.deepEqual(kinds.slice(start, start + needle.length), Array(needle.length).fill(kind), needle);
  }
  let document = createDocument(scan, text, 1);
  const edit = text.indexOf('42');
  document = editDocument(scan, document, edit, edit + 2, 'f"nested {True}"');
  assert.deepEqual(document.ranges, scan(document.text));
});
