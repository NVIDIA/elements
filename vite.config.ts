import fs from 'fs';
import path from 'path';
import process from 'process';
import { defineConfig } from 'vite';
import { terser } from 'rollup-plugin-terser';
import { execSync } from 'child_process';
import minifyHTML from 'rollup-plugin-minify-html-literals';
import dts from 'vite-plugin-dts';

const packageFile = JSON.parse(fs.readFileSync(new URL('./package.json', import.meta.url)) as any);
const resolve = (rel) => path.resolve(process.cwd(), rel);
const index = process.argv.findIndex((i) => i === '--outDir') + 1;
const dist = (p = '') => `${index ? process.argv[index] : './dist'}/${p}`;

// https://vitejs.dev/config/
// https://lit.dev/docs/tools/production/
export default defineConfig((env) => {
  const mode = env.mode as 'production' | 'watch' | 'test' | 'development';
  const testProdBuild = mode === 'test' && !(process.argv.findIndex((i) => i === '--coverage') !== -1);

  execSync(`./node_modules/@custom-elements-manifest/analyzer/index.js analyze ${mode === 'watch' ? '--quiet' : ''} --litelement --globs ./src --exclude **.stories.ts --outdir ${dist()}`);

  if (mode !== 'test') {
    execSync(`node ${resolve('./tokens/style-dictionary.config.cjs')} --outDir ${dist()}`);
  }

  return {
    resolve: {
      alias: {
        '../dist': dist(),
        '@elements/elements': resolve(testProdBuild ? dist() : './src') // tests should run against final build artifacts not source
      }
    },
    plugins: [
      {
        ...dts({
          tsConfigFilePath: './tsconfig.lib.json',
          root: resolve('.'),
          entryRoot: resolve('./src'),
          outputDir: dist(),
          staticImport: true,
          noEmitOnError: true,
          skipDiagnostics: false,
          logDiagnostics: true
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
      target: 'esnext',
      lib: { entry: resolve('./src/entrypoints.ts'), formats: ['es'] },
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
            entryFileNames: (module) => module.facadeModuleId?.includes('.css?') ? '[name].css.js' : '[name].js'
          }
        ],
        plugins: [
          {
            name: 'https://github.com/vitejs/vite/issues/8057',
            closeBundle() {
              fs.readdirSync(dist())
                .filter(f => f !== 'index.css' && f.endsWith('.css'))
                .forEach(file => fs.renameSync(dist(file), dist(`css/${file}`)));
            }
          },
          mode === 'production' ? (minifyHTML as any).default() : false, // https://github.com/asyncLiz/rollup-plugin-minify-html-literals/issues/24
          mode === 'production' ? terser({ ecma: 2020, module: true }) : false // https://github.com/vitejs/vite/issues/8848
        ]
      }
    }
  };
});
