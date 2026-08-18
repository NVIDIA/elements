import { mergeConfig } from 'vitest/config';
import { libraryWebGPUVisualTestConfig } from '@internals/vite/configs/visual.webgpu.js';

export default mergeConfig(libraryWebGPUVisualTestConfig, {
  root: import.meta.dirname,
  test: {
    include: ['src/**/*.test.visual.ts'],
    outputFile: {
      junit: './coverage/visual/junit.xml'
    }
  }
});
