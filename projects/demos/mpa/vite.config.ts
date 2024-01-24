import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: './src',
  base: '/demos/mpa',
  publicDir: '../assets',
  build: {
    sourcemap: true,
    outDir: '../dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, './src/index.html'),
        about: resolve(__dirname, './src/about/index.html'),
        settings: resolve(__dirname, './src/settings/index.html')
      },
    },
  },
});
