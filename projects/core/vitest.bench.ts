import { resolve } from 'node:path';
import { mergeConfig } from 'vitest/config';
import { libraryBenchConfig } from '@internals/vite/configs/bench.js';

export default mergeConfig(libraryBenchConfig, {
  root: import.meta.dirname,
  resolve: {
    alias: { '@nvidia-elements/core': resolve(import.meta.dirname, './src') }
  }
});
