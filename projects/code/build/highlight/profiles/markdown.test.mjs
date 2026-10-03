// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import assert from 'node:assert/strict';
import test from 'node:test';
import { compileGrammar } from '../compile.mjs';
import { categories } from '../../../src/internal/highlight/categories.mjs';
import { createDocument, editDocument } from '../../../src/code-textarea/internal/incremental.mjs';
import { loadMarkdown } from '../loaders/load-markdown.mjs';
import { markdownCases, markdownLanguages } from '../../../tests/highlight/fixtures/markdown-corpus.mjs';
import { createScanner } from '../../../src/internal/highlight/scanner.mjs';

const { grammar, related } = await loadMarkdown(markdownLanguages, true);
const before = JSON.stringify([grammar, related]);
const scanners = [
  {},
  { shared: true },
  { shared: true, ascii: true },
  { shared: true, compact: true },
  { shared: true, compact: true, ascii: true }
].map(options => createScanner(compileGrammar(grammar, related, options)));

function assertKinds(text, expectations) {
  for (const scan of scanners) {
    const kinds = Array(text.length).fill('');
    for (const [start, end, kind] of scan(text)) kinds.fill(categories[kind], start, end);
    for (const [needle, expected, offset = 0] of expectations) {
      const start = text.indexOf(needle);
      assert.notEqual(start, -1, needle);
      assert.equal(kinds[start + offset], expected, needle);
    }
  }
}

test('classifies Markdown semantics independently of Highlight.js output', () => {
  assertKinds(markdownCases[0].text, [
    ['title:', 'property'],
    ['"GPU"', 'string'],
    ['true', 'literal'],
    ['# Heading', 'keyword'],
    ['code', 'string'],
    ['strong', ''],
    ['emphasis', ''],
    ['outer', 'link'],
    ['inner', 'link'],
    ['https://example.test/a', 'link'],
    ['(b)', 'punctuation'],
    ['(b)', 'link', 1],
    ['"title"', 'string', 1],
    ['image][', 'link'],
    ['asset]', 'literal'],
    ['user@example.test', 'link'],
    ['user@example.test>', 'punctuation', 'user@example.test'.length],
    ['/image.png', 'link'],
    ['image title', 'string'],
    ['\\*', 'escape'],
    ['const x = 42', 'string'],
    ['strike', ''],
    ['Later prose', '']
  ]);
});

test('keeps list bodies transparent and clears quote color inside embedded code', () => {
  assertKinds(markdownCases[1].text, [
    ['> quoted', 'punctuation'],
    ['quoted', 'comment'],
    ['code', 'string'],
    ['- item', 'keyword'],
    ['item [', 'comment'],
    ['label', 'link'],
    ['continuation', 'comment'],
    ['"count"', 'property'],
    ['42}', 'number'],
    ['after quote', ''],
    ['1.', 'keyword'],
    ['numbered item', ''],
    ['unnumbered item', ''],
    ['child', ''],
    [':---', 'punctuation'],
    ['GPU', 'link'],
    ['`42`', 'string', 1],
    ['After table', '']
  ]);
});

test('keeps HTML embeddings through blank lines and recovers following Markdown', () => {
  assertKinds(markdownCases[2].text, [
    ['script>', 'tag'],
    ['const value', 'keyword'],
    ['42;', 'number'],
    ['// comment', 'comment'],
    ['const broken', 'keyword'],
    ['after script', ''],
    ['.item', 'selector'],
    ['color:', 'property'],
    ['red;', 'literal'],
    ['/* comment */', 'comment'],
    ['pre>', 'tag'],
    ['&amp;', 'escape'],
    ['continued -->', 'comment'],
    ['class=', 'attribute'],
    ['"card"', 'string'],
    ['Inline', ''],
    ['em>', 'tag'],
    ['`raw`', 'string', 1]
  ]);
});

test('embeds every supported fenced language without parsing the opening info as code', () => {
  assertKinds(markdownCases[4].text, [
    ['echo', 'builtin'],
    ['$USER', 'variable'],
    ['.item', 'selector'],
    ['func', 'keyword'],
    ['read()', 'function'],
    ['div', 'tag'],
    ['const value =', 'keyword'],
    ['42}`', 'number'],
    ['"count"', 'property'],
    ['def', 'keyword'],
    ['return', 'keyword'],
    ['$ echo', 'meta'],
    ['output', ''],
    ['toml\n', ''],
    ['enabled =', 'property'],
    ['true', 'literal'],
    ['number =', 'type'],
    ['node key', 'tag'],
    ['key=', 'attribute'],
    ['enabled:', 'property']
  ]);
});

test('fence aliases select compiled embedded states independently of the public registry', () => {
  for (const [name, text, needle, kind] of [
    ['js', 'const count = 42;', 'const', 'keyword'],
    ['PY', 'def read():\n    return 42', 'def', 'keyword'],
    ['yml', 'count: 42', 'count', 'property'],
    ['ts', 'const count: number = 42;', 'number', 'type'],
    ['sh', 'echo "$USER"', 'echo', 'builtin'],
    ['console', '$ echo "$USER"\noutput', '$', 'meta']
  ]) {
    assertKinds(`\`\`\`${name}\n${text}\n\`\`\``, [[needle, kind]]);
  }
});

test('uses minimum fence width and matching marker characters with nested Markdown', () => {
  assertKinds(markdownCases[3].text, [
    ['## nested', 'keyword'],
    ['"count"', 'property'],
    ['42}', 'number'],
    ['const plain', 'string'],
    ['```\n~~~~', 'string'],
    ['~~~~\n', 'punctuation'],
    ['after fences', '']
  ]);
  assertKinds('````json\n{"open":"unfinished\n```\n~~~\n`````\n# recovered', [
    ['```\n~~~', 'string'],
    ['~~~', 'string'],
    ['`````', 'punctuation'],
    ['# recovered', 'keyword']
  ]);
});

test('recognizes YAML frontmatter only at document start and hard closes YAML strings', () => {
  assertKinds('---\nname: "unfinished\n...\n# recovered\n\n---\nname: plain', [
    ['name:', 'property'],
    ['unfinished', 'string'],
    ['...', 'punctuation'],
    ['# recovered', 'keyword'],
    ['name: plain', '']
  ]);
  assertKinds('\n---\nname: plain', [['name: plain', '']]);
});

test('uses the explicit stack for deeply nested Markdown labels and URL parentheses', () => {
  const text =
    '['.repeat(1500) + 'label' + ']'.repeat(1500) + '(' + '('.repeat(1500) + 'url' + ')'.repeat(1501) + ' after';
  assertKinds(text, [
    ['label', 'link'],
    ['url', 'link'],
    ['after', '']
  ]);
});

test('compiles all supported Markdown embeddings without mutating grammar input', () => {
  assert.equal(JSON.stringify([grammar, related]), before);
});

for (const sample of markdownCases) {
  test(`${sample.name} preserves ordered ranges across representations and checkpoints`, () => {
    const expected = scanners[0](sample.text);
    let previousEnd = 0;
    for (const [start, end, kind] of expected) {
      assert.ok(start >= previousEnd && end > start && end <= sample.text.length);
      assert.ok(categories[kind]);
      previousEnd = end;
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
    }
  });
  test(`${sample.name} preserves full-scan semantics through sequential edits`, () => {
    for (const scan of scanners) {
      let document = createDocument(scan, sample.text, 2);
      let seed = 314159;
      const random = () => (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296;
      const pieces = ['\n', ']', '(', '"', '`', '42', '>', '', '# heading'];
      for (let i = 0; i < 30; i++) {
        const start = Math.floor(random() * (document.text.length + 1));
        const end = Math.min(document.text.length, start + Math.floor(random() * 3));
        document = editDocument(scan, document, start, end, pieces[Math.floor(random() * pieces.length)]);
        assert.deepEqual(document.ranges, scan(document.text));
      }
    }
  });
}
