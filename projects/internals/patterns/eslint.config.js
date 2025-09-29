import { elementsRecommended } from '@nvidia-elements/lint/eslint';
import { browserTypescriptConfig, libraryConfig, litConfig } from '@nve-internals/eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [...elementsRecommended, ...browserTypescriptConfig, ...libraryConfig, ...litConfig];
