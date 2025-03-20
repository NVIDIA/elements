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
        branches: 80,
        functions: 90,
        statements: 90
      },
      exclude: [
        // excluding node operations that write to local file system
        'src/node/metadata.ts',
        'src/node/lighthouse.ts',
        'src/node/elements.ts',
        'src/node/elements.utils.ts'
      ]
    }
  }
});
