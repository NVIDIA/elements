import { promises as fsp } from 'node:fs';
import nodePath from 'node:path';
import { createDesignMdContent } from '../src/design-md.js';

const outputPath = nodePath.resolve(process.argv[2] ?? 'dist/DESIGN.md');

await fsp.mkdir(nodePath.dirname(outputPath), { recursive: true });
await fsp.writeFile(outputPath, createDesignMdContent(), 'utf-8');
