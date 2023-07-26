import fs from 'fs';
import path from 'path';
import process from 'process';
import { defineConfig } from 'vite';
import terser from '@rollup/plugin-terser';
import { execSync } from 'child_process';
import minifyHTML from 'rollup-plugin-minify-html-literals';
import replace from '@rollup/plugin-replace';
import dts from 'vite-plugin-dts';
import glob from 'glob';

const packageFile = JSON.parse(fs.readFileSync(new URL('./package.json', import.meta.url)) as any);
const resolve = (rel) => path.resolve(process.cwd(), rel);
const index = process.argv.findIndex((i) => i === '--outDir') + 1;
const dist = (p = '') => `${index ? process.argv[index] : './dist'}/${p}`;

// https://vitejs.dev/config/
// https://lit.dev/docs/tools/production/
export default defineConfig((env) => {
  const mode = env.mode as 'production' | 'watch' | 'test' | 'development';
  execSync(`node ./node_modules/@custom-elements-manifest/analyzer/cem.js analyze ${mode === 'watch' ? '--quiet' : ''} --config ./custom-elements-manifest.config.mjs --outdir ${dist()}`);
  execSync(`node ${resolve('./tokens/style-dictionary.config.cjs')} --outDir ${resolve('./')}/dist/`);
  execSync(`node ${resolve('./build/css-var-completions.js')}`);
  execSync(`node ${resolve('./build/vscode-custom-data.js')}`);

  return {
    resolve: {
      alias: {
        '@elements/elements': resolve('./src'), // tests should run against final build artifacts not source
        '../dist/css/module.tokens.css': resolve('./dist/css/module.tokens.css'),
        '../dist/css/theme.high-contrast.css': resolve('./dist/css/theme.high-contrast.css'),
        '../dist/css/theme.reduced-motion.css': resolve('./dist/css/theme.reduced-motion.css'),
        '../dist/css/theme.compact.css': resolve('./dist/css/theme.compact.css'),
        '../dist/css/theme.dark.css': resolve('./dist/css/theme.dark.css')
      }
    },
    plugins: [
      {
        ...dts({
          tsconfigPath: './tsconfig.lib.json',
          root: resolve('.'),
          entryRoot: resolve('./src'),
          outDir: dist()
        }),
        enforce: 'pre'
      }
    ],
    build: {
      cssCodeSplit: true,
      minify: false, // https://github.com/vitejs/vite/issues/8848
      watch: mode === 'watch' ? {} : undefined,
      outDir: dist(),
      emptyOutDir: false,
      target: 'es2021', // temporarily blocked on using esnext or es2022 due to Webpack in IDE plugins https://github.com/webpack/webpack/issues/16330
      lib: {
        entry: {
          index: resolve('./src/index.ts'),                                    // imports all independent component entrypoints
          'internal/index': resolve('./src/internal/index.ts'),                // internal utilities for @elements/elements
          'scoped/index': resolve('./src/scoped/index.ts'),                    // utilities for scoping elements
          'polyfills/index': resolve('./src/polyfills/index.ts'),                // optional polyfills for non-chromium envs
          'test/index': resolve('./src/test/index.ts'),                        // internal testing utilities for @elements/elements
          'css/module.typography': resolve('./src/css/module.typography.css'), // base typography styles
          'css/module.layout': resolve('./src/css/module.layout.css'),         // layout utilities
          'css/module.reset': resolve('./src/css/module.reset.css'),           // common reset/base styles
          'index.css': resolve('./src/index.css'),                             // global styles including all above style modules
          ...glob.sync('./src/**/define.ts').reduce((p, i) => {                 // all component entrypoints
            return { ...p, [i.replace('./src/', '').replace('.ts', '')]: resolve(i) };
          }, { })
        }
      },
      rollupOptions: {
        treeshake: false,
        preserveEntrySignatures: 'strict',
        external: [...Object.keys(packageFile.dependencies || {}), ...Object.keys(packageFile.optionalDependencies || {})].map((packageName) => new RegExp(`^${packageName}(/.*)?`)),
        output: [
          {
            format: 'esm',
            sourcemap: true,
            preserveModules: true,
            assetFileNames: '[name].[ext]',
            entryFileNames: '[name].js'
          }
        ],
        plugins: [
          {
            name: 'https://github.com/vitejs/vite/issues/8057',
            closeBundle() {
              fs.readdirSync(dist())
                .filter(f => f.endsWith('.css') && (f.includes('module.') || f.includes('theme.')))
                .forEach(file => fs.renameSync(dist(file), dist(`css/${file}`)));
            }
          },
          replace({ preventAssignment: false, values: { PACKAGE_VERSION: packageFile.version }}),
          mode === 'production' ? (minifyHTML as any).default() : false, // https://github.com/asyncLiz/rollup-plugin-minify-html-literals/issues/24
          mode === 'production' ? terser({ ecma: 2020, module: true }) : false // https://github.com/vitejs/vite/issues/8848
        ]
      }
    }
  };
});
