import { browserJavaScriptConfig, browserTypescriptConfig } from '@nve-internals/eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [...browserJavaScriptConfig, ...browserTypescriptConfig];
