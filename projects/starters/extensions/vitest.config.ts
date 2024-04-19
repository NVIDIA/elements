import { defineConfig } from 'vitest/config';
import path from 'path';
import process from 'process';

const resolve = rel => path.resolve(process.cwd(), rel);

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
    deps: { external: ['**/node_modules/**'] },
    browser: {
      enabled: true,
      provider: 'playwright',
      name: 'chromium'
    }
  }
});
