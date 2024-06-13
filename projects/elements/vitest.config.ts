import { resolve } from 'path';
import { mergeConfig } from 'vitest/config';
import { libraryTestConfig } from '@nve-internals/vite';

export default mergeConfig(libraryTestConfig, {
  test: {
    include: ['./src/**/*.test.ts'],
    alias: { '@nvidia-elements/core': resolve(import.meta.dirname, './src') },
    coverage: {
      exclude: [
        '**/docs/**',
        '**/polyfills/**',
        '**/index.js',
        '**/src/index.ts',
        '**/src/icon/icons/**',
        '**/src/icon/icons.ts',
        '**/internal/docs.ts'
      ]
    }
  }
});
