import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { join } from 'node:path';

// https://vitejs.dev/config/
export default defineConfig({
  root: './src',
  base: join('/elements', process.env.PAGES_SITE_PREFIX ?? '', 'starters', 'react-18'),
  publicDir: '../assets',
  plugins: [react()],
  build: {
    outDir: '../dist',
    emptyOutDir: true
  }
});
