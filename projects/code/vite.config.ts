import { resolve } from 'path';
import { readFile } from 'node:fs/promises';
import { UserConfig, defineConfig, mergeConfig } from 'vite';
import { libraryBuildConfig } from '@internals/vite';

export default defineConfig(() => {
  const config: UserConfig = {
    plugins: [
      {
        name: 'codeblock-grammar-notices',
        async generateBundle() {
          // Registration modules have no public bindings. Their source-side
          // .mjs imports do not form part of the consumer declaration contract.
          for (const language of [
            'bash',
            'css',
            'go',
            'html',
            'javascript',
            'json',
            'markdown',
            'python',
            'shell',
            'toml',
            'tsx',
            'typescript',
            'xml',
            'yaml'
          ]) {
            this.emitFile({ type: 'asset', fileName: `codeblock/languages/${language}.d.ts`, source: 'export {};\n' });
          }
          for (const [input, output] of [
            ['manifest.json', 'highlight-grammars.json'],
            ['GRAMMAR-LICENSES.txt', 'GRAMMAR-LICENSES.txt']
          ]) {
            const path = resolve(import.meta.dirname, 'src/internal/highlight/generated', input);
            this.addWatchFile(path);
            this.emitFile({ type: 'asset', fileName: output, source: await readFile(path, 'utf8') });
          }
        }
      }
    ],
    resolve: {
      alias: { '@nvidia-elements/code': resolve(import.meta.dirname, './src') }
    },
    build: {
      lib: {
        entry: {
          'codeblock/languages/bash': resolve(import.meta.dirname, './src/codeblock/languages/bash.ts'),
          'codeblock/languages/css': resolve(import.meta.dirname, './src/codeblock/languages/css.ts'),
          'codeblock/languages/go': resolve(import.meta.dirname, './src/codeblock/languages/go.ts'),
          'codeblock/languages/html': resolve(import.meta.dirname, './src/codeblock/languages/html.ts'),
          'codeblock/languages/javascript': resolve(import.meta.dirname, './src/codeblock/languages/javascript.ts'),
          'codeblock/languages/json': resolve(import.meta.dirname, './src/codeblock/languages/json.ts'),
          'codeblock/languages/markdown': resolve(import.meta.dirname, './src/codeblock/languages/markdown.ts'),
          'codeblock/languages/python': resolve(import.meta.dirname, './src/codeblock/languages/python.ts'),
          'codeblock/languages/shell': resolve(import.meta.dirname, './src/codeblock/languages/shell.ts'),
          'codeblock/languages/toml': resolve(import.meta.dirname, './src/codeblock/languages/toml.ts'),
          'codeblock/languages/tsx': resolve(import.meta.dirname, './src/codeblock/languages/tsx.ts'),
          'codeblock/languages/typescript': resolve(import.meta.dirname, './src/codeblock/languages/typescript.ts'),
          'codeblock/languages/xml': resolve(import.meta.dirname, './src/codeblock/languages/xml.ts'),
          'codeblock/languages/yaml': resolve(import.meta.dirname, './src/codeblock/languages/yaml.ts')
        }
      }
    }
  };

  return mergeConfig(libraryBuildConfig, config);
});
