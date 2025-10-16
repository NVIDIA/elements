import { resolve } from 'path';
import { mergeConfig } from 'vitest/config';
import { libraryTestConfig } from '@nve-internals/vite/configs/test.js';

export default mergeConfig(libraryTestConfig, {
  root: import.meta.dirname,
  resolve: {
    alias: { '@nvidia-elements/monaco': resolve(import.meta.dirname, './src') }
  },
  test: {
    include: ['./src/**/*.test.ts'],
    isolate: true,
    maxConcurrency: 1,
    fileParallelism: false,
    coverage: {
      thresholds: {
        lines: 100,
        branches: 100,
        functions: 100,
        statements: 100
      },
      exclude: [
        'src/**/*.json', // ignore JSON files
        'src/vendor/**', // ignore vendored code
        'src/workers/*.ts' // ignore the re-exported web workers
      ]
    }
  }
});
