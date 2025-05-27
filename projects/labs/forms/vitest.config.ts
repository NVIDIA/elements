import { resolve } from 'path';
import { mergeConfig } from 'vitest/config';
import { libraryTestConfig } from '@internals/vite';

export default mergeConfig(libraryTestConfig, {
  test: {
    include: ['./src/**/*.test.ts'],
    alias: { '@nvidia-elements/forms': resolve(import.meta.dirname, './src') },
    setupFiles: [],
    coverage: {
      thresholds: {
        lines: 96,
        branches: 93,
        functions: 95,
        statements: 95
      }
    }
  }
});
