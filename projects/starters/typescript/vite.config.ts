import { defineConfig } from 'vite';
import { join } from 'node:path';

export default defineConfig(() => {
  return {
    root: './src',
    envDir: '../',
    base: join('/', process.env.PAGES_BASE_URL ?? '', 'starters', 'typescript'),
    publicDir: '../assets',
    build: {
      outDir: '../dist',
      emptyOutDir: true
    }
  };
});
