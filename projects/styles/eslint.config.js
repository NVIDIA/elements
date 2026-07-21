import { elementsRecommended } from '@nvidia-elements/lint/eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...elementsRecommended,
  {
    files: ['src/**/*.test.visual.ts', 'src/**/*.examples.ts'],
    rules: {
      '@nvidia-elements/lint/no-missing-gap-space': ['off']
    }
  }
];
