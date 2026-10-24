import { mergeConfig } from 'vitest/config';
import { libraryLighthouseTestConfig } from '@internals/vite/configs/lighthouse.js';

export default mergeConfig(libraryLighthouseTestConfig, {
  test: {
    // Editor audits contend for CPU and must preserve their serial score baseline.
    maxWorkers: 1,
    fileParallelism: false,
    include: ['src/**/*.test.lighthouse.ts'],
    outputFile: {
      junit: './coverage/lighthouse/junit.xml'
    }
  }
});
