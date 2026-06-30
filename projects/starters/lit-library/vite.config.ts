import fs from 'node:fs';
import { resolve as resolvePath } from 'node:path';
import process from 'node:process';
import { defineConfig } from 'vite';
import minifyHTML from 'rollup-plugin-html-literals';
import dts from 'unplugin-dts/vite';
import { globSync } from 'glob';

const getAbsolutePath = (file: string) => resolvePath(process.cwd(), file);
const packageFile = JSON.parse(fs.readFileSync(getAbsolutePath('./package.json'), 'utf-8'));
const index = process.argv.findIndex(i => i === '--outDir') + 1;
const dist = (p = '') => `${index ? process.argv[index] : './dist'}/${p}`;
const prod = process.env.NODE_ENV === 'production';

export default defineConfig(({ mode }) => {
  return {
    resolve: {
      alias: {
        'lit-library-starter': getAbsolutePath('./src')
      }
    },
    plugins: [
      {
        ...dts({
          root: getAbsolutePath('.'),
          entryRoot: getAbsolutePath('./src'),
          exclude: ['**/*.test.ts', '**/*.test.*.ts', '**/*.examples.ts']
        }),
        enforce: 'pre'
      }
    ],
    build: {
      reportCompressedSize: false,
      cssCodeSplit: true,
      minify: true,
      watch: mode === 'watch' ? {} : undefined,
      outDir: dist(),
      emptyOutDir: true,
      sourcemap: prod,
      target: 'esnext',
      lib: {
        entry: Object.fromEntries(
          [
            './src/index.ts',
            ...globSync('./src/**/index.ts', { ignore: ['./src/index.ts'] }),
            ...globSync('./src/**/define.ts')
          ].map(file => [file.replace(/^\.?\/?src\//, '').replace(/\.ts$/, ''), getAbsolutePath(file)])
        )
      },
      rolldownOptions: {
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
        plugins: [prod ? minifyHTML() : false]
      }
    }
  };
});
