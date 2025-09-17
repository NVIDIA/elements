import { elementsRecommended } from '@nvidia-elements/lint/eslint';
import { browserJavaScriptConfig, browserTypescriptConfig, libraryConfig, litConfig } from '@nve-internals/eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...elementsRecommended,
  ...browserJavaScriptConfig,
  ...browserTypescriptConfig,
  ...libraryConfig,
  ...litConfig
];
