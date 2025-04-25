import { resolve } from 'path';
import { mergeConfig } from 'vitest/config';
import { libraryTestConfig } from '@nve-internals/vite';

export default mergeConfig(libraryTestConfig, {
  test: {
    include: ['./src/**/*.test.ts'],
    alias: { '@nvidia-elements/monaco': resolve(import.meta.dirname, './src') },
    isolate: true,
    coverage: {
      exclude: ['src/workers/*.ts'] // ignore the re-exported web workers
    }
  },
  optimizeDeps: {
    include: [
      'monaco-editor/esm/vs/editor/editor.main.js',
      'monaco-editor/esm/vs/editor/editor.worker.js',
      'monaco-editor/esm/vs/language/css/css.worker.js',
      'monaco-editor/esm/vs/language/json/json.worker.js',
      'monaco-editor/esm/vs/language/html/html.worker.js',
      'monaco-editor/esm/vs/language/typescript/ts.worker.js'
    ]
  }
});
