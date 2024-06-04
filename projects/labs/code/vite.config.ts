import { resolve } from 'path';
import { UserConfig, defineConfig, mergeConfig } from 'vite';
import { libraryBuildConfig } from '@nve-internals/vite';

export default defineConfig(() => {
  const config: UserConfig = {
    resolve: {
      alias: { '@nvidia-elements/code': resolve(import.meta.dirname, './src') }
    },
    build: {
      lib: {
        entry: {
          'codeblock/languages/css': resolve(import.meta.dirname, './src/codeblock/languages/css.ts'),
          'codeblock/languages/go': resolve(import.meta.dirname, './src/codeblock/languages/go.ts'),
          'codeblock/languages/javascript': resolve(import.meta.dirname, './src/codeblock/languages/javascript.ts'),
          'codeblock/languages/json': resolve(import.meta.dirname, './src/codeblock/languages/json.ts'),
          'codeblock/languages/markdown': resolve(import.meta.dirname, './src/codeblock/languages/markdown.ts'),
          'codeblock/languages/python': resolve(import.meta.dirname, './src/codeblock/languages/python.ts'),
          'codeblock/languages/typescript': resolve(import.meta.dirname, './src/codeblock/languages/typescript.ts'),
          'codeblock/languages/xml': resolve(import.meta.dirname, './src/codeblock/languages/xml.ts'),
          'codeblock/languages/yaml': resolve(import.meta.dirname, './src/codeblock/languages/yaml.ts')
        }
      }
    }
  };

  return mergeConfig(libraryBuildConfig, config);
});
