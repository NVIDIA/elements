import { mergeConfig } from 'vitest/config';
import { libraryTestConfig } from '@internals/vite/configs/test.js';

export default mergeConfig(libraryTestConfig, {
  root: import.meta.dirname,
  optimizeDeps: {
    include: [
      '@nvidia-elements/code > highlight.js/lib/core',
      '@nvidia-elements/code > highlight.js/lib/languages/bash',
      '@nvidia-elements/code > highlight.js/lib/languages/css',
      '@nvidia-elements/code > highlight.js/lib/languages/go',
      '@nvidia-elements/code > highlight.js/lib/languages/ini',
      '@nvidia-elements/code > highlight.js/lib/languages/javascript',
      '@nvidia-elements/code > highlight.js/lib/languages/json',
      '@nvidia-elements/code > highlight.js/lib/languages/markdown',
      '@nvidia-elements/code > highlight.js/lib/languages/python',
      '@nvidia-elements/code > highlight.js/lib/languages/shell',
      '@nvidia-elements/code > highlight.js/lib/languages/typescript',
      '@nvidia-elements/code > highlight.js/lib/languages/xml',
      '@nvidia-elements/code > highlight.js/lib/languages/yaml'
    ]
  },
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
