import fs from 'fs';
import path from 'path';
import process from 'process';
import { defineConfig } from 'vite';
import { terser } from 'rollup-plugin-terser';
import execute from 'rollup-plugin-shell';
import minifyHTML from 'rollup-plugin-minify-html-literals';
import dts from 'vite-plugin-dts';
import { dependencies, optionalDependencies } from './package.json';
import { buildTokens } from './tokens/style-dictionary.config.js';

const resolve = (rel) => path.resolve(process.cwd(), rel);
const index = process.argv.findIndex((i) => i === '--outDir') + 1;
const dist = (p = '') => `${index ? process.argv[index] : './dist'}/${p}`;

// https://vitejs.dev/config/
// https://lit.dev/docs/tools/production/
export default defineConfig((env) => {
  const mode = env.mode as 'production' | 'watch' | 'test' | 'development';

  if (mode !== 'test') {
    buildTokens(dist());
  }

  return {
    resolve: {
      alias: {
        '../dist/css/module.tokens.css': dist(`css/module.tokens.css`),
        '../dist/css/theme.dark.css': dist(`css/theme.dark.css`),
        '../dist/css/theme.compact.css': dist(`css/theme.compact.css`),
        '../dist/css/theme.high-contrast.css': dist(`css/theme.high-contrast.css`),
        '@elements/elements': resolve(mode !== 'test' ? './src' : dist()) // tests should run against final build artifacts not source
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
      watch: mode === 'watch' ? {} : undefined,
      outDir: dist(),
      emptyOutDir: false,
      target: 'esnext',
      sourcemap: true,
      lib: { entry: resolve('./src/entrypoints.ts'), formats: ['es'] },
      rollupOptions: {
        treeshake: false,
        preserveEntrySignatures: 'strict',
        external: [...Object.keys(dependencies || {}), ...Object.keys(optionalDependencies || {})].map((packageName) => new RegExp(`^${packageName}(/.*)?`)),
        output: [
          {
            format: 'esm',
            preserveModules: true,
            entryFileNames: (module) =>
              module.facadeModuleId?.includes('.css?') ? '[name].css.js' : '[name].js'
          }
        ],
        plugins: [
          {
            name: 'https://github.com/vitejs/vite/issues/8057',
            closeBundle() {
              fs.mkdirSync(dist('css'), { recursive: true });
              fs.readdirSync(dist())
                .filter(f => f !== 'index.css' && f.endsWith('.css'))
                .forEach(file => fs.rename(dist(file), dist(`css/${file}`), (e) => e ? console.log(e) : null));
            }
          },
          execute({ commands: [`./node_modules/@custom-elements-manifest/analyzer/index.js analyze ${mode === 'watch' ? '--quiet' : ''} --litelement --globs ./src --exclude **.stories.ts --outdir ${dist()}`], hook: 'generateBundle' }),
          mode === 'production' ? (minifyHTML as any).default() : false, // https://github.com/asyncLiz/rollup-plugin-minify-html-literals/issues/24
          mode === 'production' ? terser({ ecma: 2020, module: true }) : false
        ]
      }
    },
    test: {
      globals: true,
      environment: 'happy-dom',
      watchExclude: ['**/node_modules/**'],
      coverage: {
        lines: 90,
        branches: 90,
        functions: 90,
        statements: 90,
        exclude: ['**/storybook/**', '**/test/**', '**/*.test.ts', '**/*.css.js', '**/index.js']
      }
    }
  };
});
