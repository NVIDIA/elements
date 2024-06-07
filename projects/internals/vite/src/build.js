import fs from 'fs';
import process from 'process';
import terser from '@rollup/plugin-terser';
import minifyHTML from 'rollup-plugin-minify-html-literals';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';
import { globSync } from 'glob';

const index = process.argv.findIndex(i => i === '--outDir') + 1;
const dist = (p = '') => `${index ? process.argv[index] : './dist'}/${p}`;
const mode = process.env.NODE_ENV;
const packageFile = JSON.parse(fs.readFileSync(resolve(process.cwd(), './package.json')));

/**
 * - https://vitejs.dev/config/
 * - https://lit.dev/docs/tools/production/
 * @type {import('vite').UserConfig}
 */
export const libraryBuildConfig = {
  plugins: [
    dts({
      copyDtsFiles: true,
      tsconfigPath: resolve(process.cwd(), './tsconfig.lib.json')
    })
  ],
  build: {
    cssCodeSplit: true,
    minify: false, // https://github.com/vitejs/vite/issues/8848
    watch: mode === 'watch' ? {} : undefined,
    outDir: dist(),
    emptyOutDir: false,
    sourcemap: true,
    target: 'esnext',
    lib: {
      entry: {
        index: resolve(process.cwd(), './src/index.ts'),
        ...[
          ...globSync('./src/**/define.ts'),
          ...globSync('./src/**/index.ts'),
          ...globSync('./src/**/index.tsx')
        ].reduce((p, i) => {
          // all component entrypoints
          return { ...p, [i.replace('src/', '').replace('.tsx', '').replace('.ts', '')]: resolve(process.cwd(), i) };
        }, {})
      }
    },
    rollupOptions: {
      preserveEntrySignatures: 'strict',
      external: [
        ...Object.keys(packageFile.dependencies || {}),
        ...Object.keys(packageFile.peerDependencies || {}),
        ...Object.keys(packageFile.optionalDependencies || {})
      ].map(packageName => new RegExp(`^${packageName}(/.*)?`)),
      output: [
        {
          format: 'esm',
          preserveModules: true,
          assetFileNames: '[name].[ext]',
          entryFileNames: '[name].js'
        }
      ],
      plugins: [
        mode === 'production' ? minifyHTML.default() : false, // https://github.com/asyncLiz/rollup-plugin-minify-html-literals/issues/24
        mode === 'production'
          ? terser({ module: true, format: { comments: false }, compress: { ecma: 2020, unsafe: true, passes: 2 } })
          : false // https://github.com/vitejs/vite/issues/8848
      ]
    }
  }
};
