import { mergeConfig } from 'vitest/config';
import { libraryTestConfig } from './test.js';

/** @type {import('vitest').UserConfig} */
export const libraryAxeTestConfig = mergeConfig(libraryTestConfig, {
  test: {
    include: ['./src/**/*.test.axe.ts'],
    exclude: ['./src/**/*.test.ts'],
    outputFile: {
      junit: './coverage/axe/junit.xml'
    }
  }
});
