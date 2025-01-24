import { defineConfig } from 'vite';
import { join, resolve } from 'node:path';

export default defineConfig(() => {
  return {
    root: './_site',
    envDir: '../',
    base: join('/', process.env.PAGES_BASE_URL ?? '', 'starters', 'eleventy'),
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
