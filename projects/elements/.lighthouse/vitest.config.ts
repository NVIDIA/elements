import { defineConfig } from 'vitest/config';
import path from 'path';

const resolve = (rel) => path.resolve(process.cwd(), rel);

export default defineConfig({
  logLevel: 'info',
  resolve: {
    alias: {
      'elements-lighthouse': resolve('./'),
    }
  },
  test: {
    threads: false,
    setupFiles: ['./setup.ts'],
    include: ['../src/**/*.test.lighthouse.ts'],
    testTimeout: 20000,
    watchExclude: ['**/node_modules/**'],
    // Default includes '.cache' which fails under Bazel as its sandbox lives in such a folder.
    exclude: ['**/node_modules/**'],
    // CPU detection on CI fails due to K8s/Docker.
    maxThreads: 8,
    minThreads: 8,
    server: {
      deps: {
        external: ['**/node_modules/**']
      }
    }
  },
});