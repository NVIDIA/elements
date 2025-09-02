import {
  browserJavaScriptConfig,
  browserTypescriptConfig,
  libraryConfig,
  litConfig,
  elementsConfig
} from '@internals/eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...browserJavaScriptConfig,
  ...browserTypescriptConfig,
  ...libraryConfig,
  ...litConfig,
  ...elementsConfig
];
