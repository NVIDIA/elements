import { elementsRecommended } from '@nvidia-elements/lint/eslint';
import { browserTypescriptConfig, libraryConfig, litConfig } from '@internals/eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...elementsRecommended,
  ...browserTypescriptConfig,
  ...libraryConfig,
  ...litConfig,
  {
    files: ['src/**/*.ts'],
    ignores: ['**/*.test.ts', '**/*.test.*.ts', '**/*.examples.ts'],
    rules: {
      complexity: 'off' // todo
    }
  }
];
