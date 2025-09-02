import { resolve } from 'path';
import { mergeConfig } from 'vitest/config';
import { libraryTestConfig } from '@nve-internals/vite';

const config = mergeConfig(libraryTestConfig, {
  test: {
    include: ['./src/**/*.test.ts'],
    alias: { '@nvidia-elements/markdown': resolve(import.meta.dirname, './src') },
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
