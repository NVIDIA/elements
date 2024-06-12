import { mergeConfig } from 'vitest/config';
import { lighthouseConfig } from '@nvidia-elements/testing-lighthouse/vite';

export default mergeConfig(lighthouseConfig, {
  test: {
    outputFile: {
      junit: './coverage/lighthouse/junit.xml'
    }
  }
});
