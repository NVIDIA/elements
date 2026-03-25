import { resolve } from 'path';
import { UserConfig, defineConfig, mergeConfig } from 'vite';
import { libraryNodeBuildConfig } from '@internals/vite';

export default defineConfig(() => {
  const config: UserConfig = {
    resolve: {
      alias: { '@internals/tools': resolve(import.meta.dirname, './src') }
    },
    define: {
      __ELEMENTS_PLAYGROUND_BASE_URL__: JSON.stringify(process.env.ELEMENTS_PLAYGROUND_BASE_URL || ''),
      __ELEMENTS_PAGES_BASE_URL__: JSON.stringify(process.env.ELEMENTS_PAGES_BASE_URL || ''),
      __ELEMENTS_ESM_CDN_BASE_URL__: JSON.stringify(process.env.ELEMENTS_ESM_CDN_BASE_URL || ''),
      __ELEMENTS_REGISTRY_URL__: JSON.stringify(process.env.ELEMENTS_REGISTRY_URL || ''),
      __ELEMENTS_REPO_BASE_URL__: JSON.stringify(process.env.ELEMENTS_REPO_BASE_URL || '')
    }
  };

  return mergeConfig(libraryNodeBuildConfig, config);
});
