import { resolve } from 'path';
import { UserConfig, defineConfig, mergeConfig } from 'vite';
import { libraryNodeBuildConfig } from '@internals/vite';

export default defineConfig(() => {
  const config: UserConfig = {
    resolve: {
      alias: { '@internals/tools': resolve(import.meta.dirname, './src') }
    },
    plugins: [
      {
        name: 'markdown-loader',
        transform(code, id) {
          if (id.split('?')[0].endsWith('.md')) {
            // For .md files, get the raw content as a string
            return `export default ${JSON.stringify(code)};`;
          }
        }
      }
    ]
  };

  return mergeConfig(libraryNodeBuildConfig, config);
});
