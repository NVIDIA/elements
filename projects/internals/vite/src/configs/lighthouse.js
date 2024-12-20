/** @type {import('vite').UserConfig} */
export const libraryLighthouseTestConfig = {
  logLevel: 'info',
  test: {
    pool: 'forks', // https://github.com/vitest-dev/vitest/issues/3077
    retry: 1,
    bail: 2,
    isolate: false,
    fileParallelism: false,
    onConsoleLog(log) {
      if (log.includes('plugin vite-plugin-virtual-html')) {
        return false;
      }
    },
    reporters: ['default', 'junit'],
    globalSetup: ['@internals/vite/setup/lighthouse.js'],
    testTimeout: 60000,
    server: {
      deps: {
        external: ['**/node_modules/**']
      }
    }
  }
};
