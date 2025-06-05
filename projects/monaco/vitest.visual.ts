import { mergeConfig } from 'vitest/config';
import { libraryVisualTestConfig } from '@internals/vite';

export default mergeConfig(libraryVisualTestConfig, {
  test: {
    include: ['src/**/*.test.visual.ts'],
    outputFile: {
      junit: './coverage/visual/junit.xml'
    }
  }
});
