import { resolve } from 'path';
import { mergeConfig } from 'vitest/config';
import { libraryAxeTestConfig } from '@internals/vite';

export default mergeConfig(libraryAxeTestConfig, {
  test: {
    include: ['./src/**/*.test.axe.ts'],
    alias: { '@nvidia-elements/monaco': resolve(import.meta.dirname, './dist') },
    isolate: true,
    outputFile: {
      junit: './coverage/axe/junit.xml'
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
