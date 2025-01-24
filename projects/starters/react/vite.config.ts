import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { join } from 'node:path';

// https://vitejs.dev/config/
export default defineConfig({
  root: './src',
  envDir: '../',
  base: join('/', process.env.PAGES_BASE_URL ?? '', 'starters', 'react'),
  publicDir: '../assets',
  plugins: [react()],
  build: {
    outDir: '../dist',
    emptyOutDir: true
  }
});
