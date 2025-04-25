import { mergeConfig } from 'vitest/config';
import { libraryLighthouseTestConfig } from '@nve-internals/vite';

export default mergeConfig(libraryLighthouseTestConfig, {
  test: {
    include: ['src/**/*.test.lighthouse.ts'],
    outputFile: {
      junit: './coverage/lighthouse/junit.xml'
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
