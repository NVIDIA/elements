import { libraryConfig, nodeTypescriptConfig, jsonConfig } from '@internals/eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...nodeTypescriptConfig,
  ...libraryConfig,
  ...jsonConfig,
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    rules: {
      'local-typescript/require-unit-test': 'off'
    }
  }
];
