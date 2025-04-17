import { resolve } from 'path';
import { UserConfig, defineConfig, mergeConfig } from 'vite';
import { libraryBuildConfig } from '@nve-internals/vite';

export default defineConfig(() => {
  const config: UserConfig = {
    resolve: {
      alias: { '@nvidia-elements/monaco': resolve(import.meta.dirname, './src') }
    },
    build: {
      sourcemap: false // disable due to sourcemaps using excessive memory when mapping monaco-editor
    }
  };

  // override default externals for monaco-editor, workers need to be processed by vite
  const merged = mergeConfig(libraryBuildConfig, config);
  merged.build.rollupOptions.external = [
    /^lit(\/.*)?/,
    /^@nve\/elements(\/.*)?/,
    /^@nve\/themes(\/.*)?/,
    /^monaco-editor(?!.*\.worker\.js)/
  ];

  return merged;
});
