import { libraryBuildConfig } from '@nve-internals/vite';
import { resolve } from 'path';
import { UserConfig, defineConfig, mergeConfig } from 'vite';

export default defineConfig(() => {
  const config: UserConfig = {
    resolve: {
      alias: { '@nvidia-elements/themes': resolve(import.meta.dirname, './src') }
    },
    build: {
      emptyOutDir: false
    }
  };

  return mergeConfig(libraryBuildConfig, config);
});
