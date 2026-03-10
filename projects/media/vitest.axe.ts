import { resolve } from 'path';
import { mergeConfig } from 'vitest/config';
import { libraryAxeTestConfig } from '@internals/vite/configs/axe.js';

export default mergeConfig(libraryAxeTestConfig, {
  root: import.meta.dirname,
  resolve: {
    alias: { '@nvidia-elements/media': resolve(import.meta.dirname, './src') }
  },
  test: {
    include: ['./src/**/*.test.axe.ts'],
    outputFile: {
      junit: './coverage/axe/junit.xml'
    },
    coverage: {
      provider: 'istanbul',
      reportsDirectory: './coverage/axe'
    }
  }
});
