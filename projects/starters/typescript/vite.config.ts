import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    root: './src',
    envDir: '../',
    base: './',
    publicDir: '../assets',
    build: {
      outDir: '../dist',
      emptyOutDir: true
    }
  };
});
