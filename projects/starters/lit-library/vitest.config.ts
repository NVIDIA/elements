import { defineConfig } from 'vitest/config';
import path from 'path';
import process from 'process';

const resolve = rel => path.resolve(process.cwd(), rel);
const watch = process.argv.findIndex(i => i === '--watch') !== -1;

export default defineConfig({
  test: {
    root: resolve('.'),
    alias: {
      'lit-library-starter': resolve(`./src`)
    },
    include: [resolve('./src/**/*.test.ts')],
    server: {
      deps: {
        external: ['**/node_modules/**']
      }
    },
    browser: {
      enabled: true,
      provider: 'playwright',
      headless: !watch,
      instances: [
        {
          browser: 'chromium'
        }
      ]
    }
  }
});
