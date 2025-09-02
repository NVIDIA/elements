import {
  browserJavaScriptConfig,
  browserTypescriptConfig,
  appConfig,
  htmlConfig,
  elementsConfig
} from '@nve-internals/eslint';

htmlConfig[0].rules['@html-eslint/element-newline'] = 'off'; // todo

/** @type {import('eslint').Linter.Config[]} */
export default [...browserJavaScriptConfig, ...browserTypescriptConfig, ...appConfig, ...htmlConfig, ...elementsConfig];
