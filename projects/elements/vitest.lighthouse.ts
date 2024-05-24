import { defineConfig } from 'vitest/config';
import { createConfig } from '@nvidia-elements/testing-lighthouse/vite';

export default defineConfig(
  createConfig({
    test: {
      include: [process.env.LIGHTHOUSE_ALL ? 'src/**/*.test.lighthouse.ts' : 'src/index.test.lighthouse.ts'],
      reporters: ['basic', 'junit'],
      outputFile: {
        junit: './coverage/lighthouse/junit.xml'
      }
    }
  })
);
