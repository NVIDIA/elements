import { resolve } from 'path';
import { mergeConfig } from 'vitest/config';
import { libraryNodeTestConfig } from '@internals/vite/configs/test.node.js';

export default mergeConfig(libraryNodeTestConfig, {
  root: import.meta.dirname,
  resolve: {
    alias: { '@internals/tools': resolve(import.meta.dirname, './src') }
  },
  plugins: [
    {
      name: 'markdown-loader',
      transform(code, id) {
        if (id.split('?')[0].endsWith('.md')) {
          return `export default ${JSON.stringify(code)};`;
        }
      }
    }
  ],
  test: {
    include: ['./src/**/*.test.ts'],
    coverage: {
      thresholds: {
        lines: 90,
        branches: 90,
        functions: 90,
        statements: 90
      }
    }
  }
});
