import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig(() => {
  return {
    build: {
      rollupOptions: {
        output: {
          manualChunks: () => 'all',
          entryFileNames: `assets/[name].js`,
          chunkFileNames: `assets/[name].js`,
          assetFileNames: `assets/[name].[ext]`
        }
      }
    },
    plugins: [
      viteStaticCopy({
        targets: [
          { src: './node_modules/@elements/elements/dist/custom-elements.json', dest: './assets' }
          // { src: './node_modules/@elements/elements/dist/assets/icons.svg', dest: './assets' }, only required for versions prior 0.8.1
        ]
      })
    ]
  }
});
