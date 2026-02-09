import { resolve } from 'path';
import { mergeConfig } from 'vitest/config';
import { libraryAxeTestConfig } from '@internals/vite/configs/axe.js';

// currently disabled in ci likely due to this issue https://github.com/vitest-dev/vitest/issues/8447
export default mergeConfig(libraryAxeTestConfig, {
  root: import.meta.dirname,
  resolve: {
    alias: { '@nvidia-elements/monaco': resolve(import.meta.dirname, './src') }
  },
  test: {
    include: ['./src/**/*.test.axe.ts'],
    isolate: true,
    maxConcurrency: 1,
    fileParallelism: false,
    outputFile: {
      junit: './coverage/axe/junit.xml'
    }
  }
});
