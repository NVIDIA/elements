import { resolve } from 'path';
import { UserConfig, defineConfig, mergeConfig } from 'vite';
import { libraryBuildConfig } from '@internals/vite';

export default defineConfig(() => {
  const config: UserConfig = {
    resolve: {
      alias: { '@nvidia-elements/core': resolve(import.meta.dirname, './src') }
    },
    build: {
      lib: {
        entry: {
          index: resolve('./src/index.ts'),
          vite: resolve('./src/vite.ts'),
          ['vite-setup']: resolve('./src/vite-setup.ts')
        }
      },
      rollupOptions: {
        external: ['fs', 'path']
      }
    }
  };

  return mergeConfig(libraryBuildConfig, config);
});
