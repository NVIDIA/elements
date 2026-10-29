import { hideExpectedTestConsoleMessage } from './console.js';
import { LIGHTHOUSE_WORKERS } from '../runners/lighthouse-workers.js';

/** @type {import('vite').UserConfig} */
export const libraryLighthouseTestConfig = {
  logLevel: 'info',
  cacheDir: 'node_modules/.vite-lighthouse',
  optimizeDeps: {
    include: ['vitest > expect-type']
  },
  test: {
    // Vitest 5.0.5 reads cached global-setup modules as Buffers,
    // but Vite's stack formatter requires source strings. https://github.com/vitest-dev/vitest/pull/11709
    fsModuleCache: false,
    retry: 2,
    isolate: false,
    maxWorkers: LIGHTHOUSE_WORKERS,
    fileParallelism: LIGHTHOUSE_WORKERS > 1,
    onConsoleLog: hideExpectedTestConsoleMessage,
    reporters: [
      'default',
      'junit',
      'json',
      [
        'github-actions',
        {
          jobSummary: {
            enabled: false
          }
        }
      ]
    ],
    globalSetup: ['@internals/vite/setup/lighthouse.js'],
    outputFile: {
      json: './coverage/lighthouse/summary.json',
      junit: './coverage/lighthouse/junit.xml'
    },
    testTimeout: 60000,
    hookTimeout: 30000,
    server: {
      deps: {
        external: ['**/node_modules/**']
      }
    }
  }
};
