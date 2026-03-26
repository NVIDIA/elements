import crypto from 'node:crypto';
import process from 'process';
import { playwright } from '@vitest/browser-playwright';

const watch = process.argv.findIndex(i => i === '--watch') !== -1;
const coverage = process.argv.findIndex(i => i === '--coverage') !== -1;

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
export const libraryTestConfig = {
  testTimeout: 60_000,
  cacheDir: 'node_modules/.vite-unit',
  define: {
    __ELEMENTS_PLAYGROUND_BASE_URL__: JSON.stringify(process.env.ELEMENTS_PLAYGROUND_BASE_URL || ''),
    __ELEMENTS_REPO_BASE_URL__: JSON.stringify(process.env.ELEMENTS_REPO_BASE_URL || ''),
    __ELEMENTS_PAGES_BASE_URL__: JSON.stringify(process.env.ELEMENTS_PAGES_BASE_URL || ''),
    __ELEMENTS_REGISTRY_URL__: JSON.stringify(process.env.ELEMENTS_REGISTRY_URL || ''),
    __ELEMENTS_ESM_CDN_BASE_URL__: JSON.stringify(process.env.ELEMENTS_ESM_CDN_BASE_URL || ''),
    __ELEMENTS_CDN_BASE_URL__: JSON.stringify(process.env.ELEMENTS_CDN_BASE_URL || '')
  },
  build: {
    target: 'esnext',
    rolldownOptions: {
      output: {
        codeSplitting: false
      }
    }
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
  test: {
    retry: 2,
    maxWorkers: process.env.CI ? 1 : undefined,
    maxConcurrency: process.env.CI ? 1 : undefined, // Limit concurrent tests to avoid browser overload
    isolate: coverage,
    testTimeout: 60000,
    hookTimeout: 30000,
    server: {
      deps: {
        external: ['**/node_modules/**']
      }
    },
    reporters: ['default', 'junit', 'json'],
    outputFile: {
      junit: './coverage/unit/junit.xml',
      json: './coverage/unit/summary.json'
    },
    onConsoleLog(log) {
      if (log.includes('scheduled an update')) return false;
      if (log.includes('Lit is in dev mode')) return false;
      if (log.includes('@nve: ')) return false;
      if (log.startsWith('[Error: Expected error]')) return false;
      if (log.startsWith('Ignored')) return false;
    },
    setupFiles: ['@internals/vite/setup/library.js'], // todo: this should be project specific
    browser: {
      fileParallelism: !process.env.CI, // Disable file parallelism in CI to reduce browser instances
      enabled: true,
      provider: playwright({
        launch: {
          args: [
            '--disable-dev-shm-usage',
            '--disable-setuid-sandbox',
            '--disable-software-rasterizer',
            '--no-sandbox',
            '--disable-gpu',
            '--disable-extensions',
            '--disable-background-networking',
            '--disable-default-apps',
            '--disable-sync',
            '--disable-translate',
            '--metrics-recording-only',
            '--mute-audio',
            '--no-first-run',
            '--safebrowsing-disable-auto-update',
            '--disable-features=TranslateUI',
            '--disable-features=BlinkGenPropertyTrees',
            '--disable-ipc-flooding-protection'
          ],
          timeout: 120000 // 120 second browser launch timeout
        }
      }),
      headless: !watch,
      instances: [browser]
    },
    coverage: {
      extension: ['.ts'],
      provider: 'istanbul',
      reportsDirectory: './coverage/unit',
      reporter: [['lcov', { file: 'coverage.dat' }], 'html', 'json-summary'],
      thresholds: {
        lines: 90,
        branches: 90,
        functions: 90,
        statements: 90
      },
      watermarks: {
        statements: [80, 90],
        functions: [80, 90],
        branches: [80, 90],
        lines: [80, 90]
      },
      include: ['src'],
      exclude: [
        '**/*.html',
        '**/test/**',
        '**/dist/**',
        '**/build/**',
        '**/.lighthouse/**',
        '**/.wireit/**',
        '**/.pnpm/**',
        '**/*.test.ts',
        '**/*.css.js',
        '**/*.css',
        '**/*.cjs',
        '**/*.mjs',
        '**/*.test.axe.ts',
        '**/*.test.ssr.ts',
        '**/*.test.lighthouse.ts',
        '**/*.test.visual.ts',
        '**/*.examples.ts',
        'vite.*.ts',
        'vitest.*.ts'
      ]
    }
  }
};
