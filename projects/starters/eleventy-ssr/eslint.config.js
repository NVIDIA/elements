import { elementsRecommended } from '@nvidia-elements/lint/eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...elementsRecommended,
  {
    files: ['src/index.11ty.js'],
    rules: {
      '@nvidia-elements/lint/no-unexpected-slot-value': 'off'
    }
  }
];
