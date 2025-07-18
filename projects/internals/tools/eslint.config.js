import { nodeJavaScriptConfig, nodeTypescriptConfig } from '@nve-internals/eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [...nodeJavaScriptConfig, ...nodeTypescriptConfig];
