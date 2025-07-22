import { resolve } from 'path';
import { mergeConfig } from 'vitest/config';
import { libraryNodeTestConfig } from '@internals/vite';

export default mergeConfig(libraryNodeTestConfig, {
  test: {
    include: ['./src/**/*.test.ts'],
    alias: { '@internals/tools': resolve(import.meta.dirname, './src') },
    coverage: {
      thresholds: {
        lines: 40,
        branches: 40,
        functions: 40,
        statements: 40
      }
    }
  }
});
