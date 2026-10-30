import { libraryNodeTestConfig } from './test.node.js';

export const libraryRenderTestConfig = {
  ...libraryNodeTestConfig,
  cacheDir: 'node_modules/.vite-render',
  test: {
    ...libraryNodeTestConfig.test,
    include: ['src/**/*.test.render.ts'],
    environment: 'node',
    retry: 0,
    bail: 0,
    fileParallelism: false,
    maxWorkers: 1,
    maxConcurrency: 1,
    testTimeout: 60000,
    hookTimeout: 30000,
    coverage: { enabled: false },
    outputFile: { json: 'coverage/render/summary.json', junit: 'coverage/render/junit.xml' }
  }
};
