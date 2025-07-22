import { resolve } from 'path';
import { mergeConfig } from 'vitest/config';
import { libraryNodeTestConfig } from '@internals/vite';

export default mergeConfig(libraryNodeTestConfig, {
  test: {
    include: ['./src/**/*.test.ts'],
    alias: { '@internals/metadata': resolve(import.meta.dirname, './src') },
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
        'src/tasks/metadata.av-infra.utils.ts'
      ]
    }
  }
});
