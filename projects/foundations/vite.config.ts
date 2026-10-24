import { resolve } from 'path';
import { UserConfig, defineConfig, mergeConfig } from 'vite';
import { libraryBuildConfig } from '@internals/vite';

export default defineConfig(() => {
  const config: UserConfig = {
    resolve: {
      alias: { '@nvidia-elements/foundations': resolve(import.meta.dirname, './src') }
    },
    build: {
      rolldownOptions: {
        // Examples use core components supplied by the documentation site.
        external: [/^@nvidia-elements\/core(?:\/|$)/]
      }
    }
  };

  return mergeConfig(libraryBuildConfig, config);
});
