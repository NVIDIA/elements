import process from 'process';

/** @type {import('vite').UserConfig} */
export const libraryLitSSRTestConfig = {
  cacheDir: 'node_modules/.vite-ssr',
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
