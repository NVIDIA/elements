import { libraryLighthouseTestConfig } from './lighthouse.js';

/** @type {import('vite').UserConfig} */
export const libraryWebGPULighthouseTestConfig = {
  ...libraryLighthouseTestConfig,
  test: {
    ...libraryLighthouseTestConfig.test,
    globalSetup: ['@internals/vite/setup/lighthouse.webgpu.js']
  }
};
