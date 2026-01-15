import process from 'process';

/** @type {import('vite').UserConfig} */
export const libraryLighthouseTestConfig = {
  logLevel: 'info',
  cacheDir: 'node_modules/.vite-lighthouse',
  test: {
    retry: 1,
    bail: process.env.CI ? 1 : 0,
    isolate: false,
    maxWorkers: 1,
    fileParallelism: false,
    onConsoleLog(log) {
      if (log.includes('plugin vite-plugin-virtual-html')) {
        return false;
      }
    },
    reporters: ['default', 'junit', 'json'],
    globalSetup: ['@nve-internals/vite/setup/lighthouse.js'],
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
