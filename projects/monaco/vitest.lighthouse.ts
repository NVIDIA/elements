import { mergeConfig } from 'vitest/config';
import { libraryLighthouseTestConfig } from '@internals/vite';

export default mergeConfig(libraryLighthouseTestConfig, {
  test: {
    include: ['src/**/*.test.lighthouse.ts'],
    outputFile: {
      junit: './coverage/lighthouse/junit.xml'
    }
  }
});
