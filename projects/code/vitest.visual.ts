import { libraryVisualTestConfig } from '@internals/vite/configs/visual.js';

export default {
  ...libraryVisualTestConfig,
  test: {
    ...libraryVisualTestConfig.test,
    include: ['src/**/*.test.visual.ts'],
    setupFiles: ['@internals/vite/setup/lit.js']
  }
};
