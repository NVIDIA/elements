import { resolve } from 'path';
import { mergeConfig } from 'vitest/config';
import { libraryTestConfig } from '@internals/vite/configs/test.js';

const config = mergeConfig(libraryTestConfig, {
  root: import.meta.dirname,
  resolve: {
    alias: { '@nvidia-elements/markdown': resolve(import.meta.dirname, './src') }
  },
  test: {
    include: ['./src/**/*.test.ts'],
    setupFiles: [],
    coverage: {
      thresholds: {
        lines: 97,
        branches: 92,
        functions: 87,
        statements: 95
      }
    }
  }
});

config.test.setupFiles = [];

export default config;
