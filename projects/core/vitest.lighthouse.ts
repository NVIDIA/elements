import { resolve } from 'path';
import { mergeConfig } from 'vitest/config';
import { libraryLighthouseTestConfig } from '@internals/vite/configs/lighthouse.js';

export default mergeConfig(libraryLighthouseTestConfig, {
  resolve: {
    alias: { '@nvidia-elements/core': resolve(import.meta.dirname, './dist') }
  },
  test: {
    include: ['src/**/*.test.lighthouse.ts'],
    outputFile: {
      junit: './coverage/lighthouse/junit.xml'
    }
  }
});
