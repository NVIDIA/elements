import { hideExpectedTestConsoleMessage } from './console.js';

/** @type {import('vite').UserConfig} */
export const libraryLighthouseTestConfig = {
  logLevel: 'info',
  cacheDir: 'node_modules/.vite-lighthouse',
  test: {
    retry: 1,
    isolate: false,
    maxWorkers: 1,
    fileParallelism: false,
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
