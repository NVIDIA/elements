import process from 'process';

const watch = process.argv.findIndex(i => i === '--watch') !== -1;
const coverage = process.argv.findIndex(i => i === '--coverage') !== -1;

/** @type {import('vite').UserConfig} */
export const libraryTestConfig = {
  testTimeout: 5_000,
  test: {
    retry: 1,
    isolate: coverage,
    bail: !watch && !coverage ? 2 : 0,
    server: {
      deps: {
        external: ['**/node_modules/**']
      }
    },
    reporters: ['default', 'junit'],
    outputFile: {
      junit: './coverage/unit/junit.xml'
    },
    onConsoleLog(log) {
      if (log.includes('scheduled an update')) return false;
      if (log.includes('Lit is in dev mode')) return false;
    },
    setupFiles: ['@internals/vite/setup/library.js'],
    browser: {
      enabled: true,
      provider: 'playwright',
      headless: !watch,
      instances: [
        {
          browser: 'chromium',
          isolate: coverage,
          strictPort: true
        }
      ]
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
        '**/test/**',
        '**/dist/**',
        '**/build/**',
        '**/.lighthouse/**',
        '**/.storybook/**',
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
        '**/*.stories.ts',
        'vite.*.ts',
        'vitest.*.ts'
      ]
    }
  }
};
