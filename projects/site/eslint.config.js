import { browserJavaScriptConfig, browserTypescriptConfig, appConfig, htmlConfig } from '@internals/eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [...browserJavaScriptConfig, ...browserTypescriptConfig, ...appConfig, ...htmlConfig];
