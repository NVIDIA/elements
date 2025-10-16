import { resolve } from 'path';
import { mergeConfig } from 'vitest/config';
import { libraryTestConfig } from '@internals/vite/configs/test.js';

export default mergeConfig(libraryTestConfig, {
  root: import.meta.dirname,
  resolve: {
    alias: { '@nvidia-elements/core': resolve(import.meta.dirname, './src') }
  },
  test: {
    include: ['./src/**/*.test.ts'],
    coverage: {
      exclude: [
        '**/docs/**',
        '**/polyfills/**',
        '**/index.js',
        '**/src/index.ts',
        '**/src/icon/icons/**',
        '**/src/icon/icons.ts',
        '**/src/icon/server.ts',
        '**/src/internal/controllers/type-ssr.controller.ts',
        '**/internal/docs.ts'
      ]
    }
  }
});
