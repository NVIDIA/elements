import { elementsRecommended } from '@nvidia-elements/lint/eslint';
import { browserTypescriptConfig, libraryConfig, litConfig, jsonConfig, performanceConfig } from '@internals/eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...elementsRecommended,
  ...browserTypescriptConfig.map(config =>
    config.files?.includes('**/*.test.ts') ? { ...config, files: [...config.files, 'test/**/*.ts'] } : config
  ),
  ...performanceConfig,
  ...libraryConfig,
  ...litConfig,
  ...jsonConfig,
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    rules: {
      'local-typescript/no-internal-external-imports': 'error'
    }
  },
  {
    rules: {
      'local/primitive-property': 'off',
      'local-typescript/example-template-size': 'off'
    }
  }
];
