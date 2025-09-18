// Ensure original CSS files are individually exported for optional use.
import './editor.global.css';
import './editor.main.css';

import * as monaco from './vendor/monaco-editor/editor/editor.main.js';

import { createMonacoEnvironment } from './environment.js';

globalThis.MonacoEnvironment ??= createMonacoEnvironment();

// Pre-configured TypeScript compiler options with modern defaults suitable for in-browser validation
monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
  module: monaco.languages.typescript.ModuleKind.ESNext,
  target: monaco.languages.typescript.ScriptTarget.ESNext,
  isolatedModules: true,
  allowNonTsExtensions: true,
  moduleDetection: 3 /* monaco.languages.typescript.ModuleDetectionKind.Force */
});

export * from './vendor/monaco-editor/editor/editor.main.js';

export const VERSION = '0.0.0';

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
export type Monaco = typeof import('./index.ts');
