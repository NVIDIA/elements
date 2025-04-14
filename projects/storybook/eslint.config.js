import { browserJavaScriptConfig, browserTypescriptConfig, htmlConfig } from '@internals/eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [...browserJavaScriptConfig, ...browserTypescriptConfig, ...htmlConfig];
