import { browserJavaScriptConfig, browserTypescriptConfig, appConfig } from '@nve-internals/eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [...browserJavaScriptConfig, ...browserTypescriptConfig, ...appConfig];
