import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig(() => {
  return {
    root: './src',
    envDir: '../',
    base: './',
    build: {
      outDir: '../dist',
      emptyOutDir: true
    },
    resolve: {
      alias: {
        './node_modules': fileURLToPath(new URL('./node_modules', import.meta.url))
      }
    }
  };
});
