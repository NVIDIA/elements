import { resolve } from 'path';
import { UserConfig, defineConfig, mergeConfig } from 'vite';
import { libraryNodeBuildConfig } from '@internals/vite';

export default defineConfig(() => {
  const config: UserConfig = {
    build: {
      lib: {
        entry: {
          index: resolve(import.meta.dirname, './src/index.ts')
        }
      }
    }
  };

  return mergeConfig(libraryNodeBuildConfig, config);
});
