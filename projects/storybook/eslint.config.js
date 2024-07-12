import js from '@eslint/js';
import { libraryConfig, browserTypescriptConfig } from '@internals/eslint';

export default [js.configs.recommended, ...browserTypescriptConfig, ...libraryConfig];
