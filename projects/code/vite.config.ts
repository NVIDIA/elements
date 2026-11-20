import { resolve } from 'path';
import { UserConfig, defineConfig, mergeConfig } from 'vite';
import { libraryBuildConfig } from '@internals/vite';

export default defineConfig(() => {
  const config: UserConfig = {
    resolve: {
      alias: { '@nvidia-elements/code': resolve(import.meta.dirname, './src') }
    },
    build: {
      lib: {
        entry: Object.fromEntries(
          [
            'css',
            'go',
            'html',
            'javascript',
            'json',
            'markdown',
            'plain-text-compat',
            'python',
            'tsx',
            'typescript',
            'xml',
            'yaml'
          ].map(language => [`languages/${language}`, resolve(import.meta.dirname, `./src/languages/${language}.ts`)])
        )
      }
    }
  };

  return mergeConfig(libraryBuildConfig, config);
});
