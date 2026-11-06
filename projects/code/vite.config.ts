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
        entry: {
          'codeblock/languages/toml': resolve(import.meta.dirname, './src/codeblock/languages/toml.ts'),
          'codeblock/languages/json': resolve(import.meta.dirname, './src/codeblock/languages/json.ts'),
          'codeblock/languages/javascript': resolve(import.meta.dirname, './src/codeblock/languages/javascript.ts'),
          'codeblock/languages/python': resolve(import.meta.dirname, './src/codeblock/languages/python.ts'),
          'codeblock/languages/go': resolve(import.meta.dirname, './src/codeblock/languages/go.ts'),
          'codeblock/languages/markdown': resolve(import.meta.dirname, './src/codeblock/languages/markdown.ts'),
          'codeblock/languages/css': resolve(import.meta.dirname, './src/codeblock/languages/css.ts'),
          'codeblock/languages/yaml': resolve(import.meta.dirname, './src/codeblock/languages/yaml.ts'),
          'codeblock/languages/xml': resolve(import.meta.dirname, './src/codeblock/languages/xml.ts'),
          'codeblock/languages/html': resolve(import.meta.dirname, './src/codeblock/languages/html.ts'),
          'codeblock/languages/bash': resolve(import.meta.dirname, './src/codeblock/languages/bash.ts'),
          'codeblock/languages/typescript': resolve(import.meta.dirname, './src/codeblock/languages/typescript.ts'),
          'code-block/languages/bash': resolve(import.meta.dirname, './src/code-block/languages/bash.ts'),
          'code-block/languages/css': resolve(import.meta.dirname, './src/code-block/languages/css.ts'),
          'code-block/languages/go': resolve(import.meta.dirname, './src/code-block/languages/go.ts'),
          'code-block/languages/html': resolve(import.meta.dirname, './src/code-block/languages/html.ts'),
          'code-block/languages/javascript': resolve(import.meta.dirname, './src/code-block/languages/javascript.ts'),
          'code-block/languages/json': resolve(import.meta.dirname, './src/code-block/languages/json.ts'),
          'code-block/languages/markdown': resolve(import.meta.dirname, './src/code-block/languages/markdown.ts'),
          'code-block/languages/python': resolve(import.meta.dirname, './src/code-block/languages/python.ts'),
          'code-block/languages/toml': resolve(import.meta.dirname, './src/code-block/languages/toml.ts'),
          'code-block/languages/typescript': resolve(import.meta.dirname, './src/code-block/languages/typescript.ts'),
          'code-block/languages/xml': resolve(import.meta.dirname, './src/code-block/languages/xml.ts'),
          'code-block/languages/yaml': resolve(import.meta.dirname, './src/code-block/languages/yaml.ts')
        }
      }
    }
  };

  return mergeConfig(libraryBuildConfig, config);
});
