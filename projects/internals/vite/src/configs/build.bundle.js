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
      treeshake: true,
      output: {
        minify: true,
        codeSplitting: false,
        format: 'esm',
        assetFileNames: `index.[ext]`,
        entryFileNames: `index.js`,
        chunkFileNames: '[name].js'
      },
      plugins: [
        dtsBundle(),
        minifyHTML(),
        // Bundle visualization is expensive, so packages must explicitly opt in.
        process.env.CI === 'true' &&
          process.env.ELEMENTS_BUNDLE_VISUALIZER === 'true' &&
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
