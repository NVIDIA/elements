import path from 'path';
import { defineConfig } from 'vite';

const resolve = rel => path.resolve(process.cwd(), rel);

export default defineConfig(() => {
  return {
    resolve: {
      alias: {
        '@nvidia-elements/core': resolve('./dist')
      }
    }
  };
});
