import { defineConfig } from 'vite';
import packageFile from './node_modules/@elements/elements/package.json';

export default defineConfig(() => {
  return {
    build: {
      rollupOptions: {
        output: {
          manualChunks: () => 'all',
          entryFileNames: `elements.${packageFile.version}.bundle.js`,
          chunkFileNames: `elements.${packageFile.version}.bundle.js`,
          assetFileNames: `elements.${packageFile.version}.bundle.[ext]`
        }
      }
    }
  }
});
