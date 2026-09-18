import { mergeConfig } from 'vitest/config';
import { libraryTestConfig } from '@internals/vite/configs/test.js';

export default mergeConfig(libraryTestConfig, {
  root: import.meta.dirname,
  test: {
    include: ['./src/**/*.browser.test.ts'],
    outputFile: {
      junit: './coverage/browser/junit.xml',
      json: './coverage/browser/summary.json'
    },
    coverage: {
      reportsDirectory: './coverage/browser'
    }
  }
});
