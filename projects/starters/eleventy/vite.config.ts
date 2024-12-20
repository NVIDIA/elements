import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig(() => {
  return {
    root: './_site',
    base: '/elements/starters/eleventy/',
    build: {
      outDir: '../dist',
      emptyOutDir: true,
      rollupOptions: {
        input: {
          main: resolve(__dirname, './_site/index.html'),
          about: resolve(__dirname, './_site/about/index.html'),
          settings: resolve(__dirname, './_site/settings/index.html')
        }
      }
    }
  };
});
