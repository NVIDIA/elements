import { libraryConfig, nodeTypescriptConfig, jsonConfig } from '@internals/eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [...nodeTypescriptConfig, ...libraryConfig, ...jsonConfig];
