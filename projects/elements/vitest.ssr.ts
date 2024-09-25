import { resolve } from 'path';
import { mergeConfig } from 'vitest/config';
import { libraryLitSSRTestConfig } from '@nve-internals/vite';

export default mergeConfig(libraryLitSSRTestConfig, {
  test: {
    include: ['./src/**/*.test.ssr.ts'],
    alias: { '@nvidia-elements/core': resolve(import.meta.dirname, './dist') },
    outputFile: {
      junit: './coverage/ssr/junit.xml'
    }
  }
});
