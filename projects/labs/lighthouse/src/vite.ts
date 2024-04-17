import { deepMerge } from './utils.js';

const defaultConfig = {
  logLevel: 'info',
  test: {
    poolOptions: {
      threads: {
        singleThread: true
      }
    },
    reporters: ['basic'],
    setupFiles: ['@nvidia-elements/lighthouse/vite-setup.js'],
    include: [process.env.LIGHTHOUSE_ALL ? 'src/**/*.test.lighthouse.ts' : 'src/index.test.lighthouse.ts'],
    testTimeout: 60000,
    server: {
      deps: {
        external: ['**/node_modules/**']
      }
    }
  }
};

export const createConfig = config => deepMerge(defaultConfig, config);
