import { defineConfig } from 'vitest/config';
import path from 'path';
import process from 'process';

const resolve = (rel) => path.resolve(process.cwd(), rel);
const coverage = (process.argv.findIndex((i) => i === '--coverage') !== -1);
const watch = (process.argv.findIndex((i) => i === '--watch') !== -1);

export default defineConfig({
  optimizeDeps: {
    include: [
      '@vitest/utils > diff-sequences',
      '@vitest/utils > loupe'
    ],
    exclude: ['@vitest/coverage-istanbul']
  },
  test: {
    bail: !watch && !coverage ? 1 : 0,
    useAtomics: true,
    retry: 1,
    isolate: coverage,
    singleThread: true,
    threads: false,
    root: resolve('.'),
    alias: {
      '@elements/elements': resolve(`./src/`),
      '../dist/css/module.tokens.css': resolve('./dist/css/module.tokens.css'),
      '../dist/css/theme.high-contrast.css': resolve('./dist/css/theme.high-contrast.css'),
      '../dist/css/theme.reduced-motion.css': resolve('./dist/css/theme.reduced-motion.css'),
      '../dist/css/theme.compact.css': resolve('./dist/css/theme.compact.css'),
      '../dist/css/theme.dark.css': resolve('./dist/css/theme.dark.css')
    },
    include: [resolve('./src/**/*.test.ts')],
    forceRerunTriggers: ['**/dist/**'],
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
    },
    setupFiles: [resolve('./src/test/setup.ts')], // https://github.com/vitest-dev/vitest/issues/1700
    coverage: {
      provider: 'istanbul',
      reportsDirectory: process.env['COVERAGE_OUTPUT_DIR'] ?? resolve('./coverage'),
      reporter: [
        ['lcov', { 'file': 'coverage.dat' }],
        'html',
        'json-summary'
      ],
      lines: 90,
      branches: 90,
      functions: 90,
      statements: 90,
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
        '**/*.test.ts',
        '**/docs.ts',
        '**/*.css.js',
        '**/*.css',
        '**/index.js',
        '**/src/icon/icons/**',
        '**/src/icon/icons.ts'
      ]
    },
    browser: {
      slowHijackESM: false,
      enabled: true,
      headless: !watch,
      provider: 'playwright',
      name: 'chromium',
      api: {
        port: 63316
      }
    }
  }
});
