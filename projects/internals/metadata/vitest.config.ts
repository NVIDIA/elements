import { resolve } from 'path';
import { mergeConfig } from 'vitest/config';
import { libraryNodeTestConfig } from '@nve-internals/vite/configs/test.node.js';

export default mergeConfig(libraryNodeTestConfig, {
  root: import.meta.dirname,
  resolve: {
    alias: { '@nve-internals/metadata': resolve(import.meta.dirname, './src') }
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
        'src/tasks/metadata.av-infra.ts',
        'src/tasks/metadata.av-infra.utils.ts',
        'src/tasks/downloads.ts',
        'src/tasks/tests.ts',
        'src/tasks/usage.ts',
        'src/tasks/usage.utils.ts',
        'src/tasks/releases.ts',
        'src/tasks/examples.ts',
        'src/tasks/examples.utils.ts',
        'src/tasks/wireit.ts'
      ]
    }
  }
});
