import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import { join } from 'node:path';
// import devtools from 'solid-devtools/vite';

export default defineConfig({
  root: './src',
  envDir: '../',
  base: join('/', process.env.PAGES_BASE_URL ?? '', 'starters', 'solidjs'),
  publicDir: '../assets',
  build: {
    target: 'esnext',
    outDir: '../dist',
    emptyOutDir: true
  },
  plugins: [
    /* 
    Uncomment the following line to enable solid-devtools.
    For more info see https://github.com/thetarnav/solid-devtools/tree/main/packages/extension#readme
    */
    // devtools(),
    solidPlugin()
  ],
  server: {
    port: 3000
  }
});
