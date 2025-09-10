import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig(() => {
  return {
    plugins: [svelte()],
    root: './src',
    envDir: '../',
    base: './',
    build: {
      outDir: '../dist',
      emptyOutDir: true
    }
  };
});
