import { resolve } from 'path';
import { mergeConfig } from 'vitest/config';
import { libraryNodeTestConfig } from '@nve-internals/vite/configs/test.node.js';

export default mergeConfig(libraryNodeTestConfig, {
  root: import.meta.dirname,
  resolve: {
    alias: { '@nve-internals/tools': resolve(import.meta.dirname, './src') }
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
