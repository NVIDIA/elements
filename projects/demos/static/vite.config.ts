import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig(() => {
  return {
    build: {
      rollupOptions: {
        output: {
          entryFileNames: `assets/[name].js`,
          chunkFileNames: `assets/[name].js`,
          assetFileNames: `assets/[name].[ext]`
        }
      }
    },
    plugins: [
      viteStaticCopy({
        targets: [
          { src: './node_modules/@elements/elements/dist/assets/icons.svg', dest: './assets' }
        ]
      })
    ]
  }
});
