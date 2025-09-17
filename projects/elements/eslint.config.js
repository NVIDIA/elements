import { elementsRecommended } from '@nvidia-elements/lint/eslint';
import {
  browserJavaScriptConfig,
  browserTypescriptConfig,
  libraryConfig,
  litConfig,
  htmlConfig
} from '@nve-internals/eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...elementsRecommended,
  ...htmlConfig,
  ...browserJavaScriptConfig,
  ...browserTypescriptConfig,
  ...libraryConfig,
  ...litConfig
];
