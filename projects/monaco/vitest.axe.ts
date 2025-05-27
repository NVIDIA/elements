import { resolve } from 'path';
import { mergeConfig } from 'vitest/config';
import { libraryAxeTestConfig } from '@nve-internals/vite';

export default mergeConfig(libraryAxeTestConfig, {
  test: {
    include: ['./src/**/*.test.axe.ts'],
    alias: { '@nvidia-elements/monaco': resolve(import.meta.dirname, './dist') },
    isolate: true,
    outputFile: {
      junit: './coverage/axe/junit.xml'
    }
  }
});
