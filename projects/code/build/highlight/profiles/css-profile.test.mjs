// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import assert from 'node:assert/strict';
import test from 'node:test';
import { compileGrammar, loadGrammar } from '../compile.mjs';
import { cssProfile } from './css-profile.mjs';
import { createScanner } from '../../../src/internal/highlight/scanner.mjs';
import { createDocument, editDocument } from '../../../src/code-textarea/internal/incremental.mjs';
import { cssCases } from '../../../tests/highlight/fixtures/corpus.mjs';

const source = await loadGrammar('@shikijs/langs/css');
const vocabulary = [
  ...source.repository['property-keywords'].patterns,
  ...source.repository['color-keywords'].patterns
];
const unfactored = vocabulary.map(rule => ({ ...rule, name: 'constant.language.css' }));

// Enumerate this pinned grammar's vocabulary independently of the compiler's
// finite-pattern parser. Keep the original regex rules as the matching oracle.
const candidates = new Set([
  'large',
  'larger',
  'repeat-x',
  'repeat-y',
  'ethiopic-halehame-ti-er',
  'ethiopic-halehame-ti-et'
]);
for (const rule of vocabulary) {
  for (const word of rule.match.matchAll(/[-A-Za-z0-9]+/g)) candidates.add(word[0]);
}

for (const nativeCase of [false, true]) {
  test(`CSS vocabulary preserves original matches and boundaries (${nativeCase ? 'native' : 'portable'} case)`, () => {
    const before = JSON.stringify(source);
    const profile = cssProfile(source);
    const rules = profile.repository['value-vocabulary'].patterns;
    assert.equal(rules.length, 2, 'finite vocabulary and the unchanged vendor pattern');
    const scan = patterns =>
      createScanner(compileGrammar({ patterns }, [], { nativeCase, shared: true, compact: true }));
    const expected = scan(unfactored);
    const actual = scan(rules);
    for (const word of candidates) {
      for (const text of [
        word,
        word.toUpperCase(),
        `.${word},`,
        `-${word}`,
        `${word}-suffix`,
        `prefix${word}`,
        `${word}π`
      ]) {
        assert.deepEqual(actual(text), expected(text), text);
      }
    }
    for (const text of [
      '-webkit-something',
      '-mso-foo',
      'prince-test',
      'repeat-z',
      'largerr',
      'ethiopic-halehame-ti-ex'
    ]) {
      assert.deepEqual(actual(text), expected(text), text);
    }
    assert.equal(JSON.stringify(source), before);
  });

  test(`CSS factoring keeps region state, checkpoint resumes, and edits (${nativeCase ? 'native' : 'portable'} case)`, () => {
    const profile = cssProfile(source);
    const reference = cssProfile(source);
    reference.repository['value-vocabulary'].patterns = unfactored;
    const options = { nativeCase, shared: true, compact: true };
    const actual = createScanner(compileGrammar(profile, [], options));
    const expected = createScanner(compileGrammar(reference, [], options));
    const texts = [
      ...cssCases.map(sample => sample.text),
      `.x{\n${[...candidates].map(word => `color:${word};`).join('\n')}\n}`
    ];
    for (const text of texts) {
      const checkpoints = [];
      assert.deepEqual(actual(text, undefined, checkpoints), expected(text));
      for (const checkpoint of checkpoints) assert.deepEqual(actual(text, checkpoint), expected(text, checkpoint));
      let document = createDocument(actual, text, 2);
      for (const [needle, insert] of [
        ['color', 'background'],
        [';', '-suffix;'],
        ['\n', '\n/* comment */\n'],
        ['}', '']
      ]) {
        const start = document.text.indexOf(needle);
        if (start < 0) continue;
        document = editDocument(actual, document, start, start + needle.length, insert);
        assert.deepEqual(document.ranges, expected(document.text));
      }
    }
  });
}

test('CSS factoring leaves unsupported patterns and capture rules intact', () => {
  const grammar = structuredClone(source);
  const patterns = grammar.repository['property-keywords'].patterns;
  const extra = [
    { match: '(?i)(?<![-\\w])(foo.+|bar)(?![-\\w])' },
    { match: '(?i)(?<![-\\w])(foo[a-z]|bar)(?![-\\w])' },
    { match: '(?i)(?<![-\\w])(foo|)(?![-\\w])' },
    { match: '(?i)(?<![-\\w])(foo|bar)(?![-\\w])', captures: { 1: { name: 'constant.language.css' } } }
  ];
  patterns.push(...extra);
  const result = cssProfile(grammar).repository['value-vocabulary'].patterns;
  for (const rule of extra)
    assert.deepEqual(
      result.find(entry => entry.match === rule.match),
      { ...rule, name: 'constant.language.css' }
    );
});
