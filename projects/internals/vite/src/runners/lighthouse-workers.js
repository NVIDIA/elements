import { globSync } from 'node:fs';

// Keep audits bounded while Wireit builds other projects. Single-file suites
// use one browser because their tests still execute sequentially.
export const LIGHTHOUSE_WORKERS = Math.max(1, Math.min(3, globSync('src/**/*.test.lighthouse.ts').length));
