import { cpSync } from 'fs';

cpSync('./src/fonts', './dist/fonts', { recursive: true });
