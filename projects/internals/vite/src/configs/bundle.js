import fs from 'fs';
import process from 'process';
import terser from '@rollup/plugin-terser';
import { minifyHTML } from '../plugins/minify-html.js';
import { resolve } from 'path';

const packageFile = JSON.parse(fs.readFileSync(resolve(process.cwd(), './package.json')));

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
    sourcemap: true,
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
        assetFileNames: `index.${packageFile.version}.[ext]`,
        entryFileNames: `index.${packageFile.version}.js`,
        inlineDynamicImports: false,
        chunkFileNames: info => `${info.name ? info.name : 'index'}.${packageFile.version}.js`
      },
      plugins: [
        minifyHTML(),
        terser({ module: true, format: { comments: false }, compress: { ecma: 2020, unsafe: true, passes: 2 } })
      ]
    }
  }
};
