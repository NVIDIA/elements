import { resolve } from 'node:path';
import { mergeConfig } from 'vitest/config';
import { libraryLitSSRTestConfig } from '@internals/vite/configs/ssr.js';

export default mergeConfig(libraryLitSSRTestConfig, {
  resolve: { alias: { '@nvidia-elements/code': resolve(import.meta.dirname, './src') } },
  test: { testTimeout: 30_000, include: ['src/**/*.test.ssr.ts'] }
});
