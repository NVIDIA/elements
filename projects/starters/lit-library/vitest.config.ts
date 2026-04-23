import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import path from 'path';
import process from 'process';

const resolve = rel => path.resolve(process.cwd(), rel);
const watch = process.argv.findIndex(i => i === '--watch') !== -1;

export default defineConfig({
  server: {
    fs: {
      strict: false,
      allow: ['/']
    }
  },
  resolve: {
    alias: { 'lit-library-starter': resolve('./src') }
  },
  test: {
    root: resolve('.'),
    include: [resolve('./src/**/*.test.ts')],
    reporters: [
      'default',
      [
        'github-actions',
        {
          jobSummary: {
            enabled: false
          }
        }
      ]
    ],
    server: {
      deps: {
        external: ['**/node_modules/**']
      }
    },
    browser: {
      enabled: true,
      provider: playwright(),
      headless: !watch,
      instances: [
        {
          browser: 'chromium'
        }
      ]
    }
  }
});
