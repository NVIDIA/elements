import fs from 'fs';
import path from 'path';
import process from 'process';
import { defineConfig } from 'vite';
import terser from '@rollup/plugin-terser';
import minifyHTML from 'rollup-plugin-minify-html-literals';
import dts from 'vite-plugin-dts';
import { globSync } from 'glob';

const packageFile = JSON.parse(fs.readFileSync(new URL('./package.json', import.meta.url)) as any);
const resolve = rel => path.resolve(process.cwd(), rel);
const index = process.argv.findIndex(i => i === '--outDir') + 1;
const dist = (p = '') => `${index ? process.argv[index] : './dist'}/${p}`;

// https://vitejs.dev/config/
// https://lit.dev/docs/tools/production/
export default defineConfig(env => {
  const mode = env.mode as 'production' | 'watch' | 'test' | 'development';

  return {
    resolve: {
      alias: {
        '@nvidia-elements/core': resolve('./src'),
        '@elements/elements': resolve('./src')
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
      sourcemap: true,
      target: 'esnext',
      lib: {
        entry: {
          index: resolve('./src/index.ts'), // imports all independent component entrypoints
          'internal/index': resolve('./src/internal/index.ts'), // internal utilities for @nvidia-elements/core
          'scoped/index': resolve('./src/scoped/index.ts'), // utilities for scoping elements
          'polyfills/index': resolve('./src/polyfills/index.ts'), // optional polyfills for non-chromium envs
          'test/index': resolve('./src/test/index.ts'), // internal testing utilities for @nvidia-elements/core
          'css/module.typography.css': resolve('./src/css/module.typography.css'), // base typography styles
          'css/module.layout.css': resolve('./src/css/module.layout.css'), // layout utilities
          'css/module.responsive.css': resolve('./src/css/module.responsive.css'), // responsive layout utilities
          'index.css': resolve('./src/index.css'), // global styles including all above style modules
          ...globSync('./src/**/define.ts').reduce((p, i) => {
            // all component entrypoints
            return { ...p, [i.replace('src/', '').replace('.ts', '')]: resolve(i) };
          }, {})
        }
      },
      rollupOptions: {
        treeshake: false,
        preserveEntrySignatures: 'strict',
        external: [
          ...Object.keys(packageFile.dependencies || {}),
          ...Object.keys(packageFile.optionalDependencies || {})
        ].map(packageName => new RegExp(`^${packageName}(/.*)?`)),
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
          mode === 'production' ? (minifyHTML as any).default() : false, // https://github.com/asyncLiz/rollup-plugin-minify-html-literals/issues/24
          mode === 'production'
            ? terser({ module: true, format: { comments: false }, compress: { ecma: 2020, unsafe: true, passes: 2 } })
            : false // https://github.com/vitejs/vite/issues/8848
        ]
      }
    }
  };
});
