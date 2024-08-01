import { mergeConfig } from 'vitest/config';
import { libraryLighthouseTestConfig } from '@nve-internals/vite';

export default mergeConfig(libraryLighthouseTestConfig, {
  test: {
    include: [process.env.LIGHTHOUSE_ALL ? 'src/**/*.test.lighthouse.ts' : 'src/index.test.lighthouse.ts'],
    outputFile: {
      junit: './coverage/lighthouse/junit.xml'
    }
  }
});
