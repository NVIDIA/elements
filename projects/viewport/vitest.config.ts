import { resolve } from 'path';
import { mergeConfig } from 'vitest/config';
import { libraryTestConfig } from '@internals/vite/configs/test.js';

const config = mergeConfig(libraryTestConfig, {
  root: import.meta.dirname,
  resolve: {
    alias: { '@nvidia-elements/viewport': resolve(import.meta.dirname, './src') }
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

export default config;
