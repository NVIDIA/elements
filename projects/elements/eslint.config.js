import { elementsRecommended } from '@nvidia-elements/lint/eslint';
import { browserTypescriptConfig, libraryConfig, litConfig, htmlConfig, cssConfig } from '@internals/eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...elementsRecommended,
  ...htmlConfig,
  ...browserTypescriptConfig,
  ...libraryConfig,
  ...litConfig,
  ...cssConfig,
  // Disable no-missing-popover-trigger globally, only enable for examples
  {
    rules: {
      '@nvidia-elements/lint/no-missing-popover-trigger': ['off'],
      complexity: 'off' // todo
    }
  },
  {
    files: ['src/**/*.examples.ts'],
    rules: {
      '@nvidia-elements/lint/no-missing-popover-trigger': ['error']
    }
  }
];
