import { resolve } from 'path';
import { mergeConfig } from 'vitest/config';
import { libraryTestConfig } from '@nve-internals/vite/configs/test.js';

const config = mergeConfig(libraryTestConfig, {
  root: import.meta.dirname,
  resolve: {
    alias: { '@nvidia-elements/forms': resolve(import.meta.dirname, './src') }
  },
  test: {
    include: ['./src/**/*.test.ts'],
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

config.test.setupFiles = [];

export default config;
