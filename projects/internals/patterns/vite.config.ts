import { resolve } from 'path';
import { UserConfig, defineConfig, mergeConfig } from 'vite';
import { libraryBuildConfig } from '@nve-internals/vite';

export default defineConfig(() => {
  const config: UserConfig = {
    resolve: {
      alias: { '@nve-internals/patterns': resolve(import.meta.dirname, './src') }
    }
  };

  return mergeConfig(libraryBuildConfig, config);
});
