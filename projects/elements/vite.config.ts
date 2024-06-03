import { resolve } from 'path';
import { UserConfig, defineConfig, mergeConfig } from 'vite';
import { libraryBuildConfig } from '@nve-internals/vite';

export default defineConfig(() => {
  const config: UserConfig = {
    resolve: {
      alias: { '@nvidia-elements/core': resolve(import.meta.dirname, './src') }
    },
    build: {
      lib: {
        entry: {
          'polyfills/custom-state-set': resolve(import.meta.dirname, './src/polyfills/custom-state-set.ts'), // optional polyfills for non-chromium envs
          'css/module.typography.css': resolve(import.meta.dirname, './src/css/module.typography.css'), // base typography styles
          'css/module.layout.css': resolve(import.meta.dirname, './src/css/module.layout.css'), // layout utilities
          'css/module.responsive.css': resolve(import.meta.dirname, './src/css/module.responsive.css'), // responsive layout utilities
          'index.css': resolve(import.meta.dirname, './src/index.css') // global styles including all above style modules
        }
      }
    }
  };

  return mergeConfig(libraryBuildConfig, config);
});
