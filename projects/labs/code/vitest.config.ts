import { resolve } from 'path';
import { mergeConfig } from 'vitest/config';
import { libraryTestConfig } from '@nve-internals/vite';

export default mergeConfig(libraryTestConfig, {
  test: {
    include: ['./src/**/*.test.ts'],
    alias: { '@nvidia-elements/code': resolve(import.meta.dirname, './src') },
    coverage: {
      thresholds: {
        lines: 90,
        branches: 87,
        functions: 90,
        statements: 90
      }
    }
  }
});
