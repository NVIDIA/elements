import { mergeConfig } from 'vitest/config';
import { libraryVisualTestConfig } from '@nve-internals/vite';

export default mergeConfig(libraryVisualTestConfig, {
  test: {
    include: [
      'src/**/*.test.visual.ts',
      '!src/internal/styles/*.test.visual.ts',
      '!src/switch/*.test.visual.ts',
      '!src/progress-bar/*.test.visual.ts'
    ],
    outputFile: {
      junit: './coverage/visual/junit.xml'
    }
  }
});
