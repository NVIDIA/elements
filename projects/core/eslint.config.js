import { elementsRecommended } from '@nvidia-elements/lint/eslint';
import {
  browserTypescriptConfig,
  libraryConfig,
  litConfig,
  htmlConfig,
  cssConfig,
  jsonConfig
} from '@internals/eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...elementsRecommended,
  ...htmlConfig,
  ...browserTypescriptConfig,
  ...libraryConfig,
  ...litConfig,
  ...cssConfig,
  ...jsonConfig,
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
  },
  {
    files: ['src/format-datetime/format-datetime.ts', 'src/format-relative-time/format-relative-time.ts'],
    rules: {
      'local/require-test-completeness': ['error', { skipSuffixes: ['.test.visual.ts'] }]
    }
  }
];
