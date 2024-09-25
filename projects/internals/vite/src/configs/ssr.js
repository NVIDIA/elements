/** @type {import('vite').UserConfig} */
export const libraryLitSSRTestConfig = {
  test: {
    pool: 'forks', // https://github.com/vitest-dev/vitest/issues/3077
    retry: 1,
    bail: 2,
    isolate: false,
    fileParallelism: false,
    reporters: ['basic', 'junit'],
    server: {
      deps: {
        external: ['**/node_modules/**']
      }
    }
  }
};
