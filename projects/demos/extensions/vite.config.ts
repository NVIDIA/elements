import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig(() => {
  return {
    plugins: [
      viteStaticCopy({
        targets: [
          { src: './node_modules/@elements/elements/dist/assets/icons.svg', dest: 'assets' }
        ]
      })
    ]
  }
});
