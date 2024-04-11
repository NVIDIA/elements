import { defineConfig } from 'vite';
import packageFile from './node_modules/@elements/elements/package.json';

export default defineConfig(() => {
  return {
    build: {
      rollupOptions: {
        output: {
          assetFileNames: `elements.${packageFile.version}.bundle.[ext]`,
          entryFileNames: `elements.${packageFile.version}.bundle.js`,
          chunkFileNames: info => `elements.${packageFile.version}.bundle.${info.name}${info.name ? '.' : ''}js`,
          manualChunks: id => (id.includes('dist/icon/icons') ? 'icons' : 'all')
        }
      }
    }
  };
});
