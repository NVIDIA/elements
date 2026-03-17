import { resolve } from 'path';
import { UserConfig, defineConfig, mergeConfig } from 'vite';
import { libraryBuildConfig } from '@internals/vite';

const prod = process.env.NODE_ENV === 'production';

export default defineConfig(() => {
  const config: UserConfig = {
    resolve: {
      alias: { '@nvidia-elements/monaco': resolve(import.meta.dirname, './src') },
      // ensure resolved path to patched monaco-editor don't leak into bundle chunk names
      preserveSymlinks: true
    },
    build: {
      minify: prod,
      lib: {
        entry: {
          // monaco-editor environment entry point
          environment: resolve(import.meta.dirname, './src/environment.ts'),
          // synchronous monaco-editor main entry point
          index: resolve(import.meta.dirname, './src/index.ts'),
          // themes entry point
          themes: resolve(import.meta.dirname, './src/themes/index.ts'),
          // asynchronous monaco-editor entry point
          monaco: resolve(import.meta.dirname, './src/monaco.ts'),
          // worker entry points (for optional customization of workers)
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

  return mergeConfig(libraryBuildConfig, config);
});
