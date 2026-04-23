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
          'polyfills/custom-state-set': resolve(import.meta.dirname, './src/polyfills/custom-state-set.ts') // optional polyfills for non-chromium envs
        }
      }
    }
  };

  return mergeConfig(libraryBuildConfig, config);
});
