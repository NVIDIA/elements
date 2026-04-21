import { nodeTypescriptConfig, jsonConfig } from '@internals/eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...nodeTypescriptConfig,
  ...jsonConfig,
  {
    files: ['src/**/service.ts'],
    rules: {
      // @tool decorated methods include inline schema metadata that inflates line count
      'max-lines-per-function': 'off'
    }
  }
];
