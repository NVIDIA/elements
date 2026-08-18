import { libraryVisualTestConfig } from './visual.js';

/** @type {import('vite').UserConfig} */
export const libraryWebGPUVisualTestConfig = {
  ...libraryVisualTestConfig,
  test: {
    ...libraryVisualTestConfig.test,
    setupFiles: ['@internals/vite/setup/visual.webgpu.js']
  }
};
