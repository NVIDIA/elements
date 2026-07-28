import { nodeJavaScriptConfig } from '@internals/eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...nodeJavaScriptConfig,
  {
    files: ['src/design-md.js'],
    rules: {
      'max-lines': 'off',
      'max-lines-per-function': 'off'
    }
  }
];
