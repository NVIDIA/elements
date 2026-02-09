import { elementsRecommended } from '@nvidia-elements/lint/eslint';
import { browserTypescriptConfig, libraryConfig, litConfig, htmlConfig } from '@internals/eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...elementsRecommended,
  ...htmlConfig,
  ...browserTypescriptConfig,
  ...libraryConfig,
  ...litConfig,
  // Disable no-missing-popover-trigger globally, only enable for examples
  {
    rules: {
      '@nvidia-elements/lint/no-missing-popover-trigger': ['off']
    }
  },
  {
    files: ['src/**/*.examples.ts'],
    rules: {
      '@nvidia-elements/lint/no-missing-popover-trigger': ['error']
    }
  }
];
