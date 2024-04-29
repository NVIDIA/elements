import { defineConfig } from 'vitest/config';
import { createConfig } from '@nvidia-elements/lighthouse/vite';

export default defineConfig(
  createConfig({
    test: {
      retry: 1,
      include: [process.env.LIGHTHOUSE_ALL ? 'src/**/*.test.lighthouse.ts' : 'src/index.test.lighthouse.ts'],
      reporters: ['junit'],
      outputFile: {
        junit: './coverage/lighthouse/junit.xml'
      }
    }
  })
);
