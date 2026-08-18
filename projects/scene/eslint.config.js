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
    rules: {
      'local/primitive-property': 'off',
      'local-typescript/example-template-size': 'off'
    }
  }
];
