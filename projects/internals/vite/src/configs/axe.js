import crypto from 'node:crypto';
import process from 'process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { playwright } from '@vitest/browser-playwright';

const watch = process.argv.findIndex(i => i === '--watch') !== -1;
const coverage = process.argv.findIndex(i => i === '--coverage') !== -1;

const axeSource = readFileSync(resolve(import.meta.dirname, '../../node_modules/axe-core/axe.min.js'), 'utf-8');

const axePlugin = () => {
  return {
    name: 'axe-transform',
    transformIndexHtml(html) {
      return html.replace('<head>', `<head><script>${axeSource}</script>`);
    }
  };
};

const browser = {
  browser: 'chromium',
  isolate: coverage
};

Object.defineProperty(browser, 'name', {
  get() {
    return `chromium-${crypto.randomUUID()}`;
  }
});

/** @type {import('vite').UserConfig} */
export const libraryAxeTestConfig = {
  testTimeout: 60_000,
  cacheDir: 'node_modules/.vite-axe',
  build: {
    target: 'esnext'
  },
  optimizeDeps: {
    noDiscovery: true
  },
  server: {
    fs: {
      strict: false,
      allow: [process.cwd(), '/']
    }
  },
  plugins: [axePlugin()],
  test: {
    retry: 2,
    maxWorkers: process.env.CI ? 1 : undefined,
    maxConcurrency: process.env.CI ? 1 : undefined, // Limit concurrent tests to avoid browser overload
    server: {
      deps: {
        external: ['**/node_modules/**']
      }
    },
    deps: {
      interopDefault: false,
      optimizer: {
        web: {
          enabled: true,
          include: ['axe-core']
        }
      }
    },
    reporters: ['default', 'junit', 'json'],
    outputFile: {
      junit: './coverage/axe/junit.xml',
      json: './coverage/axe/summary.json'
    },
    onConsoleLog(log) {
      if (log.includes('scheduled an update')) return false;
      if (log.includes('Lit is in dev mode')) return false;
      if (log.includes('@nve: ')) return false;
      if (log.startsWith('[Error: Expected error]')) return false;
      if (log.startsWith('Ignored')) return false;
    },
    setupFiles: ['@internals/vite/setup/axe.js'], // todo: this should be project specific
    browser: {
      isolate: false,
      enabled: true,
      fileParallelism: true,
      provider: playwright({
        launch: {
          args: [
            '--disable-dev-shm-usage',
            '--disable-setuid-sandbox',
            '--disable-software-rasterizer',
            '--no-sandbox'
          ],
          timeout: 120000 // 120 second browser launch timeout
        }
      }),
      headless: !watch,
      instances: [browser]
    }
  }
};
