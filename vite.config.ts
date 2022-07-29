import fs from 'fs';
import path from 'path';
import process from 'process';
import { defineConfig } from 'vite';
import { terser } from 'rollup-plugin-terser';
import execute from 'rollup-plugin-shell';
import minifyHTML from 'rollup-plugin-minify-html-literals';
import { dependencies, optionalDependencies } from './package.json';
import { buildTokens } from './tokens/style-dictionary.config.js';

const index = process.argv.findIndex((i) => i === '--outDir') + 1;
const outDir = index ? process.argv[index] : './dist';
const resolve = (rel) => path.resolve(__dirname, rel);

buildTokens(resolve(`./${outDir}/`));

// https://vitejs.dev/config/
// https://lit.dev/docs/tools/production/
export default defineConfig((env) => {
  const mode = env.mode as 'production' | 'watch' | 'test' | 'development';

  return {
    resolve: {
      alias: {
        '../dist/css/module.tokens.css': resolve(`./${outDir}/css/module.tokens.css`),
        '../dist/css/theme.dark.css': resolve(`./${outDir}/css/theme.dark.css`),
        '../dist/css/theme.compact.css': resolve(`./${outDir}/css/theme.compact.css`),
        '../dist/css/theme.high-contrast.css': resolve(`./${outDir}/css/theme.high-contrast.css`),
        '@elements/elements': resolve(mode !== 'test' ? './src' : './dist') // tests should run against final build artifacts not source
      }
    },
    build: {
      cssCodeSplit: true,
      watch: mode === 'watch' ? {} : undefined,
      outDir,
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
              fs.mkdirSync(resolve(`./${outDir}/css/`), { recursive: true });
              fs.readdirSync(outDir)
                .filter(f => f.startsWith('module.') && f.endsWith('.css'))
                .forEach(file => fs.rename(`./${outDir}/${file}`, resolve(`./${outDir}/css/${file}`), (e) => e ? console.log(e) : null));
            }
          },
          execute({ commands: [`./node_modules/typescript/bin/tsc --project ${resolve('./tsconfig.lib.json')} --outdir ${outDir}`], hook: 'generateBundle', }),
          execute({ commands: [`./node_modules/@custom-elements-manifest/analyzer/index.js analyze ${mode === 'watch' ? '--quiet' : ''} --litelement --globs ./src --exclude **.stories.ts --outdir ${outDir}`], hook: 'generateBundle' }),
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
