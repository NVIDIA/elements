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
    files: ['src/scroll-box/scroll-box.css'],
    rules: {
      // Scroll edge shadows use gradients.
      '@nvidia-elements/lint/no-custom-background-gradients': 'off'
    }
  }
];
