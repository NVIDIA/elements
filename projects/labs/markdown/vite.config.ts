import { resolve } from 'path';
import { UserConfig, defineConfig, mergeConfig } from 'vite';
import { libraryBuildConfig } from '@internals/vite';

export default defineConfig(() => {
  const config: UserConfig = {
    resolve: {
      alias: { '@nvidia-elements/markdown': resolve(import.meta.dirname, './src') }
    },
    build: {
      lib: {
        entry: {
          'styles/index.css': resolve(import.meta.dirname, './src/styles/index.css')
        }
      }
    }
  };

  return mergeConfig(libraryBuildConfig, config);
});
