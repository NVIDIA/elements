import js from '@eslint/js';
import { browserTypescriptConfig, libraryConfig, litConfig } from '@nve-internals/eslint';

export default [js.configs.recommended, ...browserTypescriptConfig, ...libraryConfig, ...litConfig];
