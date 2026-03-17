import minifyHTML from 'rollup-plugin-html-literals';
import { resolve } from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import { dtsBundle } from '../plugins/dts.bundle.js';

/**
 * - https://vitejs.dev/config/
 * - https://lit.dev/docs/tools/production/
 * @type {import('vite').UserConfig}
 */
export const libraryBundleConfig = {
  build: {
    modulePreload: false,
    reportCompressedSize: false,
    cssMinify: 'esbuild',
    minify: true,
    outDir: 'dist/bundles/',
    emptyOutDir: false,
    sourcemap: false,
    target: 'esnext',
    lib: {
      formats: ['es'],
      entry: {
        index: resolve('./src/bundle.ts')
      }
    },
    rolldownOptions: {
      output: {
        format: 'esm',
        assetFileNames: `index.[ext]`,
        entryFileNames: `index.js`,
        chunkFileNames: '[name].js'
      },
      plugins: [
        dtsBundle(),
        minifyHTML(),
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
