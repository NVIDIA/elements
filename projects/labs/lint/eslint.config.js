import { nodeTypescriptConfig, libraryConfig } from '@nve-internals/eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [...nodeTypescriptConfig, ...libraryConfig];
