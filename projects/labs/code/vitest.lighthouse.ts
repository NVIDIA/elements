import { mergeConfig } from 'vitest/config';
import { lighthouseConfig } from '@nvidia-elements/testing-lighthouse/vite';

export default mergeConfig(lighthouseConfig, {
  test: {
    include: [process.env.LIGHTHOUSE_ALL ? 'src/**/*.test.lighthouse.ts' : 'src/index.test.lighthouse.ts'],
    outputFile: {
      junit: './coverage/lighthouse/junit.xml'
    }
  }
});
