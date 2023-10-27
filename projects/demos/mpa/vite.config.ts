import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: './src',
  build: {
    sourcemap: true,
    outDir: '../dist',
    rollupOptions: {
      input: {
        main: resolve('src/index.html'),
        about: resolve('src/about/index.html'),
        settings: resolve('src/settings/index.html'),
      },
    },
  },
});
