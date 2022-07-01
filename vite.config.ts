import { defineConfig } from 'vite';
import minifyHTML from 'rollup-plugin-minify-html-literals';
import execute from 'rollup-plugin-shell';
import { terser } from 'rollup-plugin-terser';
import { dependencies, optionalDependencies } from './package.json';
import process from 'process';
import path from 'path';

const index = process.argv.findIndex((i) => i === '--outDir') + 1;
const outDir = index ? process.argv[index] : './dist';
const resolve = (rel) => path.resolve(__dirname, rel);

// https://vitejs.dev/config/
// https://lit.dev/docs/tools/production/
export default defineConfig((env) => {
  const mode = env.mode as 'production' | 'watch' | 'test' | 'development';

  return {
    resolve: {
      alias: {
        // alias to match package.json exports during local development
        '@elements/elements/css': resolve('./dist/css'),
        '@elements/elements/assets': resolve('./dist/assets'),
        '@elements/elements/custom-elements.json': resolve('./dist/custom-elements.json'),
        '@elements/elements': resolve(mode !== 'test' ? './src' : './dist') // tests should run against final build artifacts not source
      }
    },
    build: {
      watch: mode === 'watch' ? {} : undefined,
      outDir,
      emptyOutDir: false,
      target: 'esnext',
      sourcemap: true,
      lib: { entry: resolve('./src/index.ts'), formats: ['es'] },
      rollupOptions: {
        treeshake: false,
        preserveEntrySignatures: 'strict',
        external: [...Object.keys(dependencies || {}), ...Object.keys(optionalDependencies || {})].map((packageName) => new RegExp(`^${packageName}(/.*)?`)),
        output: [
          {
            format: 'es',
            preserveModules: true,
            entryFileNames: (module) =>
              module.facadeModuleId?.includes('.css') ? `${module.name}.css.js` : `${module.name}.js`
          }
        ],
        plugins: [
          execute({ commands: [`./node_modules/@custom-elements-manifest/analyzer/index.js analyze --litelement ${mode === 'watch' ? '--watch' : ''} --globs src/**/*.ts --exclude **.stories.ts --outdir ${outDir}`], hook: 'generateBundle', sync: true }),
          mode === 'production' ? execute({ commands: [`./node_modules/typescript/bin/tsc --project tsconfig.lib.json --outdir ${outDir}`], hook: 'generateBundle', sync: true }) : false,
          mode === 'production' ? (minifyHTML as any).default() : false, // https://github.com/asyncLiz/rollup-plugin-minify-html-literals/issues/24
          mode === 'production' ? terser({ ecma: 2020, module: true }) : false
        ]
      }
    },
    test: {
      globals: true,
      environment: 'happy-dom',
      watchExclude: ['**/node_modules/**']
    }
  };
});
