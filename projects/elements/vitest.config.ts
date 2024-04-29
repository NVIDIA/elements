import { defineConfig } from 'vitest/config';
import path from 'path';
import process from 'process';
import * as url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const axe = process.argv.findIndex(i => i === '--axe') !== -1;
const watch = process.argv.findIndex(i => i === '--watch') !== -1;
const coverage = process.argv.findIndex(i => i === '--coverage') !== -1;
const resolve = rel => path.resolve(__dirname, rel);

export default defineConfig({
  root: __dirname,
  optimizeDeps: {
    exclude: ['@vitest/coverage-istanbul']
  },
  test: {
    retry: 1,
    isolate: coverage,
    bail: !watch && !coverage ? 2 : 0,
    server: {
      deps: {
        external: ['**/node_modules/**']
      }
    },
    alias: {
      '@nvidia-elements/core': resolve('./src')
    },
    include: [axe ? resolve('./src/**/*.test.axe.ts') : resolve('./src/**/*.test.ts')],
    reporters: ['basic', 'junit'],
    outputFile: {
      junit: axe ? './coverage/axe/junit.xml' : './coverage/unit/junit.xml'
    },
    onConsoleLog(log) {
      if (log.includes('scheduled an update')) return false;
      if (log.includes('Lit is in dev mode')) return false;
    },
    setupFiles: [resolve('./src/test/setup.ts')], // https://github.com/vitest-dev/vitest/issues/1700
    coverage: {
      extension: ['.ts'],
      provider: 'istanbul',
      reportsDirectory: axe ? './coverage/axe' : './coverage/unit',
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
      exclude: [
        '**/storybook/**',
        '**/polyfills/**',
        '**/test/**',
        '**/dist/**',
        '**/docs/**',
        '**/build/**',
        '**/tokens/**',
        '**/.lighthouse/**',
        '**/.storybook/**',
        '**/.wireit/**',
        '**/.pnpm/**',
        '**/*.test.ts',
        '**/docs.ts',
        '**/*.css.js',
        '**/*.css',
        '**/index.js',
        '**/src/index.ts',
        '**/*.cjs',
        '**/src/icon/icons/**',
        '**/src/icon/icons.ts',
        '**/*.mjs',
        '**/*.test.axe.ts',
        '**/*.test.lighthouse.ts',
        '**/*.stories.ts',
        'vite.*.ts',
        'vitest.*.ts'
      ]
    },
    browser: {
      isolate: coverage,
      slowHijackESM: false,
      enabled: true,
      headless: !watch,
      provider: 'playwright',
      name: 'chromium',
      api: {
        port: axe ? 63317 : 63316
      },
      providerOptions: {
        launch: {
          args: ['--enable-experimental-web-platform-features']
        }
      }
    }
  }
});
