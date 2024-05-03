import { writeFileSync } from 'node:fs';

writeFileSync('./dist/index.js', 'export const VERSION = "0.0.0";');
