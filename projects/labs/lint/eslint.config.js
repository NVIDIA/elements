import { nodeTypescriptConfig, libraryConfig } from '@internals/eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [...nodeTypescriptConfig, ...libraryConfig];
