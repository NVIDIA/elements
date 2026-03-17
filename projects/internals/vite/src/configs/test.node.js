import process from 'process';
import { transpileDecorators } from '../plugins/decorators.js';
import { markdown } from '../plugins/markdown.js';

const watch = process.argv.findIndex(i => i === '--watch') !== -1;
const coverage = process.argv.findIndex(i => i === '--coverage') !== -1;

/** @type {import('vite').UserConfig} */
export const libraryNodeTestConfig = {
  testTimeout: 5_000,
  server: {
    fs: {
      strict: false,
      allow: [process.cwd(), '/']
    }
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
    reporters: ['default', 'junit', 'json'],
    outputFile: {
      junit: './coverage/unit/junit.xml',
      json: './coverage/unit/summary.json'
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
        '**/dist/**',
        '**/.wireit/**',
        '**/.pnpm/**',
        '**/*.test.ts',
        '**/*.cjs',
        '**/*.mjs',
        'vite.*.ts',
        'vitest.*.ts'
      ]
    }
  },
  plugins: [transpileDecorators(), markdown()]
};
