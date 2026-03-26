import { resolve } from 'path';
import { UserConfig, defineConfig, mergeConfig } from 'vite';
import { libraryNodeBuildConfig } from '@internals/vite';

export default defineConfig(() => {
  const config: UserConfig = {
    resolve: {
      alias: { '@internals/tools': resolve(import.meta.dirname, './src') }
    }
  };

  return mergeConfig(libraryNodeBuildConfig, config);
});
