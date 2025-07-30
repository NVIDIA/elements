import { mergeConfig } from 'vitest/config';
import { libraryAxeTestConfig } from '@nve-internals/vite';

export default mergeConfig(libraryAxeTestConfig, {
  test: {
    include: ['./src/**/*.test.axe.ts'],
    outputFile: {
      junit: './coverage/axe/junit.xml'
    }
  }
});
