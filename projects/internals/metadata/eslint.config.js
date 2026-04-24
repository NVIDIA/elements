import { nodeTypescriptConfig, jsonConfig } from '@internals/eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...nodeTypescriptConfig,
  ...jsonConfig,
  {
    files: ['src/**/*.ts'],
    ignores: ['**/*.test.ts', '**/*.test.*.ts', '**/*.examples.ts'],
    rules: {
      // enable these rules incrementally as the codebase is cleaned up
      complexity: 'off',
      'max-statements': 'off',
      'max-lines-per-function': 'off'
    }
  }
];
