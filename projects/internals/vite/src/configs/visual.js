import process from 'process';

/** @type {import('vite').UserConfig} */
export const libraryVisualTestConfig = {
  logLevel: 'info',
  cacheDir: 'node_modules/.vite-visual',
  server: {
    fs: {
      strict: false,
      allow: [process.cwd(), '/']
    }
  },
  test: {
    retry: 2,
    isolate: false,
    fileParallelism: false,
    maxWorkers: process.env.CI ? 1 : undefined,
    maxConcurrency: process.env.CI ? 1 : undefined,
    reporters: ['default', 'junit', 'json'],
    setupFiles: ['@internals/vite/setup/visual.js'],
    outputFile: {
      json: './coverage/visual/summary.json',
      junit: './coverage/visual/junit.xml'
    },
    testTimeout: 60000,
    hookTimeout: 60000,
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
