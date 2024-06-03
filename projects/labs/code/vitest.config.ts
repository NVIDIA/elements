import { resolve } from 'path';
import { defineConfig, mergeConfig } from 'vitest/config';
import { libraryTestConfig } from '@nve-internals/vite';

export default defineConfig(() => {
  const config = {
    test: {
      alias: { '@nvidia-elements/code': resolve(import.meta.dirname, './src') },
      coverage: {
        thresholds: {
          lines: 21,
          branches: 11,
          functions: 33,
          statements: 21
        }
      }
    }
  };

  return mergeConfig(libraryTestConfig, config);
});
