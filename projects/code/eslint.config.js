import { elementsRecommended } from '@nvidia-elements/lint/eslint';
import { browserTypescriptConfig, libraryConfig, litConfig, jsonConfig, performanceConfig } from '@internals/eslint';

/** @type {import('eslint').Linter.Config[]} */
export default [
  { ignores: ['src/internal/highlight/generated/**'] },
  ...elementsRecommended,
  ...browserTypescriptConfig,
  ...libraryConfig,
  ...litConfig,
  ...jsonConfig,
  ...performanceConfig,
  {
    files: ['src/**/*.test.bench.ts'],
    languageOptions: { parserOptions: { project: './tsconfig.eslint.json' } }
  },
  {
    files: ['src/internal/highlight/scanner.mjs', 'src/code-textarea/internal/incremental.mjs'],
    rules: {
      'local-performance/no-hot-path-buffer-allocation': 'error',
      'local-performance/no-hot-path-collection-allocation': 'error'
    }
  },
  {
    files: ['src/bundle.ts'],
    rules: {
      'local/no-missing-bundle-registration': ['error']
    }
  },
  {
    files: ['src/**/*.ts'],
    ignores: ['**/*.test.ts', '**/*.test.*.ts', '**/*.examples.ts'],
    rules: {
      'local/require-test-completeness': ['error', { skipSuffixes: ['.test.visual.ts', '.test.ssr.ts'] }]
    }
  }
];
