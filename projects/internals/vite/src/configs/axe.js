import { mergeConfig } from 'vitest/config';
import { libraryTestConfig } from './test.js';

/** @type {import('vite').UserConfig} */
export const libraryAxeTestConfig = mergeConfig(libraryTestConfig, {
  test: {
    outputFile: {
      json: './coverage/axe/summary.json',
      junit: './coverage/axe/junit.xml'
    }
  }
});
