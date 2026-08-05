import { elementsRecommended } from '@nvidia-elements/lint/eslint';
import { browserTypescriptConfig, libraryConfig, litConfig, jsonConfig } from '@internals/eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...elementsRecommended,
  ...browserTypescriptConfig,
  ...libraryConfig,
  ...litConfig,
  ...jsonConfig,
  {
    files: ['src/bundle.ts'],
    rules: {
      'local/no-missing-bundle-registration': ['error']
    }
  },
  {
    files: ['src/**/*.ts'],
    ignores: ['**/*.test.ts', '**/*.test.*.ts', '**/*.examples.ts'],
    rules: {
      'local/require-test-completeness': ['error', { skipSuffixes: ['.test.ssr.ts'] }]
    }
  }
];
