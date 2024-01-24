import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    root: './src',
    base: '/demos/typescript',
    publicDir: '../assets',
    build: {
      outDir: '../dist'
    }
  }
});
