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
          'polyfills/custom-state-set': resolve(import.meta.dirname, './src/polyfills/custom-state-set.ts'), // optional polyfills for non-chromium envs
          'css/module.typography.css': resolve(import.meta.dirname, './src/css/module.typography.css'), // @deprecated
          'css/module.layout.css': resolve(import.meta.dirname, './src/css/module.layout.css'), // @deprecated
          'index.css': resolve(import.meta.dirname, './src/css/index.css') // global styles including all above style modules
        }
      }
    }
  };

  return mergeConfig(libraryBuildConfig, config);
});
