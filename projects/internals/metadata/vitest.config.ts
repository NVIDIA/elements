import { resolve } from 'path';
import { mergeConfig } from 'vitest/config';
import { libraryNodeTestConfig } from '@internals/vite/configs/test.node.js';

export default mergeConfig(libraryNodeTestConfig, {
  root: import.meta.dirname,
  resolve: {
    alias: { '@internals/metadata': resolve(import.meta.dirname, './src') }
  },
  test: {
    include: ['./src/**/*.test.ts'],
    coverage: {
      thresholds: {
        lines: 90,
        branches: 79,
        functions: 90,
        statements: 90
      },
      exclude: [
        // excluding node operations that write to local file system
        'src/tasks/metadata.ts',
        'src/tasks/lighthouse.ts',
        'src/tasks/metadata.av-infra.ts',
        'src/tasks/metadata.av-infra.utils.ts',
        'src/tasks/tests.ts',
        'src/tasks/usage.utils.ts'
      ]
    }
  }
});
