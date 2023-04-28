import { defineConfig } from 'vitest/config';
import path from 'path';
import process from 'process';
import glob from 'glob';

const resolve = (rel) => path.resolve(process.cwd(), rel);
const coverage = (process.argv.findIndex((i) => i === '--coverage') !== -1);
const base = coverage ? 'src' : 'dist';
const entries = glob.sync('./src/**/define.ts')
  .map(path => path.replace('.ts', '.js'))
  .reduce((p, i) => ({ ...p, [i.replace('./src', '@elements/elements').replace('/index.js', '')]: resolve(i.replace('src', base)).replace('.js', coverage ? '.ts' : '.js') }), { });

export default defineConfig({
  test: {
    root: resolve('.'),
    alias: {
      ...entries,
      '@elements/elements/test': resolve(`./${base}/test`),
      '@elements/elements/internal': resolve(`./${base}/internal`),
      '@elements/elements/scoped': resolve(`./${base}/scoped`),
      '@elements/elements': resolve(`./${base}`),
    },
    include: [resolve('./src/**/*.test.ts')],
    forceRerunTriggers: ['**/dist/**'],
    watchExclude: ['**/node_modules/**'],
    // Default includes '.cache' which fails under Bazel as its sandbox lives in such a folder.
    exclude: ['**/node_modules/**'],
    // CPU detection on CI fails due to K8s/Docker.
    maxThreads: 8,
    minThreads: 8,
    deps: { external: ['**/node_modules/**'] },
    setupFiles: [resolve('./src/test/setup.ts')], // https://github.com/vitest-dev/vitest/issues/1700
    coverage: {
      reportsDirectory: resolve('./coverage'),
      reporter: ['lcov', 'html', 'json-summary'],
      lines: 90,
      branches: 90,
      functions: 90,
      statements: 90,
      exclude: ['**/storybook/**', '**/test/**', '**/*.test.ts', '**/*.css.js', '**/*.css', '**/index.js', '**/src/icon/icons/**', '**/src/icon/icons.ts']
    }
  }
});