import { mergeConfig } from 'vitest/config';
import { lighthouseConfig } from '@nvidia-elements/testing-lighthouse/vite';

export default mergeConfig(lighthouseConfig, {
  test: {
    include: ['src/**/*.test.lighthouse.ts'],
    outputFile: {
      junit: './coverage/lighthouse/junit.xml'
    }
  }
});
