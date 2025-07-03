import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    root: './src',
    envDir: '../',
    base: './',
    build: {
      outDir: '../dist',
      emptyOutDir: true
    }
  };
});
