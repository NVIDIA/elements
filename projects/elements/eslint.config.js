import {
  browserJavaScriptConfig,
  browserTypescriptConfig,
  libraryConfig,
  litConfig,
  htmlConfig,
  elementsConfig
} from '@nve-internals/eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...browserJavaScriptConfig,
  ...browserTypescriptConfig,
  ...libraryConfig,
  ...litConfig,
  ...htmlConfig,
  ...elementsConfig
];
