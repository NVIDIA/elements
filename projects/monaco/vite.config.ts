import { resolve } from 'path';
import { UserConfig, defineConfig, mergeConfig } from 'vite';
import { libraryBuildConfig } from '@nve-internals/vite';

const prod = process.env.NODE_ENV === 'production';

export default defineConfig(() => {
  const config: UserConfig = {
    resolve: {
      alias: { '@nvidia-elements/monaco': resolve(import.meta.dirname, './src') },
      // ensure resolved path to patched monaco-editor don't leak into bundle chunk names
      preserveSymlinks: true
    },
    build: {
      minify: prod ? 'esbuild' : false,
      lib: {
        entry: {
          monaco: resolve(import.meta.dirname, './src/monaco.ts'),
          // monaco-editor main entry point
          'editor.main': resolve(import.meta.dirname, './src/editor.main.ts'),
          // create worker entry points for optional customization of workers
          'workers/css.worker': resolve(import.meta.dirname, './src/workers/css.worker.ts'),
          'workers/editor.worker': resolve(import.meta.dirname, './src/workers/editor.worker.ts'),
          'workers/html.worker': resolve(import.meta.dirname, './src/workers/html.worker.ts'),
          'workers/json.worker': resolve(import.meta.dirname, './src/workers/json.worker.ts'),
          'workers/ts.worker': resolve(import.meta.dirname, './src/workers/ts.worker.ts')
        }
      },
      sourcemap: false // disable due to sourcemaps using excessive memory when mapping monaco-editor
    }
  };

  const merged = mergeConfig(libraryBuildConfig, config);
  merged.build.rollupOptions.plugins = [
    // Disable terser rollup plugin in favor of esbuild minification to workaround CI OOM issues
    ...merged.build.rollupOptions.plugins.filter(p => p.name !== 'terser')
  ];

  return merged;
});
