import { resolve } from 'path';
import { mergeConfig } from 'vitest/config';
import { libraryAxeTestConfig } from '@internals/vite/configs/axe.js';

export default mergeConfig(libraryAxeTestConfig, {
  root: import.meta.dirname,
  optimizeDeps: {
    include: [
      'highlight.js/lib/core',
      'highlight.js/lib/languages/bash',
      'highlight.js/lib/languages/css',
      'highlight.js/lib/languages/go',
      'highlight.js/lib/languages/javascript',
      'highlight.js/lib/languages/json',
      'highlight.js/lib/languages/markdown',
      'highlight.js/lib/languages/python',
      'highlight.js/lib/languages/ini',
      'highlight.js/lib/languages/typescript',
      'highlight.js/lib/languages/xml',
      'highlight.js/lib/languages/yaml'
    ]
  },
  resolve: {
    alias: { '@nvidia-elements/code': resolve(import.meta.dirname, './src') }
  },
  test: {
    include: ['./src/**/*.test.axe.ts'],
    outputFile: {
      junit: './coverage/axe/junit.xml'
    }
  }
});
