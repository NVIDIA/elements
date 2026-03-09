// Ensure original CSS files are individually exported for optional use.
import './editor.global.css';
import './editor.main.css';

import * as monaco from './vendor/monaco-editor/editor/editor.main.js';

import { createMonacoEnvironment } from './environment.js';

(globalThis as Record<string, unknown>).MonacoEnvironment ??= createMonacoEnvironment();

// Pre-configured TypeScript compiler options with modern defaults suitable for in-browser validation
monaco.typescript.typescriptDefaults.setCompilerOptions({
  module: monaco.typescript.ModuleKind.ESNext,
  target: monaco.typescript.ScriptTarget.ESNext,
  isolatedModules: true,
  allowNonTsExtensions: true,
  // https://www.typescriptlang.org/tsconfig/#moduleDetection
  // NOTE: This enum is not exported by monaco-editor, so we use the corresponding number directly.
  // https://github.com/microsoft/monaco-editor/blob/main/src/language/typescript/lib/typescriptServices.d.ts
  moduleDetection: 3 /* monaco.typescript.ModuleDetectionKind.Force */
});

export * from './vendor/monaco-editor/editor/editor.main.js';

export const VERSION = '0.0.0';

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
export type Monaco = typeof import('./index.ts');
