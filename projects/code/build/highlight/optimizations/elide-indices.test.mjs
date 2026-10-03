// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import assert from 'node:assert/strict';
import test from 'node:test';
import { compileGrammar } from '../compile.mjs';
import { compileLanguages } from '../generate.mjs';
import { elideIndices } from './elide-indices.mjs';
import { createDocument, editDocument } from '../../../src/code-textarea/internal/incremental.mjs';
import { machineCases } from '../../../tests/highlight/fixtures/machine-corpus.mjs';
import { createScanner } from '../../../src/internal/highlight/scanner.mjs';

for (const nativeCase of [false, true]) {
  const compiled = await compileLanguages(nativeCase);
  for (const { language, machine } of compiled) {
    test(`${language} index elision preserves ${nativeCase ? 'native' : 'portable'} captures, state and edits`, () => {
      const before = JSON.stringify(machine);
      const optimized = elideIndices(machine);
      assert.deepEqual(elideIndices(optimized), optimized);
      assert.equal(JSON.stringify(machine), before);
      assert.strictEqual(optimized.states, machine.states);
      assert.strictEqual(optimized.rules, machine.rules);
      assert.ok(optimized.expressions.some(entry => entry[1] & 2));
      const expected = createScanner(machine);
      const actual = createScanner(optimized);
      for (const sample of machineCases.filter(sample => sample.language === language)) {
        const checkpoints = [];
        assert.deepEqual(actual(sample.text, undefined, checkpoints), expected(sample.text), sample.name);
        for (const checkpoint of checkpoints)
          assert.deepEqual(actual(sample.text, checkpoint), expected(sample.text, checkpoint), sample.name);
        let document = createDocument(actual, sample.text, 2);
        for (const insertion of ['\n', '42', '', '"', '}', '/*']) {
          const start = Math.floor(document.text.length / 2);
          document = editDocument(actual, document, start, Math.min(start + 1, document.text.length), insertion);
          assert.deepEqual(document.ranges, expected(document.text), sample.name);
        }
      }
    });
  }
}

test('keeps capture indices for partial captures and omits them for whole matches and static ends', () => {
  const machine = compileGrammar(
    {
      patterns: [
        { match: '(x)(y)', captures: { 1: { name: 'keyword' }, 2: { name: 'number' } } },
        {
          begin: '"',
          end: '"',
          contentName: 'string',
          beginCaptures: { 0: { name: 'punctuation' } },
          endCaptures: { 0: { name: 'punctuation' } }
        }
      ]
    },
    [],
    { shared: true, compact: true }
  );
  const optimized = elideIndices(machine);
  assert.equal(optimized.expressions[optimized.states[0][0]][1] & 2, 0);
  assert.ok(optimized.expressions.some(entry => entry[1] & 2));
  const flags = new Set();
  const execute = RegExp.prototype.exec;
  try {
    RegExp.prototype.exec = function (text) {
      flags.add(this.flags);
      return execute.call(this, text);
    };
    assert.deepEqual(createScanner(optimized)('xy "text"'), createScanner(machine)('xy "text"'));
  } finally {
    RegExp.prototype.exec = execute;
  }
  assert.ok(flags.has('gmu'));
  assert.ok(flags.has('dgmu'));
});

test('keeps reused phase-end captures conservative and rejects other machine formats', () => {
  const machine = {
    states: [[0, [1, 0]]],
    ruleMask: 1,
    rules: [
      [1, 0, 1, [], -2, []],
      [4, 0, 1, [], 0, [1, 1]]
    ],
    expressions: [
      ['x', 0],
      ['(y)', 0]
    ]
  };
  const optimized = elideIndices(machine);
  assert.equal(optimized.expressions[1][1] & 2, 0);
  assert.throws(() => elideIndices({ states: [], rules: [] }), /indexed compact/);
});
