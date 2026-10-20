import { resolve } from 'path';
import { UserConfig, defineConfig, mergeConfig } from 'vite';
import { libraryBundleConfig } from '@internals/vite';

export default defineConfig(() => {
  const config: UserConfig = {
    build: { rolldownOptions: { output: { codeSplitting: true } } },
    resolve: {
      alias: { '@nvidia-elements/scene': resolve(import.meta.dirname, './src') }
    }
  };

  return mergeConfig(libraryBundleConfig, config);
});
