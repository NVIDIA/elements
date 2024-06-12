import { resolve } from 'path';
import { mergeConfig } from 'vitest/config';
import { libraryTestConfig } from '@internals/vite';

export default mergeConfig(libraryTestConfig, {
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
});
