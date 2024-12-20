import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    root: './src',
    base: '/elements/starters/typescript',
    publicDir: '../assets',
    build: {
      outDir: '../dist',
      emptyOutDir: true
    }
  };
});
