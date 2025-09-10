import { nodeJavaScriptConfig, nodeTypescriptConfig, libraryConfig } from '@internals/eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [...nodeJavaScriptConfig, ...nodeTypescriptConfig, ...libraryConfig];
