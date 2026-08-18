import { mergeConfig } from 'vitest/config';
import { libraryWebGPULighthouseTestConfig } from '@internals/vite/configs/lighthouse.webgpu.js';

export default mergeConfig(libraryWebGPULighthouseTestConfig, {
  test: {
    include: ['src/**/*.test.lighthouse.ts'],
    outputFile: {
      junit: './coverage/lighthouse/junit.xml'
    }
  }
});
