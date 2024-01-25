import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  root: './src',
  base: '/elements/demos/react',
  publicDir: '../assets',
  plugins: [react()],
  build: {
    outDir: '../dist',
  }
});
