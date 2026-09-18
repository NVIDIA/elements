import { mergeConfig } from 'vitest/config';
import { libraryNodeTestConfig } from '@internals/vite/configs/test.node.js';

export default mergeConfig(libraryNodeTestConfig, {
  root: import.meta.dirname,
  test: {
    include: ['./src/**/*.test.ts'],
    exclude: ['./src/**/*.browser.test.ts']
  }
});
