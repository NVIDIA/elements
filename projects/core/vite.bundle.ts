import { resolve } from 'path';
import { UserConfig, defineConfig, mergeConfig } from 'vite';
import { libraryBundleConfig } from '@internals/vite';

export default defineConfig(() => {
  const config: UserConfig = {
    resolve: {
      alias: { '@nvidia-elements/core': resolve(import.meta.dirname, './src') }
    },
    build: {
      rolldownOptions: {
        output: {
          codeSplitting: {
            groups: [{ name: 'icons', test: /src\/icon\/icons/ }]
          }
        }
      }
    }
  };

  return mergeConfig(libraryBundleConfig, config);
});
