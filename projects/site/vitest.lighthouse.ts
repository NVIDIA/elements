import { mergeConfig } from 'vitest/config';
import { libraryNodeTestConfig } from '@internals/vite';

export default mergeConfig(libraryNodeTestConfig, {
  test: {
    testTimeout: 60000,
    include: ['src/**/*.test.lighthouse.ts'],
    outputFile: {
      junit: './coverage/lighthouse/junit.xml'
    }
  }
});
