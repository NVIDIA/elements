import { defineConfig } from 'vitest/config';
import path from 'path';
import process from 'process';

const resolve = (rel) => path.resolve(process.cwd(), rel);

export default defineConfig({
  test: {
    root: resolve('.'),
    alias: {
      'extensions-elements-starter': resolve(`./src`),
      'extensions-elements-starter/greeting': resolve(`./src/greeting`),
      'extensions-elements-starter/greeting/define.js': resolve(`./src/greeting/define.js`)
    },
    include: [resolve('./src/**/*.test.ts')],
    forceRerunTriggers: ['**/dist/**'],
    // Default includes '.cache' which fails under Bazel as its sandbox lives in such a folder.
    exclude: ['**/node_modules/**'],
    // CPU detection on CI fails due to K8s/Docker.
    maxThreads: 8,
    minThreads: 8,
    deps: { external: ['**/node_modules/**'] },
    browser: {
      enabled: true,
      provider: 'playwright',
      name: 'chromium'
    }
  }
});
