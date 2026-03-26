import { resolve } from 'path';
import { mergeConfig } from 'vitest/config';
import { libraryNodeTestConfig } from '@internals/vite/configs/test.node.js';

export default mergeConfig(libraryNodeTestConfig, {
  root: import.meta.dirname,
  resolve: {
    alias: { '@nvidia-elements/cli': resolve(import.meta.dirname, './src') }
  },
  define: {
    __ELEMENTS_PLAYGROUND_BASE_URL__: JSON.stringify(process.env.ELEMENTS_PLAYGROUND_BASE_URL || ''),
    __ELEMENTS_REPO_BASE_URL__: JSON.stringify(process.env.ELEMENTS_REPO_BASE_URL || ''),
    __ELEMENTS_PAGES_BASE_URL__: JSON.stringify(process.env.ELEMENTS_PAGES_BASE_URL || ''),
    __ELEMENTS_REGISTRY_URL__: JSON.stringify(process.env.ELEMENTS_REGISTRY_URL || ''),
    __ELEMENTS_ESM_CDN_BASE_URL__: JSON.stringify(process.env.ELEMENTS_ESM_CDN_BASE_URL || ''),
    __ELEMENTS_CDN_BASE_URL__: JSON.stringify(process.env.ELEMENTS_CDN_BASE_URL || '')
  },
  test: {
    include: ['./src/**/*.test.ts'],
    coverage: {
      thresholds: {
        lines: 90,
        branches: 90,
        functions: 90,
        statements: 90
      }
    }
  }
});
