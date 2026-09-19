import { mergeConfig } from 'vitest/config';
import { libraryNodeTestConfig } from '@internals/vite/configs/test.node.js';

export default mergeConfig(libraryNodeTestConfig, {
  root: import.meta.dirname,
  test: {
    include: ['./src/**/*.test.ts'],
    coverage: {
      exclude: ['src/scripts/**'],
      thresholds: {
        lines: 90,
        branches: 90,
        functions: 90,
        statements: 90
      }
    }
  }
});
