import {
  browserJavaScriptConfig,
  browserTypescriptConfig,
  libraryConfig,
  litConfig,
  elementsConfig
} from '@nve-internals/eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...browserJavaScriptConfig,
  ...browserTypescriptConfig,
  ...libraryConfig,
  ...litConfig,
  ...elementsConfig
];
