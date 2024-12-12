import js from '@eslint/js';
import { browserTypescriptConfig } from '@internals/eslint';

export default [js.configs.recommended, ...browserTypescriptConfig];
