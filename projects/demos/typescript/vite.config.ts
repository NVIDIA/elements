import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    root: './src',
    base: '/elements/demos/typescript',
    publicDir: '../assets',
    build: {
      outDir: '../dist'
    }
  }
});
