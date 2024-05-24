import fs from 'fs';
import path from 'path';
import process from 'process';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

const packageFile = JSON.parse(fs.readFileSync(new URL('./package.json', import.meta.url)) as any);
const resolve = rel => path.resolve(process.cwd(), rel);
const index = process.argv.findIndex(i => i === '--outDir') + 1;
const dist = (p = '') => `${index ? process.argv[index] : './dist'}/${p}`;

export default defineConfig(env => {
  const mode = env.mode as 'production' | 'watch' | 'test' | 'development';

  return {
    lib: {},
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
      sourcemap: true,
      target: 'esnext',
      lib: {
        entry: {
          index: resolve('./src/index.ts'),
          vite: resolve('./src/vite.ts'),
          ['vite-setup']: resolve('./src/vite-setup.ts')
        }
      },
      rollupOptions: {
        treeshake: false,
        preserveEntrySignatures: 'strict',
        external: [
          ...[
            ...Object.keys(packageFile.dependencies || {}),
            ...Object.keys(packageFile.optionalDependencies || {}),
            ...Object.keys(packageFile.peerDependencies || {})
          ].map(packageName => new RegExp(`^${packageName}(/.*)?`)),
          'fs',
          'path'
        ],
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
