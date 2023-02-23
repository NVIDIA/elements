import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import packageFile from './node_modules/@elements/elements/package.json';

export default defineConfig(() => {
  return {
    build: {
      rollupOptions: {
        output: {
          manualChunks: () => 'all',
          entryFileNames: `elements-elements.${packageFile.version}.bundle.js`,
          chunkFileNames: `elements-elements.${packageFile.version}.bundle.js`,
          assetFileNames: `elements-elements.${packageFile.version}.bundle.[ext]`
        }
      }
    },
    plugins: [
      viteStaticCopy({
        targets: [
          { src: './node_modules/@elements/elements/dist/custom-elements.json', dest: './', rename: `elements-elements.${packageFile.version}.bundle.json` }
        ]
      })
    ]
  }
});
