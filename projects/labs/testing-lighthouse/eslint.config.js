import js from '@eslint/js';
import { libraryConfig, nodeTypescriptConfig } from '@internals/eslint';

export default [js.configs.recommended, ...nodeTypescriptConfig, ...libraryConfig];
