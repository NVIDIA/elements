import process from 'process';

/** @type {import('vite').UserConfig} */
export const libraryLitSSRTestConfig = {
  server: {
    fs: {
      strict: false,
      allow: [process.cwd(), '/']
    }
  },
  test: {
    retry: 1,
    bail: 2,
    isolate: false,
    fileParallelism: false,
    reporters: ['default', 'junit', 'json'],
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
