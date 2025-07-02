import fs from 'fs';
import path from 'path';
import process from 'process';
import { defineConfig } from 'vite';
import terser from '@rollup/plugin-terser';
import minifyHTML from 'rollup-plugin-html-literals';
import dts from 'vite-plugin-dts';
import { globSync } from 'glob';

const packageFile = JSON.parse(fs.readFileSync(new URL('./package.json', import.meta.url)) as any);
const resolve = rel => path.resolve(process.cwd(), rel);
const index = process.argv.findIndex(i => i === '--outDir') + 1;
const dist = (p = '') => `${index ? process.argv[index] : './dist'}/${p}`;

export default defineConfig(env => {
  const mode = env.mode as 'production' | 'watch' | 'test' | 'development';

  return {
    resolve: {
      alias: {
        'lit-library-starter': resolve('./src')
      }
    },
    plugins: [
      {
        ...dts({
          root: resolve('.'),
          entryRoot: resolve('./src'),
          outDir: dist(),
          exclude: ['**/*.test.ts', '**/*.stories.ts']
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
          index: resolve('./src/index.ts'),
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
          mode === 'production' ? minifyHTML() : false,
          mode === 'production'
            ? terser({ module: true, format: { comments: false }, compress: { ecma: 2020, unsafe: true, passes: 2 } })
            : false // https://github.com/vitejs/vite/issues/8848
        ]
      }
    }
  };
});
