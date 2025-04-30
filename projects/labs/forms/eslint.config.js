import { browserJavaScriptConfig, browserTypescriptConfig, libraryConfig, litConfig } from '@internals/eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [...browserJavaScriptConfig, ...browserTypescriptConfig, ...libraryConfig, ...litConfig];
