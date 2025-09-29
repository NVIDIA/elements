import { elementsRecommended } from '@nvidia-elements/lint/eslint';
import { browserTypescriptConfig, libraryConfig, litConfig, htmlConfig } from '@internals/eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [...elementsRecommended, ...htmlConfig, ...browserTypescriptConfig, ...libraryConfig, ...litConfig];
