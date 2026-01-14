import { elementsRecommended } from '@nvidia-elements/lint/eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: ['.output/**', '.nuxt/**', '.nitro/**', 'dist/**']
  },
  ...elementsRecommended
];
