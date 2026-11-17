import { resolve } from 'path';
import { UserConfig, defineConfig, mergeConfig } from 'vite';
import { libraryBundleConfig } from '@internals/vite/configs/build.bundle.js';

export default defineConfig(() => {
  const config: UserConfig = {
    resolve: {
      alias: { '@nvidia-elements/core': resolve(import.meta.dirname, './src') }
    }
  };

  return mergeConfig(libraryBundleConfig, config);
});
