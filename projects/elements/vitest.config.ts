import { defineConfig } from 'vitest/config';
import path from 'path';

let alias: any;
if (process.argv.findIndex(i => i === '--coverage') !== -1) {
  alias = { '@elements/elements': path.resolve(__dirname, './src') };
} else if (!process.env['BAZEL_WORKSPACE']) {
  alias = { '@elements/elements': path.resolve(__dirname, './dist') };
}

export default defineConfig({
  test: {
    alias,
    include: ['./src/**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/cypress/**', '**/.{idea,git,output,temp}/**'],
    environment: 'happy-dom',
    deps: { inline: process.env['BAZEL_WORKSPACE'] ? true : undefined },
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