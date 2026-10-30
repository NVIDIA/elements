import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Linter } from 'eslint';
import parser from '@typescript-eslint/parser';
import { libraryConfig } from './library.js';

const linter = new Linter();
const config = [{ files: ['**/*.ts'], languageOptions: { parser } }, ...libraryConfig];
const source = `
  import { renderRunner } from '@internals/vite';
  import { observePopover } from '@internals/testing/render';
  import type { RenderOptions } from '@internals/vite';
`;

test('allows internal runner, browser utility, and type imports in render tests', () => {
  for (const filename of ['src/dropdown/dropdown.test.render.ts', 'src/test/render-utils.test.render.ts']) {
    assert.deepEqual(linter.verify(source, config, { filename }), [], filename);
  }
});

test('keeps the same internal imports restricted in published source', () => {
  for (const filename of ['src/dropdown/dropdown.ts', 'src/internal/render.ts']) {
    const messages = linter.verify(source, config, { filename });
    assert.equal(messages.length, 3, filename);
    for (const message of messages) {
      assert.equal(message.severity, 2);
      assert.match(message.ruleId, /\/no-restricted-imports$/);
      assert.match(message.message, /Repository internal utilities and libraries cannot be used in published packages/);
    }
  }
});
