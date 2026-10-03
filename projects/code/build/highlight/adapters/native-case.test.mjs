// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import assert from 'node:assert/strict';
import test from 'node:test';
import { compileGrammar } from '../compile.mjs';
import { compileLanguages, generateLanguages } from '../generate.mjs';
import { categories } from '../../../src/internal/highlight/categories.mjs';
import { createScanner } from '../../../src/internal/highlight/scanner.mjs';
import { createDocument, editDocument } from '../../../src/code-textarea/internal/incremental.mjs';
import {
  scriptCases,
  yamlCases,
  tomlCases,
  pythonCases,
  cssCases,
  markupCases,
  goCases
} from '../../../tests/highlight/fixtures/corpus.mjs';
import { bashCases, shellCases } from '../../../tests/highlight/fixtures/bash-corpus.mjs';
import { pythonProfileCases } from '../../../tests/highlight/fixtures/python-corpus.mjs';
import { markdownCases } from '../../../tests/highlight/fixtures/markdown-corpus.mjs';

const portable = await compileLanguages();
const native = await compileLanguages(true);
const samples = [
  ...scriptCases,
  ...yamlCases,
  ...tomlCases,
  ...pythonCases,
  ...cssCases,
  ...markupCases,
  ...goCases,
  ...bashCases,
  ...shellCases,
  ...markdownCases,
  ...pythonProfileCases.map(sample => ({ ...sample, language: 'python' })),
  { language: 'json', text: '{"GPU": [42, true, null, "\\u1234"]}\n{}' }
];
for (const [index, { language, machine }] of native.entries())
  test(`${language} native case modifiers preserve corpus ranges, checkpoints and edits`, () => {
    const original = createScanner(portable[index].machine);
    const scan = createScanner(machine);
    for (const { text } of samples.filter(sample => sample.language === language)) {
      const expected = original(text);
      const checkpoints = [];
      assert.deepEqual(scan(text, undefined, checkpoints), expected);
      for (const checkpoint of checkpoints)
        assert.deepEqual(
          scan(text, checkpoint),
          expected
            .filter(([, end]) => end > checkpoint[0])
            .map(([start, end, kind]) => [Math.max(start, checkpoint[0]), end, kind])
        );
      let document = createDocument(scan, text, 2);
      for (const piece of ['\n', '42', '', '"', '}', '/*']) {
        const start = Math.floor(document.text.length / 2);
        document = editDocument(scan, document, start, Math.min(start + 1, document.text.length), piece);
        assert.deepEqual(document.ranges, original(document.text));
      }
    }
  });

function kinds(grammar, text) {
  const scan = createScanner(compileGrammar(grammar, undefined, { shared: true, compact: true, nativeCase: true }));
  const result = Array(text.length).fill('');
  for (const [start, end, category] of scan(text)) result.fill(categories[category], start, end);
  return result;
}

test('scoped modifiers do not leak into adjacent alternatives, nested captures or backreferences', () => {
  const grammar = {
    patterns: [
      { match: '(?i:(a)\\1)', name: 'string' },
      { match: '(?i:foo(?-i:Bar))', name: 'number' },
      { match: 'const', name: 'keyword' }
    ]
  };
  const text = 'aA FOOBar fooBAR CONST const';
  const result = kinds(grammar, text);
  assert.deepEqual(result.slice(0, 2), ['string', 'string']);
  assert.equal(result[text.indexOf('FOOBar')], 'number');
  assert.equal(result[text.indexOf('fooBAR')], '');
  assert.equal(result[text.indexOf('CONST')], '');
  assert.equal(result[text.indexOf('const')], 'keyword');
});

test('native case folding supports Unicode literal classes without ASCII expansion', () => {
  const result = kinds({ patterns: [{ match: '(?i:[k]é)', name: 'storage.type' }] }, 'KÉ');
  assert.deepEqual(result, ['type', 'type']);
});

test('native case scopes preserve instantiated literal ends and while captures', () => {
  const grammar = {
    patterns: [
      { begin: '(?i:<(word)>)', end: '(?i:</\\1>)', contentName: 'string' },
      { begin: '^(>)[ ]', while: '(?i:\\1[ ]word)', contentName: 'comment' }
    ]
  };
  const text = '<WORD>first</word> tail\n> WORD\n> word second\nafter';
  const result = kinds(grammar, text);
  assert.equal(result[text.indexOf('first')], 'string');
  assert.equal(result[text.indexOf('tail')], '');
  assert.equal(result[text.indexOf('second')], 'comment');
  assert.equal(result[text.indexOf('after')], '');
});

test('does not silently map Oniguruma multiline mode to JavaScript multiline mode', () => {
  assert.throws(
    () => compileGrammar({ patterns: [{ match: '(?m:a.b)' }] }, undefined, { nativeCase: true }),
    /adapter/
  );
});

test('native case generation remains reproducible in both data layouts', async () => {
  for (const pooled of [false, true])
    assert.deepEqual(await generateLanguages(pooled, true), await generateLanguages(pooled, true));
});
