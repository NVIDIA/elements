import { browserJavaScriptConfig, browserTypescriptConfig, appConfig, htmlConfig } from '@nve-internals/eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [...browserJavaScriptConfig, ...browserTypescriptConfig, ...appConfig, ...htmlConfig];
