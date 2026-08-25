import { libraryTestConfig } from './test.js';

/** @type {import('vite').UserConfig} */
export const libraryBenchConfig = {
  ...libraryTestConfig,
  cacheDir: 'node_modules/.vite-bench',
  test: {
    ...libraryTestConfig.test,
    benchmark: {
      include: ['./src/**/*.test.bench.ts']
    }
  }
};
