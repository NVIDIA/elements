import { resolve } from 'path';
import { mergeConfig } from 'vitest/config';
import { libraryLitSSRTestConfig } from '@internals/vite/configs/ssr.js';

export default mergeConfig(libraryLitSSRTestConfig, {
  resolve: {
    alias: { '@nvidia-elements/media': resolve(import.meta.dirname, './dist') }
  },
  test: {
    include: ['./src/**/*.test.ssr.ts'],
    outputFile: {
      junit: './coverage/ssr/junit.xml'
    }
  }
});
