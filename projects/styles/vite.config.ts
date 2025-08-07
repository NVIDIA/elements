import { libraryBuildConfig } from '@internals/vite';
import { resolve } from 'path';
import { UserConfig, defineConfig, mergeConfig } from 'vite';

export default defineConfig(() => {
  const config: UserConfig = {
    resolve: {
      alias: { '@nvidia-elements/styles': resolve(import.meta.dirname, './src') }
    },
    build: {
      lib: {
        entry: {
          index: resolve(import.meta.dirname, './src/index.ts'),
          'typography.css': resolve(import.meta.dirname, './src/typography.css'),
          'layout.css': resolve(import.meta.dirname, './src/layout.css'),
          'layout-labs-viewport.css': resolve(import.meta.dirname, './src/layout-labs-viewport.css'),
          'layout-labs-container.css': resolve(import.meta.dirname, './src/layout-labs-container.css'),
          'view-transitions.css': resolve(import.meta.dirname, './src/view-transitions.css')
        }
      }
    }
  };

  return mergeConfig(libraryBuildConfig, config);
});
