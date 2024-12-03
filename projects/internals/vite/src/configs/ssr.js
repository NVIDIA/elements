/** @type {import('vite').UserConfig} */
export const libraryLitSSRTestConfig = {
  test: {
    pool: 'forks', // https://github.com/vitest-dev/vitest/issues/3077
    retry: 1,
    bail: 2,
    isolate: false,
    fileParallelism: false,
    reporters: ['basic', 'junit', 'json'],
    outputFile: {
      json: './coverage/ssr/summary.json',
      junit: './coverage/ssr/junit.xml'
    },
    server: {
      deps: {
        external: ['**/node_modules/**']
      }
    }
  }
};
