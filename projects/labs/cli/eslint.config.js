import { nodeJavaScriptConfig, nodeTypescriptConfig } from '@internals/eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [...nodeJavaScriptConfig, ...nodeTypescriptConfig];
