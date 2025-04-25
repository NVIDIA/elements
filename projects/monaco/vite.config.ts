import { resolve } from 'path';
import { Plugin, UserConfig, defineConfig, mergeConfig } from 'vite';
import { libraryBuildConfig } from '@internals/vite';

const prod = process.env.NODE_ENV === 'production';

/**
 * Rewrites paths from node_modules/monaco-editor/esm/ to vendor/monaco-editor/
 * @param path The path to rewrite
 * @param ext The extension to use for files without an extension (defaults to '[ext]' for assets)
 * @returns The rewritten path, or undefined if not a Monaco path
 */
const rewriteMonacoPath = (path: string | undefined, ext: string = '[ext]'): string | undefined => {
  if (!path) return undefined;
  if (path.startsWith('node_modules/monaco-editor/esm/')) {
    const rewrittenPath = path.replace('node_modules/monaco-editor/esm/', 'vendor/monaco-editor/');
    return path.includes('.') ? rewrittenPath : rewrittenPath + '.' + ext;
  }
  return undefined;
};

// A rollup plugin to rewrite dynamic import(s) in vendored monaco-editor to add a /* vite-ignore */ comment
// to suppress warnings when workspace: linked into adjacent projects.
function injectViteIgnore(): Plugin {
  return {
    name: 'inject-vite-ignore',
    renderChunk(code, chunk, _options) {
      if (
        chunk.fileName.endsWith('monaco-editor/vs/base/common/worker/simpleWorker.js') ||
        chunk.fileName.endsWith('monaco-editor/vs/editor/common/services/editorSimpleWorker.js')
      ) {
        return {
          code: code.replace(/import\(`([^`]+)`\)/g, 'import(/* @vite-ignore */`$1`)'),
          map: null
        };
      }
      return null;
    }
  };
}

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

  // Override default externals for monaco-editor to bundle it since we have many patches
  const merged = mergeConfig(libraryBuildConfig, config);
  merged.build.rollupOptions.external = merged.build.rollupOptions.external.filter(
    regex => !regex.toString().includes('monaco-editor')
  );
  merged.build.rollupOptions.output = [
    {
      format: 'esm',
      preserveModules: true,
      preserveModulesRoot: 'src',
      assetFileNames: assetInfo => {
        return rewriteMonacoPath(assetInfo.name) ?? '[name].[ext]';
      },
      entryFileNames: chunkInfo => {
        if (chunkInfo.facadeModuleId?.endsWith('?worker&inline')) {
          return '[name].js';
        }
        return rewriteMonacoPath(chunkInfo.name, 'js') ?? '[name].js';
      }
    }
  ];
  merged.build.rollupOptions.plugins = [
    // Disable terser rollup plugin in favor of esbuild minification to workaround CI OOM issues
    ...merged.build.rollupOptions.plugins.filter(p => p.name !== 'terser'),
    // Suppress warnings for internal monaco-editor import()s when workspace: linked into adjacent projects
    injectViteIgnore()
  ];

  return merged;
});
