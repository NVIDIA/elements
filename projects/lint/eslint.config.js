import { nodeTypescriptConfig, libraryConfig, jsonConfig } from '@internals/eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...nodeTypescriptConfig,
  ...libraryConfig,
  ...jsonConfig,
  {
    files: ['src/eslint/rules/**/*.ts', 'src/eslint/internals/**/*.ts'],
    rules: {
      // ESLint rule `create` methods and visitor handlers
      'max-lines-per-function': 'off'
    }
  }
];
