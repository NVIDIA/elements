/** @type {import('vite').UserConfig} */
export const libraryVisualTestConfig = {
  logLevel: 'info',
  test: {
    retry: 1,
    bail: 2,
    isolate: false,
    fileParallelism: false,
    reporters: ['default', 'junit', 'json'],
    setupFiles: ['@nve-internals/vite/setup/visual.js'],
    outputFile: {
      json: './coverage/visual/summary.json',
      junit: './coverage/visual/junit.xml'
    },
    testTimeout: 60000,
    server: {
      deps: {
        external: ['**/node_modules/**']
      }
    },
    onConsoleLog(log) {
      if (log.includes('plugin vite-plugin-virtual-html')) {
        return false;
      }
    }
  }
};
