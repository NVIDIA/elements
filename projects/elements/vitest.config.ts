import { resolve } from 'path';
import { defineConfig, mergeConfig } from 'vitest/config';
import { libraryTestConfig } from '@nvidia-elements/vite';

export default defineConfig(() => {
  const config = {
    test: {
      alias: { '@nvidia-elements/core': resolve(import.meta.dirname, './src') },
      setupFiles: [resolve(import.meta.dirname, './src/test/setup.ts')],
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
  };

  return mergeConfig(config, libraryTestConfig);
});
