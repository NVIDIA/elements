import { mergeConfig } from 'vitest/config';
import { libraryLighthouseTestConfig } from '@internals/vite/configs/lighthouse.js';

export default mergeConfig(libraryLighthouseTestConfig, {
  test: {
    hookTimeout: 60000,
    include: ['src/**/*.test.lighthouse.ts'],
    outputFile: {
      junit: './coverage/lighthouse/junit.xml'
    }
  }
});
