import { resolve } from 'path';
import { mergeConfig } from 'vitest/config';
import { libraryTestConfig } from '@internals/vite';

export default mergeConfig(libraryTestConfig, {
  test: {
    include: ['./src/**/*.test.ts'],
    alias: { '@nvidia-elements/monaco': resolve(import.meta.dirname, './src') },
    coverage: {
      thresholds: {
        // todo: these all should be 90% or higher before release
        lines: 30,
        branches: 0,
        functions: 30,
        statements: 30
      }
    }
  }
});
