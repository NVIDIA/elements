import { nodeTypescriptConfig } from '@internals/eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...nodeTypescriptConfig,
  {
    files: ['src/tools.ts'],
    rules: {
      'max-params': 'off'
    }
  }
];
