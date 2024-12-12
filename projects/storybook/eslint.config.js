import js from '@eslint/js';
import { browserTypescriptConfig } from '@nve-internals/eslint';

export default [js.configs.recommended, ...browserTypescriptConfig];
