import { resolve, basename } from 'path';
import { globSync } from 'node:fs';
import { UserConfig, defineConfig, mergeConfig } from 'vite';
import { libraryBuildConfig } from '@internals/vite';

export default defineConfig(() => {
  const config: UserConfig = {
    build: {
      lib: {
        formats: ['es'],
        entry: Object.fromEntries(
          globSync('src/icon/icons/*.ts', { cwd: import.meta.dirname }).map(file => [
            file.replace(/^src\//, '').replace(/\.ts$/, ''),
            resolve(import.meta.dirname, file)
          ])
        )
      }
    },
    resolve: {
      alias: { '@nvidia-elements/core': resolve(import.meta.dirname, './src') }
    }
  };

  const merged = mergeConfig(libraryBuildConfig, config);
  if (merged.build?.rolldownOptions) {
    merged.build.rolldownOptions.output = {
      format: 'esm',
      preserveModules: true,
      assetFileNames: '[name].[ext]',
      entryFileNames: chunk =>
        chunk.facadeModuleId?.endsWith('.svg?raw')
          ? `icon/assets/${basename(chunk.facadeModuleId).replace('.svg?raw', '')}.js`
          : '[name].js'
    };
  }
  return merged;
});
