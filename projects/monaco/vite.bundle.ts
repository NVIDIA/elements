import { resolve } from 'path';
import { Plugin, defineConfig } from 'vite';
import { libraryBundleConfig } from '@internals/vite';

/**
 * Re-injects `@vite-ignore` comments on `new Worker(new URL(...))` patterns
 * after minification strips them. Without this, downstream consumers (like the
 * bundles starter) fail because Vite's `worker-import-meta-url` plugin tries
 * to resolve the vendored Monaco worker paths that only exist at build time.
 * https://github.com/vitejs/vite/issues/21950
 * https://github.com/rolldown/rolldown/issues/8248
 */
function workerIgnore(): Plugin {
  return {
    name: 'worker-ignore',
    generateBundle(_, bundle) {
      for (const chunk of Object.values(bundle)) {
        if (chunk.type === 'chunk') {
          chunk.code = chunk.code.replace(/new Worker\(\s*new URL\(/g, 'new Worker(/* @vite-ignore */ new URL(');
        }
      }
    }
  };
}

export default defineConfig(() => {
  return {
    ...libraryBundleConfig,
    resolve: {
      alias: { '@nvidia-elements/monaco': resolve(import.meta.dirname, './src') }
    },
    plugins: [workerIgnore()],
    build: {
      ...libraryBundleConfig.build,
      rolldownOptions: {
        ...libraryBundleConfig.build!.rolldownOptions,
        plugins: [
          ...(libraryBundleConfig.build!.rolldownOptions!.plugins as Plugin[]).filter(p => p.name !== 'dts-bundle')
        ]
      }
    }
  };
});
