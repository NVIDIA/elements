import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { join } from 'node:path';

// https://vitejs.dev/config/
export default defineConfig({
  root: './src',
  envDir: '../',
  base: './',
  publicDir: '../assets',
  plugins: [react()],
  build: {
    outDir: '../dist',
    emptyOutDir: true
  }
});
