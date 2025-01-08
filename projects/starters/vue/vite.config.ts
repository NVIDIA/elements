import { fileURLToPath, URL } from 'node:url';
import { join } from 'node:path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
  base: join('/elements', process.env.PAGES_SITE_PREFIX ?? '', 'starters', 'vue'),
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: tag => tag.startsWith('nve-')
        }
      }
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
});
