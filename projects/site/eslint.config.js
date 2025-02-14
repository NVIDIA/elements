import js from '@eslint/js';
import { browserTypescriptConfig, appConfig } from '@nve-internals/eslint';

export default [
  {
    files: ['./src/**/*.ts'],
    rules: js.configs.recommended.rules
  },
  ...browserTypescriptConfig,
  ...appConfig
];
