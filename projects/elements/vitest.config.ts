import { defineConfig } from 'vitest/config';
import path from 'path';
import process from 'process';
import glob from 'glob';

const coverage = (process.argv.findIndex((i) => i === '--coverage') !== -1);
const base = coverage ? 'src' : 'dist';
const entries = glob.sync('./src/**/define.ts')
  .map(path => path.replace('./src', 'src').replace('.ts', '.js'))
  .reduce((p, i) => ({ ...p, [i]: path.resolve(__dirname, i.replace('src', base).replace('.js', coverage ? '.ts' : '.js')) }), { });

export default defineConfig({
  test: {
    alias: {
      '@elements/elements': `./${base}`,
      ...entries
    },
    include: ['./src/**/*.test.ts'],
    forceRerunTriggers: ['**/dist/**'],
    watchExclude: ['**/node_modules/**'],
    exclude: ['**/node_modules/**'],
    environment: 'happy-dom',
    deps: { external: ['**/node_modules/**'] },
    setupFiles: [path.resolve(__dirname, './src/test/setup.ts')], // https://github.com/vitest-dev/vitest/issues/1700
    coverage: {
      lines: 90,
      branches: 90,
      functions: 90,
      statements: 90,
      exclude: ['**/storybook/**', '**/test/**', '**/*.test.ts', '**/*.css.js', '**/*.css', '**/index.js']
    }
  }
});