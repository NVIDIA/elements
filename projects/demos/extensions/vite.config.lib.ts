import fs from 'fs';
import path from 'path';
import process from 'process';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import glob from 'glob';

const packageFile = JSON.parse(fs.readFileSync(new URL('./package.json', import.meta.url)) as any);
const resolve = rel => path.resolve(process.cwd(), rel);
const index = process.argv.findIndex(i => i === '--outDir') + 1;
const dist = (p = '') => `${index ? process.argv[index] : './dist'}/${p}`;

export default defineConfig(env => {
  return {
    resolve: {
      alias: {
        'extensions-elements-starter': resolve('./src')
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
      minify: false,
      watch: env.mode === 'watch' ? {} : undefined,
      outDir: dist(),
      emptyOutDir: false,
      target: 'esnext',
      lib: {
        entry: {
          index: resolve('./src/index.ts'),
          ...glob.sync('./src/**/define.ts').reduce((p, i) => {
            // all component entrypoints
            return { ...p, [i.replace('./src/', '').replace('.ts', '')]: resolve(i) };
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
        ]
      }
    }
  };
});
