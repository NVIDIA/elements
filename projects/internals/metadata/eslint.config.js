import { nodeTypescriptConfig } from '@internals/eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...nodeTypescriptConfig,
  {
    files: ['src/**/*.ts'],
    ignores: ['**/*.test.ts', '**/*.test.*.ts', '**/*.examples.ts'],
    rules: {
      complexity: 'off' // todo
    }
  }
];
