import { resolve } from 'path';
import { UserConfig, defineConfig, mergeConfig } from 'vite';
import { libraryBundleConfig } from '@nve-internals/vite';

export default defineConfig(() => {
  const config: UserConfig = {
    resolve: {
      alias: { '@nvidia-elements/core': resolve(import.meta.dirname, './src') }
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: id => {
            if (id.includes('src/icon/icons')) {
              return 'icons';
            } else if (id.includes('polyfill')) {
              return 'polyfills';
            } else if (id.includes('floating-ui') || id.includes('type-native-anchor-fallback')) {
              return 'polyfills-popover';
            }
          }
        }
      }
    }
  };

  return mergeConfig(libraryBundleConfig, config);
});
