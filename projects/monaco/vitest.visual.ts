import { mergeConfig } from 'vitest/config';
import { libraryVisualTestConfig } from '@internals/vite/configs/visual.js';

export default mergeConfig(libraryVisualTestConfig, {
  root: import.meta.dirname,
  test: {
    include: ['src/index.test.visual.ts'],
    outputFile: {
      junit: './coverage/visual/junit.xml'
    }
  }
});
