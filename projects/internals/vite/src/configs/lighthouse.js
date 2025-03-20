/** @type {import('vite').UserConfig} */
export const libraryLighthouseTestConfig = {
  logLevel: 'info',
  test: {
    retry: 1,
    bail: process.env.CI ? 1 : 0,
    isolate: false,
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
    server: {
      deps: {
        external: ['**/node_modules/**']
      }
    }
  }
};
