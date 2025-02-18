import { browserJavaScriptConfig, browserTypescriptConfig, appConfig } from '@internals/eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [...browserJavaScriptConfig, ...browserTypescriptConfig, ...appConfig];
