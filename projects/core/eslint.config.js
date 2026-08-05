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
  {
    files: ['src/bundle.ts'],
    rules: {
      'local/no-missing-bundle-registration': ['error'],
      'local/no-missing-bundle-test': [
        'error',
        {
          lighthouseTestFile: 'index.test.lighthouse.ts'
        }
      ]
    }
  },
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
    files: ['src/**/*.test.visual.ts'],
    rules: {
      '@nvidia-elements/lint/no-missing-gap-space': ['off']
    }
  },
  {
    files: ['src/alert/alert-group.test.visual.ts'],
    rules: {
      '@nvidia-elements/lint/no-restricted-container-full': ['off']
    }
  },
  {
    files: ['src/button/button.test.visual.ts'],
    rules: {
      '@nvidia-elements/lint/no-excessive-primary-actions': ['off']
    }
  },
  {
    files: [
      'src/format-datetime/format-datetime.ts',
      'src/format-number/format-number.ts',
      'src/format-relative-time/format-relative-time.ts'
    ],
    rules: {
      'local/require-test-completeness': ['error', { skipSuffixes: ['.test.visual.ts'] }]
    }
  }
];
