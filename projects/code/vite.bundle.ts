import { resolve } from 'path';
import { UserConfig, defineConfig, mergeConfig } from 'vite';
import { libraryBundleConfig } from '@internals/vite';

export default defineConfig(() => {
  const config: UserConfig = {
    resolve: {
      alias: { '@nvidia-elements/code': resolve(import.meta.dirname, './src') }
    }
  };

  return mergeConfig(libraryBundleConfig, config);
});
