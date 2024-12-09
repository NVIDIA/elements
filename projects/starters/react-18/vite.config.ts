import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  root: './src',
  base: '/elements/starters/react',
  publicDir: '../assets',
  plugins: [react()],
  build: {
    outDir: '../dist'
  }
});
