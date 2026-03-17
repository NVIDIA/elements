import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: './src',
  envDir: '../',
  base: './',
  build: {
    sourcemap: true,
    outDir: '../dist',
    emptyOutDir: true,
    rolldownOptions: {
      input: {
        main: resolve(__dirname, './src/index.html'),
        about: resolve(__dirname, './src/about/index.html'),
        settings: resolve(__dirname, './src/settings/index.html')
      }
    }
  }
});
