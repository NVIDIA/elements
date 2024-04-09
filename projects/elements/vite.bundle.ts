import path from 'path';
import { defineConfig } from 'vite';
import terser from '@rollup/plugin-terser';
import packageFile from './package.json';

const resolve = rel => path.resolve(process.cwd(), rel);

export default defineConfig(() => {
  return {
    resolve: {
      alias: {
        '@nvidia-elements/core': resolve('./dist')
      }
    },
    build: {
      minify: false, // https://github.com/vitejs/vite/issues/8848
      outDir: 'dist/bundles/',
      emptyOutDir: false,
      sourcemap: true,
      target: 'esnext',
      lib: {
        formats: ['es'],
        name: 'bundle',
        entry: {
          bundles: resolve('./src/bundles/bundle.ts')
        }
      },
      rollupOptions: {
        output: {
          assetFileNames: `elements.${packageFile.version}.bundle.[ext]`,
          entryFileNames: `elements.${packageFile.version}.bundle.js`,
          inlineDynamicImports: false,
          chunkFileNames: info => `elements.${packageFile.version}.bundle.${info.name}${info.name ? '.' : ''}js`,
          manualChunks: id => (id.includes('dist/icon/icons') ? 'icons' : 'all')
        }
      },
      plugins: [
        terser({ module: true, format: { comments: false }, compress: { ecma: 2020, unsafe: true, passes: 2 } })
      ]
    }
  };
});
