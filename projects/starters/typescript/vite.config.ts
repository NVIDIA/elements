import { defineConfig } from 'vite';
import { join } from 'node:path';

export default defineConfig(() => {
  return {
    root: './src',
    base: join('/elements', process.env.PAGES_SITE_PREFIX ?? '', 'starters', 'typescript'),
    publicDir: '../assets',
    build: {
      outDir: '../dist',
      emptyOutDir: true
    }
  };
});
