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
        // excluding node operations that read/write to local file system
        'src/services/tests.service.ts',
        'src/tasks/metadata.ts',
        'src/tasks/metadata.utils.ts',
        'src/tasks/lighthouse.ts',
        'src/tasks/tests.ts',
        'src/tasks/releases.ts',
        'src/tasks/projects.ts',
        'src/tasks/api.ts',
        'src/tasks/api.utils.ts',
        'src/tasks/examples.ts',
        'src/tasks/examples.utils.ts',
        'src/tasks/wireit.ts'
      ]
    }
  }
});
