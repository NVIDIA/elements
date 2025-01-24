import { defineConfig } from 'vite';
import { resolve } from 'path';
import { join } from 'node:path';

export default defineConfig({
  root: './src',
  envDir: '../',
  base: join('/', process.env.PAGES_BASE_URL ?? '', 'starters', 'mpa'),
  publicDir: '../assets',
  build: {
    sourcemap: true,
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, './src/index.html'),
        about: resolve(__dirname, './src/about/index.html'),
        settings: resolve(__dirname, './src/settings/index.html')
      }
    }
  }
});
