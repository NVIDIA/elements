import { resolve } from 'path';
import { mergeConfig } from 'vitest/config';
import { libraryTestConfig } from '@internals/vite';

export default mergeConfig(libraryTestConfig, {
  test: {
    include: ['./src/**/*.test.ts'],
    alias: { '@nvidia-elements/monaco': resolve(import.meta.dirname, './src') },
    isolate: true,
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
