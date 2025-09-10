import { resolve } from 'path';
import { mergeConfig } from 'vitest/config';
import { libraryNodeTestConfig } from '@nve-internals/vite';

export default mergeConfig(libraryNodeTestConfig, {
  test: {
    include: ['./src/**/*.test.ts'],
    alias: { '@nvidia-elements/lint': resolve(import.meta.dirname, './src') },
    coverage: {
      thresholds: {
        lines: 0,
        branches: 0,
        functions: 0,
        statements: 0
      }
    }
  }
});
