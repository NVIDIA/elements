export const lighthouseConfig = {
  logLevel: 'info',
  test: {
    pool: 'forks', // https://github.com/vitest-dev/vitest/issues/3077
    retry: 1,
    bail: 2,
    isolate: false,
    fileParallelism: false,
    onConsoleLog(log: string): boolean | void {
      if (log.includes('plugin vite-plugin-virtual-html')) {
        return false;
      }
    },
    reporters: ['basic', 'junit'],
    globalSetup: ['@nvidia-elements/testing-lighthouse/vite-setup.js'],
    include: ['src/**/*.test.lighthouse.ts'],
    testTimeout: 60000,
    server: {
      deps: {
        external: ['**/node_modules/**']
      }
    }
  }
};
