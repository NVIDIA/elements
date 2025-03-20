import { resolve } from 'path';
import { UserConfig, defineConfig, mergeConfig } from 'vite';
import { libraryNodeBuildConfig } from '@nve-internals/vite';

export default defineConfig(() => {
  const config: UserConfig = {
    resolve: {
      alias: { '@nve-internals/metadata': resolve(import.meta.dirname, './src') }
    }
  };

  return mergeConfig(libraryNodeBuildConfig, config);
});
