import { defineConfig } from 'vitest/config';
import path from 'path';

const resolve = (rel) => path.resolve(process.cwd(), rel);

export default defineConfig({
  logLevel: 'info',
  resolve: {
    alias: {
      'elements-lighthouse': resolve('./.lighthouse'),
    }
  },
  test: {
    threads: false,
    setupFiles: ['./.lighthouse/setup.ts'],
    include: [
      process.env.LIGHTHOUSE_ALL ? 'src/**/*.test.lighthouse.ts' : 'src/index.test.lighthouse.ts'
    ],
    testTimeout: 20000,
    watchExclude: ['**/node_modules/**'],
    // Default includes '.cache' which fails under Bazel as its sandbox lives in such a folder.
    exclude: ['**/node_modules/**'],
    server: {
      deps: {
        external: ['**/node_modules/**']
      }
    }
  },
});