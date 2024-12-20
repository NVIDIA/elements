import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
// import devtools from 'solid-devtools/vite';

export default defineConfig({
  root: './src',
  base: '/elements/starters/solidjs',
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
