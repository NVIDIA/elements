import { browserJavaScriptConfig, browserTypescriptConfig, libraryConfig, litConfig } from '@internals/eslint';

litConfig[0].rules['@html-eslint/no-restricted-attrs'] = ['off']; // todo: enable

/** @type {import('eslint').Linter.Config[]} */
export default [...browserJavaScriptConfig, ...browserTypescriptConfig, ...libraryConfig, ...litConfig];
