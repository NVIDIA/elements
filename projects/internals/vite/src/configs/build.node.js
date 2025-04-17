import { builtinModules } from 'node:module';
import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import { globSync } from 'glob';

import { tsc } from '../plugins/tsc.js';
import { dts } from '../plugins/dts.js';

const NODE_BUILT_IN_MODULES = builtinModules.filter(m => !m.startsWith('_'));
NODE_BUILT_IN_MODULES.push(...NODE_BUILT_IN_MODULES.map(m => `node:${m}`));

const index = process.argv.findIndex(i => i === '--outDir') + 1;
const dist = (p = '') => `${index ? process.argv[index] : './dist'}/${p}`;
const mode = process.env.NODE_ENV;
const packageFile = JSON.parse(readFileSync(resolve(process.cwd(), './package.json')));

/**
 * - https://vitejs.dev/config/
 * - https://lit.dev/docs/tools/production/
 * @type {import('vite').UserConfig}
 */
export const libraryNodeBuildConfig = {
  optimizeDeps: {
    exclude: NODE_BUILT_IN_MODULES
  },
  plugins: [tsc(), dts()],
  build: {
    minify: false, // https://github.com/vitejs/vite/issues/8848
    watch: mode === 'watch' ? {} : undefined,
    outDir: dist(),
    emptyOutDir: false,
    sourcemap: false,
    minify: false,
    target: 'esnext',
    lib: {
      entry: {
        index: resolve(process.cwd(), './src/index.ts'),
        ...[...globSync('./src/**/index.ts')].reduce((p, i) => {
          // all component entrypoints
          return { ...p, [i.replace('src/', '').replace('.ts', '')]: resolve(process.cwd(), i) };
        }, {})
      }
    },
    rollupOptions: {
      preserveEntrySignatures: 'strict',
      external: [
        ...NODE_BUILT_IN_MODULES,
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
      ]
    }
  }
};
