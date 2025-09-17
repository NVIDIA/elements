import terser from '@rollup/plugin-terser';
import minifyHTML from 'rollup-plugin-html-literals';
import { resolve } from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

/**
 * - https://vitejs.dev/config/
 * - https://lit.dev/docs/tools/production/
 * @type {import('vite').UserConfig}
 */
export const libraryBundleConfig = {
  build: {
    cssMinify: 'esbuild',
    minify: false, // https://github.com/vitejs/vite/issues/8848
    outDir: 'dist/bundles/',
    emptyOutDir: false,
    sourcemap: false,
    target: 'esnext',
    lib: {
      formats: ['es'],
      name: 'bundle',
      entry: {
        bundle: resolve('./src/bundle.ts')
      }
    },
    rollupOptions: {
      output: {
        format: 'esm',
        assetFileNames: `index.[ext]`,
        entryFileNames: `index.js`,
        inlineDynamicImports: false,
        chunkFileNames: info => `${info.name ? info.name : 'index'}.js`,
        importAttributesKey: 'with'
      },
      plugins: [
        minifyHTML(),
        terser({ module: true, format: { comments: false }, compress: { ecma: 2020, unsafe: true, passes: 2 } }),
        visualizer({
          filename: 'coverage/size/index.html',
          gzipSize: true,
          brotliSize: true,
          sourcemap: false,
          template: 'treemap'
        })
      ]
    }
  }
};
