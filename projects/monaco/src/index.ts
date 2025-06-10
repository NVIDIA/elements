// Ensure original CSS files are individually exported for optional use.
import './editor.global.css';
import './editor.main.css';

import { createMonacoEnvironment } from './environment.js';

globalThis.MonacoEnvironment ??= createMonacoEnvironment();

export * from './vendor/monaco-editor/editor/editor.main.js';

export const VERSION = '0.0.0';

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
export type Monaco = typeof import('./index.ts');
