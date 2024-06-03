import { mergeConfig } from 'vitest/config';

const defaultConfig = {
  logLevel: 'info',
  test: {
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
    include: [process.env.LIGHTHOUSE_ALL ? 'src/**/*.test.lighthouse.ts' : 'src/index.test.lighthouse.ts'],
    testTimeout: 60000,
    server: {
      deps: {
        external: ['**/node_modules/**']
      }
    }
  }
};

export const createConfig = config => mergeConfig(defaultConfig, config);
