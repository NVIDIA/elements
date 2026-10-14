import { resolve } from 'path';
import { mergeConfig } from 'vitest/config';
import { libraryTestConfig } from '@internals/vite/configs/test.js';

export default mergeConfig(libraryTestConfig, {
  root: import.meta.dirname,
  resolve: {
    alias: { '@nvidia-elements/foundations': resolve(import.meta.dirname, './src') }
  },
  test: {
    include: ['./src/**/*.test.ts'],
    coverage: {
      thresholds: {
        lines: 90,
        branches: 90,
        functions: 90,
        statements: 90
      }
    }
  }
});
