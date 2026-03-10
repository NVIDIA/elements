import fs from 'fs';
import process from 'process';
import terser from '@rollup/plugin-terser';
import { resolve } from 'path';
import { globSync } from 'glob';
import minifyHTML from 'rollup-plugin-html-literals';

import { tsc } from '../plugins/tsc.js';
import { cem } from '../plugins/cem.js';
import { snippets } from '../plugins/snippets.js';
import { dts } from '../plugins/dts.js';
import { bundle } from '../plugins/bundle.js';
import { initial } from '../plugins/initial.js';
import { examplesToJSON } from '../plugins/examples.js';
import { writeIfChanged } from '../plugins/write-if-changed.js';

const index = process.argv.findIndex(i => i === '--outDir') + 1;
const dist = (p = '') => `${index ? process.argv[index] : './dist'}/${p}`;
const prod = process.env.NODE_ENV === 'production';
const packageFilePath = fs.readFileSync(resolve(process.cwd(), './package.json'));
const packageFile = JSON.parse(packageFilePath);

/**
 * - https://vitejs.dev/config/
 * - https://lit.dev/docs/tools/production/
 * @type {import('vite').UserConfig}
 */
export const libraryBuildConfig = {
  plugins: [initial(), tsc(), dts(), bundle(), examplesToJSON(packageFile), cem(), snippets()],
  build: {
    reportCompressedSize: false,
    cssMinify: prod ? 'esbuild' : false,
    cssCodeSplit: true,
    minify: false, // https://github.com/vitejs/vite/issues/8848
    outDir: dist(),
    emptyOutDir: false,
    sourcemap: prod,
    target: 'esnext',
    lib: {
      entry: {
        index: resolve(process.cwd(), './src/index.ts'),
        ...[
          ...globSync('./src/**/*.examples.ts'),
          ...globSync('./src/**/define.ts'),
          ...globSync('./src/**/server.ts'),
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
          entryFileNames: '[name].js',
          importAttributesKey: 'with'
        }
      ],
      plugins: [
        prod ? false : writeIfChanged(),
        prod ? minifyHTML() : false,
        prod
          ? terser({ module: true, format: { comments: false }, compress: { ecma: 2020, unsafe: true, passes: 2 } })
          : false // https://github.com/vitejs/vite/issues/8848
      ]
    }
  },
  esbuild: {
    platform: 'neutral' // https://github.com/evanw/esbuild/issues/2649
  }
};
