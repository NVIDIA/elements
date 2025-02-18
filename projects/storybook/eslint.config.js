import { browserJavaScriptConfig, browserTypescriptConfig } from '@internals/eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [...browserJavaScriptConfig, ...browserTypescriptConfig];
