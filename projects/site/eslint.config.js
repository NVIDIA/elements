import { elementsRecommended } from '@nvidia-elements/lint/eslint';
import { browserJavaScriptConfig, browserTypescriptConfig, appConfig, htmlConfig } from '@nve-internals/eslint';

htmlConfig[0].rules['html/element-newline'] = 'off'; // todo

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...elementsRecommended,
  ...htmlConfig,
  ...browserJavaScriptConfig,
  ...browserTypescriptConfig,
  ...appConfig
];
