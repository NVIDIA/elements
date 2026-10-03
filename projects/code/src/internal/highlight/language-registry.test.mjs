// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import assert from 'node:assert/strict';
import test from 'node:test';
import { getScanner, registerLanguage } from './language-registry.mjs';

test('registration and scanner lookup defer native RegExp compilation until scanning', () => {
  const original = globalThis.RegExp;
  let calls = 0;
  globalThis.RegExp = class extends original {
    constructor(...args) {
      super(...args);
      calls++;
    }
  };
  try {
    registerLanguage('lazy', {
      expressions: [['(x)', 0]],
      states: [[0, [1, 0], -1, []]],
      rules: [[0, -1, 0, [0, 2]]],
      ruleMask: 0
    });
    const scan = getScanner('lazy');
    assert.equal(calls, 0);
    assert.deepEqual(scan('x'), [[0, 1, 2]]);
    assert.equal(calls, 1);
    assert.deepEqual(getScanner('lazy')('x'), [[0, 1, 2]]);
    assert.equal(calls, 1);
  } finally {
    globalThis.RegExp = original;
  }
});

test('lookup requires exact registered names and replacement registration resets the cache', () => {
  const machine = {
    expressions: [['(x)', 0]],
    states: [[0, [1, 0], -1, []]],
    rules: [[0, -1, 0, [0, 2]]],
    ruleMask: 0
  };
  registerLanguage('first', machine);
  const first = getScanner('first');
  assert.equal(getScanner('first'), first);
  assert.throws(() => getScanner('FIRST'), /Unknown language/);
  assert.throws(() => getScanner('shared'), /Unknown language/);
  registerLanguage('first', machine);
  assert.notEqual(getScanner('first'), first);
  assert.throws(() => getScanner('unregistered'), /Unknown language/);
});
